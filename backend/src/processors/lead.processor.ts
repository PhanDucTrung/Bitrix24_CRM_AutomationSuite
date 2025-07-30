import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import axios from 'axios';
import { TokenService } from '../services/token.service';

@Processor('lead')
export class LeadProcessor {
  constructor(private readonly tokenService: TokenService) {}

  @Process('create-task')
  async handleNewLead(job: Job) {
    const { leadId } = job.data;
    
    const tokens = await this.tokenService.loadTokens();
  
    // Gọi API để lấy chi tiết lead
    const res = await axios.post(`${tokens.client_endpoint}crm.lead.get`, null, {
      params: {
        auth: tokens.access_token,
        id: leadId,
      },
    });

    const lead = res.data.result;
    // Gọi user.get để lấy danh sách người dùng và áp dụng round-robin

  const userRes = await axios.post(`${tokens.client_endpoint}user.get`, null, {
    params: { auth: tokens.access_token },
  });

      const users = userRes.data.result.filter(u => u.ACTIVE === true);
 
     const selectedUser = users[leadId % users.length]; // Round-robin đơn giản
    
    // Tạo task
const taskRes = await axios.post(`${tokens.client_endpoint}tasks.task.add`, null, {
  params: {
    auth: tokens.access_token,
    fields: {
      TITLE: `Follow up Lead: ${lead.TITLE}`,
      CREATED_BY: selectedUser.ID,
      PARENTID:leadId,
      DESCRIPTION: `PHONE: ${lead.PHONE?.[0]?.VALUE}, EMAIL: ${lead.EMAIL?.[0]?.VALUE}, SOURCE: ${lead.SOURCE_ID}`,
      RESPONSIBLE_ID: selectedUser.ID,
    },
  },
});

    // Gửi email hoặc thông báo
const notifyRes = await axios.post(`${tokens.client_endpoint}im.notify.system.add`, null, {
  params: {
    auth: tokens.access_token,
    USER_ID: selectedUser.ID,
    MESSAGE: `Bạn được giao task cho lead: ${lead.TITLE}`,
  },
});

console.log("Notify response:", notifyRes.data);

  }

  @Process('create-deal')
  async handleUpdatedLead(job: Job) {
    const { leadId } = job.data;
    const tokens = await this.tokenService.loadTokens();

    // Kiểm tra trạng thái
    const res = await axios.post(`${tokens.client_endpoint}crm.lead.get`, null, {
      params: {
        auth: tokens.access_token,
        id: leadId,
      },
    });

    const lead = res.data.result;

    if (lead.STATUS_ID === 'CONVERTED') {
      // Tạo deal
      await axios.post(`${tokens.client_endpoint}crm.deal.add`, null, {
        params: {
          auth: tokens.access_token,
          fields: {
            TITLE: `Deal from lead: ${lead.TITLE}`,
            CONTACT_ID: lead.CONTACT_ID,
            STAGE_ID: 'NEW',
          },
        },
      });

    }
  }
}





