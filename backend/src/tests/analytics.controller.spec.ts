// test/analytics.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { Analyticcontroller } from './analytics.controller';
import { AnalyticsService } from '../services/analytics.service';

describe('AnalyticsController', () => {
  let controller: Analyticcontroller;
  let service: AnalyticsService;

  const mockService = {
    getLeadAnalytics: jest.fn().mockResolvedValue({ NEW: 1 }),
    getDealAnalytics: jest.fn().mockResolvedValue({ revenue: 1000 }),
    getTaskAnalytics: jest.fn().mockResolvedValue({ completed: 5 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Analyticcontroller],
      providers: [
        { provide: AnalyticsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<Analyticcontroller>(Analyticcontroller);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should return lead analytics', async () => {
    const result = await controller.getLeadAnalytics();
    expect(result).toEqual({ NEW: 1 });
    expect(service.getLeadAnalytics).toHaveBeenCalled();
  });

  it('should return deal analytics', async () => {
    const result = await controller.getDealAnalytics();
    expect(result).toEqual({ revenue: 1000 });
    expect(service.getDealAnalytics).toHaveBeenCalled();
  });

  it('should return task analytics', async () => {
    const result = await controller.getTaskAnalytics();
    expect(result).toEqual({ completed: 5 });
    expect(service.getTaskAnalytics).toHaveBeenCalled();
  });
});
