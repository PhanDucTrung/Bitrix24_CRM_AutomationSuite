import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Redis from 'ioredis';
import Bottleneck from 'bottleneck';
import { TokenService } from '../services/token.service';
import { RedisService } from '../services/redis.service';
import axios from 'axios';
@Injectable()
export class AnalyticsService {
  constructor(
     private readonly httpService: HttpService,
    private readonly tokenService: TokenService,
    private readonly redisService: RedisService,
  ) {}

  async getLeadAnalytics() {

         const tokens = await this.tokenService.loadTokens();
  
    // Gọi API để lấy chi tiết lead
    const res = await axios.post(`${tokens.client_endpoint}crm.lead.list`, null, {
      params: {
        auth: tokens.access_token,
        select: ["STATUS_ID", "OPPORTUNITY" ],
      },
    });

    const leads = res.data.result;

    const counts = {
      NEW: 0,
      IN_PROGRESS: 0,
      PROGRESS: 0,
      CONVERTED: 0,
      LOST: 0,
    };

    for (const lead of leads) {
      counts[lead.STATUS_ID] = (counts[lead.STATUS_ID] || 0) + 1;
    }
    await this.redisService.setObject('counts', counts, 600);

    return counts

  }

  async getDealAnalytics() {


    const cacheKey = 'deal-analytics';

    const cachedanalytics = await this.redisService.getObject<any[]>(cacheKey);
    if (cachedanalytics) return cachedanalytics;

    const tokens = await this.tokenService.loadTokens();
    const params = new URLSearchParams();
    params.append('select[]', 'ID');
    params.append('select[]', 'OPPORTUNITY');
    params.append('select[]', 'DATE_CREATE');


      const paramlead = new URLSearchParams();
    paramlead.append('select[]', 'ID');
    paramlead.append('select[]', 'STATUS_ID');
        // Gọi API batch
   
const response = await axios.post(`${tokens.client_endpoint}batch`, null, {
  params: {
    auth: tokens.access_token,
    cmd: {
        getLeads: `crm.lead.list?${paramlead.toString()}`,
        getDeals: `crm.deal.list?${params.toString()}`,
    },
  },
})
const result = response.data.result.result;


    const deals = result.getDeals;
    const leads = result.getLeads;

    const convertedCount = leads.filter(l => l.STATUS_ID === 'CONVERTED').length;
    const totalLeads = leads.length;
    const conversionRate = totalLeads > 0 ? (convertedCount / totalLeads) * 100 : 0;

    const revenueByDate: Record<string, number> = {};

    for (const deal of deals) {
      const date = deal.DATE_CREATE.slice(0, 10);
      revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(deal.OPPORTUNITY);
    }
    await this.redisService.setObject('deal-analytics', { conversionRate, revenueByDate }, 900);
   
    return { conversionRate, revenueByDate };
  }

  async getTaskAnalytics() {

       const cacheKey = 'task-analytics';
     const cached = await this.redisService.getObject<any[]>(cacheKey);
    if (cached) return cached;

         const tokens = await this.tokenService.loadTokens();
    const res = await axios.post(`${tokens.client_endpoint}tasks.task.list`, null, {
      params: {
        auth: tokens.access_token,
        select: ['RESPONSIBLE_ID', 'STATUS',]
      },
    });

    const tasks = res.data.result.tasks;
           
    const completedByUser = {
    };

    for (const task of tasks) {
      if (task.status =='5') {
        completedByUser[task.responsible.name] = (completedByUser[task.responsible.name] || 0) + 1;
      }
    }

  await this.redisService.setObject('task-analytics', completedByUser, 900);

    return completedByUser;
  }
}

