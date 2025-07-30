import { Module } from '@nestjs/common';
import { WebhookController } from '../controllers/webhook.controller';
import { WebhookService } from '../services/webhook.service';
import { LeadProcessor } from '../processors/lead.processor';
import { TokenService } from '../services/token.service';
import { BullModule } from '@nestjs/bull';
;
@Module({
  
  controllers: [WebhookController],
  providers: [WebhookService,LeadProcessor, TokenService],
   imports: [
       BullModule.forRoot({
         redis: { host: 'localhost', port: 6379 },
       }),
       BullModule.registerQueue({ name: 'lead' }),  

      
     ],
})
export class WebhookModule {}
