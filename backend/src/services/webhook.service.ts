import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectQueue('lead') private readonly leadQueue: Queue,
  
  ) {}

  async handleLeadWebhook(payload: any) {
    const event = payload.event;
    console.log(event);
    console.log(payload);
    if (event === 'ONCRMLEADADD') {
      await this.leadQueue.add('create-task', { leadId: payload.data.FIELDS.ID });
    }

    if (event === 'ONCRMLEADUPDATE') {

      console.log("ok");
      await this.leadQueue.add('create-deal', { leadId: payload.data.FIELDS.ID });
    }

    return { status: 'queued' };
  }

  verifySignature(payload: any, signature: string): boolean {
    const secret = process.env.BITRIX_SECRET || 'your-secret';
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return hash === signature;
  }
}
