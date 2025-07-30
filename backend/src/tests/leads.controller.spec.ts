import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from '../controllers/leads.controller';
import { LeadsService } from '../services/leads.service';
import { RedisService } from '../services/redis.service';
import { TokenService } from '../services/token.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LeadsController', () => {
  let controller: LeadsController;
  let leadsService: LeadsService;

  const mockLeadsService = {
    getLeadsWithFields: jest.fn().mockResolvedValue(['lead1', 'lead2']),
    getLead: jest.fn().mockResolvedValue({ id: 1, name: 'Lead' }),
    getRelatedItems: jest.fn().mockResolvedValue(['task1', 'deal1']),
    createLead: jest.fn().mockResolvedValue({ id: 1 }),
    updateLead: jest.fn().mockResolvedValue({ updated: true }),
    deleteLead: jest.fn().mockResolvedValue({ deleted: true }),
    Searchbykey: jest.fn().mockResolvedValue(['matched-lead']),
  };

  const mockRedisService = {}; // You can mock methods here if needed
  const mockTokenService = {
    loadTokens: jest.fn().mockResolvedValue({
      access_token: 'mock_token',
      client_endpoint: 'https://example.bitrix24.com/rest/',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [
        { provide: LeadsService, useValue: mockLeadsService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    controller = module.get<LeadsController>(LeadsController);
    leadsService = module.get<LeadsService>(LeadsService);
    controller.tokenService = mockTokenService; // inject manually
  });

  it('should list leads', async () => {
    const result = await controller.list({});
    expect(result).toEqual(['lead1', 'lead2']);
    expect(leadsService.getLeadsWithFields).toHaveBeenCalled();
  });

  it('should get lead by id', async () => {
    const result = await controller.get('1');
    expect(result).toEqual({ id: 1, name: 'Lead' });
    expect(leadsService.getLead).toHaveBeenCalledWith('1');
  });

  it('should get related items', async () => {
    const result = await controller.getRelated('TestLead');
    expect(result).toEqual(['task1', 'deal1']);
  });

  it('should create a lead', async () => {
    const result = await controller.create({ name: 'New Lead' });
    expect(result).toEqual({ id: 1 });
  });

  it('should update a lead', async () => {
    const result = await controller.update('1', { name: 'Updated' });
    expect(result).toEqual({ updated: true });
  });

  it('should delete a lead', async () => {
    const result = await controller.remove('1');
    expect(result).toEqual({ deleted: true });
  });

  it('should search from cache', async () => {
    const result = await controller.searchFromCache({ keyword: 'test' });
    expect(result).toEqual(['matched-lead']);
  });

  it('should get tasks by lead id', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        result: { tasks: ['task-a', 'task-b'] },
      },
    });

    const result = await controller.getTasks('123');
    expect(result).toEqual(['task-a', 'task-b']);
    expect(mockTokenService.loadTokens).toHaveBeenCalled();
  });

  it('should get deals by lead id', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        result: ['deal1', 'deal2'],
      },
    });

    const result = await controller.getDeals('123');
    expect(result).toEqual(['deal1', 'deal2']);
  });
});
