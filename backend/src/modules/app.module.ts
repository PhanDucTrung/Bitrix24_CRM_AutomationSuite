import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { LeadsModule } from './leads.module';
import { AuthModule } from './auth.module';
import { RedisModule} from './redis.module';
import { WebhookModule} from './webhook.module';
import { HttpModule } from '@nestjs/axios';
import { AnalyticsModule } from '../modules/analytics.module';


@Module({
  imports: [
    LeadsModule,
    RedisModule,
    HttpModule,
    AuthModule,
    WebhookModule,
    AnalyticsModule
 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
