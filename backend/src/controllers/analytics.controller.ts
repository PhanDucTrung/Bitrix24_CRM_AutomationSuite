import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';


@Controller('api/analytics')
export class Analyticcontroller {
  constructor(private readonly analyticsService: AnalyticsService) {}
@Get('leads')
getLeadAnalytics() {
  return this.analyticsService.getLeadAnalytics();
}

@Get('deals')
getDealAnalytics() {
  return this.analyticsService.getDealAnalytics();
}

@Get('tasks')
getTaskAnalytics() {
  return this.analyticsService.getTaskAnalytics();
}

}
