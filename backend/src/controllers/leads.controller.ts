import {Controller, Get,Post,Patch,Delete,Query,Param,Body,HttpException,HttpStatus, NotFoundException} from '@nestjs/common';
import { LeadsService } from '../services/leads.service';
import { RedisService } from '../services/redis.service';
import axios from 'axios';

@Controller('api/leads')
export class LeadsController {
  [x: string]: any;
  constructor(
    private readonly leadsService: LeadsService,
   private readonly redisService: RedisService) {}

  @Get()
  async list(@Query() query: any) {
    try {
      return await this.leadsService.getLeadsWithFields(query);
    } catch (error) {
      throw new HttpException('Lỗi lấy danh sách leads', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/edit')
  async get(@Param('id') id: string) {
    try {
    
   const data= await this.leadsService.getLead(id);
   return data;

    } catch (error) {
      throw new HttpException('Lỗi lấy leads', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
  @Get(':name/related')
  async getRelated(@Param('name') name: string) {

    console.log(name);
    return this.leadsService.getRelatedItems(name);
  }


  @Post()
  async create(@Body() body: any) {
    try {
    return await this.leadsService.createLead(body);
    } catch (error) {
      throw new HttpException('Lỗi tạo lead', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.leadsService.updateLead(id, body);
    } catch (error) {
      throw new HttpException('Lỗi cập nhật lead', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.leadsService.deleteLead(id);
    } catch (error) {
      throw new HttpException('Lỗi xóa lead', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

@Get('search')
async searchFromCache(@Query() query: any) {
 try {
      return await this.leadsService.Searchbykey(query);
    } catch (error) {
      throw new HttpException('Lỗi không search dc ', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

@Get(':id/tasks')
async getTasks(@Param('id') leadId: string) {
  const tokens = await this.tokenService.loadTokens();
  const response = await axios.post(`${tokens.client_endpoint}tasks.task.list`, null, {
    params: {
      auth: tokens.access_token,
      filter: { TITLE: `%${leadId}%` }, // hoặc lưu TASK_ID vào lead cache để truy ngược
    },
  });
  return response.data.result.tasks;
}

@Get(':id/deals')
async getDeals(@Param('id') leadId: string) {

  const tokens = await this.tokenService.loadTokens();
  const response = await axios.post(`${tokens.client_endpoint}crm.deal.list`, null, {
    params: {
      auth: tokens.access_token,
      filter: { LEAD_ID: leadId },
    },
  });
  return response.data.result;
}


}
