import { Module } from '@nestjs/common';
import { Analyticcontroller } from '../controllers/analytics.controller';
import { LeadsService } from '../services/leads.service';
import { TokenService } from '../services/token.service';
import { AuthModule } from './auth.module';
import { HttpModule } from '@nestjs/axios';
import { RedisService } from 'src/services/redis.service';
import { AnalyticsService } from '../services/analytics.service';

@Module({
  imports: [HttpModule,AuthModule],
   providers: [LeadsService, TokenService,RedisService,AnalyticsService],
   controllers: [Analyticcontroller],
})
export class AnalyticsModule {}
