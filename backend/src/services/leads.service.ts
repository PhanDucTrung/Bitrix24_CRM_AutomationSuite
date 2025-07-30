import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Redis from 'ioredis';
import Bottleneck from 'bottleneck';
import { TokenService } from '../services/token.service';
import { RedisService } from '../services/redis.service';
import axios from 'axios';


@Injectable()
export class LeadsService {
  private readonly redis = new Redis();
  private readonly limiter = new Bottleneck({ minTime: 500 }); // ~2 req/s

  constructor(
    private readonly httpService: HttpService,
    private readonly tokenService: TokenService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Lấy danh sách lead với cache
   */
 
 async getLeadsWithFields(query: any): Promise<any> {
      // const cacheKey = 'bitrix:leads:cache';
  try {
    let tokens = await this.tokenService.loadTokens();

    if (!tokens || !tokens.access_token || !tokens.client_endpoint) {
       tokens =await this.tokenService.refreshToken();
    }
const params = new URLSearchParams();

params.append('order[DATE_CREATE]', query.sort || 'DESC');
if (query.search) {
  params.append('filter[TITLE]', query.search);
}
    
    params.append('select[]', 'ID');
    params.append('select[]', 'TITLE');
    params.append('select[]', 'NAME');
    params.append('select[]', 'STATUS_ID');
    params.append('select[]', 'OPPORTUNITY');
    params.append('select[]', 'DATE_CREATE');
    params.append('select[]', 'SOURCE_ID');
    params.append('select[]', 'COMMENTS');
    params.append('select[]', 'EMAIL');
    params.append('select[]', 'PHONE');
        // Gọi API batch

const response = await axios.post(`${tokens.client_endpoint}batch`, null, {
  params: {
    auth: tokens.access_token,
    cmd: {
      getLeads: `crm.lead.list?${params.toString()}`,
      getFields: 'crm.lead.fields',
    },
  },
})

    const result = response.data.result.result;
    const leads = result.getLeads.map((lead: any) => ({
          ID: lead.ID,
          TITLE: lead.TITLE,
          NAME: lead.NAME,
          STATUS_ID: lead.STATUS_ID,
          DATE_CREATE:lead.DATE_CREATE,
          SOURCE_ID: lead.SOURCE_ID,
          OPPORTUNITY: lead.OPPORTUNITY||0,
          COMMENTS: lead.COMMENTS||'không có comment',
          EMAIL: lead.EMAIL?.[0].VALUE || 'không có ',
          PHONE: lead.PHONE?.[0].VALUE || 'không có',
        }));
    const customFields = result.getFields || {};

    const uniqueStatusIds = [...new Set(leads.map((lead) => lead.STATUS_ID).filter(Boolean))];
    const uniqueSourceIds = [...new Set(leads.map((lead) => lead.SOURCE_ID).filter(Boolean))];
await this.redisService.setObject('leads_cache', leads, 600);

    return { leads, customFields,uniqueSourceIds,uniqueStatusIds };
  } catch (error: any) {
    console.error('❌ Lỗi khi gọi batch API:', error.response?.data || error.message);
    throw error;
  }
}

  /**
   * Thêm lead mới
   */
  async createLead(data: any): Promise<any> {
  
    return this.callBitrix('crm.lead.add', { fields: data });
  }

  /**
   * Cập nhật lead
   */
  async updateLead(id: string, data: any): Promise<any> {
    return this.callBitrix('crm.lead.update', { id, fields: data });
  }

  /**
   * Xoá lead
   */
  async deleteLead(id: string): Promise<any> {
    return this.callBitrix('crm.lead.delete', { id });
  }
  async getLead(id: string): Promise<any> {
    return this.callBitrix('crm.lead.get', { id });
  }

  /**
   * Gọi API Bitrix
   */
  public async callBitrix(method: string, params: any): Promise<any> {
    const token = await this.tokenService.getAccessToken();
    const url = `https://${process.env.BITRIX_DOMAIN}/rest/${method}`;

    const response = await this.limiter.schedule(() =>
      firstValueFrom(
        this.httpService.post(
          url,
          params,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ),
    );

    if (response.data.error) {
      throw new HttpException(response.data.error_description || 'Bitrix API error', HttpStatus.BAD_REQUEST);
    }

    return response.data.result;
  }


 async Searchbykey(query: any): Promise<any> {
     const cacheKey = 'leads_cache';

  const cachedLeads = await this.redisService.getObject<any[]>(cacheKey);
  if (!cachedLeads) throw new Error('Không có cache !');

  let leads = cachedLeads;


  const uniqueStatusIds = [...new Set(leads.map((lead) => lead.STATUS_ID).filter(Boolean))];
  const uniqueSourceIds = [...new Set(leads.map((lead) => lead.SOURCE_ID).filter(Boolean))];


  // --- 1. Tìm kiếm từ khóa ---
  if (query.keyword) {
    const keyword = query.keyword.toLowerCase();
    leads = leads.filter(lead =>
      [lead.TITLE, lead.NAME, lead.EMAIL, lead.PHONE].some(field =>
        (field || '').toLowerCase().includes(keyword)
      )
    );
  }

  // --- 2. Lọc theo STATUS_ID ---
  if (query.status) {
    leads = leads.filter(lead => lead.STATUS_ID === query.status);
  }

  // --- 3. Lọc theo SOURCE_ID ---
  if (query.source) {
    leads = leads.filter(lead => lead.SOURCE_ID === query.source);
  }

  // --- 4. Lọc theo DATE_CREATE (dạng ISO string hoặc YYYY-MM-DD) ---
  if (query.from || query.to) {
    leads = leads.filter(lead => {
      const date = new Date(lead.DATE_CREATE);
      const from = query.from ? new Date(query.from) : null;
      const to = query.to ? new Date(query.to) : null;
      return (!from || date >= from) && (!to || date <= to);
    });
  }

  // --- 5. Sắp xếp ---
  if (query.sortBy) {
    const field = query.sortBy;
    const order = (query.order || 'asc').toLowerCase(); // asc | desc

    leads.sort((a, b) => {
      const valA = (a[field] || '').toString().toLowerCase();
      const valB = (b[field] || '').toString().toLowerCase();
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

      return { leads,uniqueSourceIds,uniqueStatusIds };
  }
  




  
  async getRelatedItems(name: string) {
    const tokens = await this.tokenService.loadTokens();

    // 1. Lấy danh sách task liên quan
    const taskRes = await axios.post(`${tokens.client_endpoint}tasks.task.list`, null, {
      params: {
        auth: tokens.access_token,
        filter: {
          TITLE: `Follow up Lead: ${name}`
        }
      }
    });

    // 2. Lấy danh sách deal liên quan
    const dealRes = await axios.post(`${tokens.client_endpoint}crm.deal.list`, null, {
      params: {
        auth: tokens.access_token,
        filter: {
          TITLE: `Deal from lead: ${name}`
        }
      }
    });
  
    return {
      tasks: taskRes.data.result.tasks,
      deals: dealRes.data.result,
    };
  }
  
}
