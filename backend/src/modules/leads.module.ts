import { Module } from '@nestjs/common';
import { LeadsController } from '../controllers/leads.controller';
import { LeadsService } from '../services/leads.service';
import { TokenService } from '../services/token.service';
import { AuthModule } from './auth.module';
import { HttpModule } from '@nestjs/axios';
import { RedisService } from 'src/services/redis.service';
import { LeadProcessor } from '../processors/lead.processor';


@Module({
  imports: [HttpModule,AuthModule],
  providers: [LeadsService, TokenService,RedisService],
  controllers: [LeadsController],
})
export class LeadsModule {}
