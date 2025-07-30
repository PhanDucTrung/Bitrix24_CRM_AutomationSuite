import { Controller, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';

@Controller('api/webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('lead')
  async handleWebhook(
    
    @Body() payload: any,
    @Headers('x-bitrix-signature') signature: string,
  ) {
   

    return this.webhookService.handleLeadWebhook(payload);
  }
}
