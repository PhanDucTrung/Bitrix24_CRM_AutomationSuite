import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../controllers/auth.controller';
import { TokenService } from '../services/token.service';
import { Response } from 'express';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthController', () => {
  let controller: AuthController;
  let tokenService: TokenService;

  const mockTokenService = {
    saveTokens: jest.fn().mockResolvedValue({ access_token: 'token123', refresh_token: 'refresh123' }),
  };

  const mockRes: Partial<Response> = {
    redirect: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: TokenService, useValue: mockTokenService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    // Mock biến môi trường
    process.env.BITRIX_DOMAIN = 'example.bitrix24.vn';
    process.env.CLIENT_ID = 'client123';
    process.env.CLIENT_SECRET = 'secret123';
    process.env.REDIRECT_URI = 'http://localhost:3000/callback';
  });

  it('should redirect to Bitrix OAuth on install', () => {
    controller.install(mockRes as Response);

    const expectedUrl =
      'https://example.bitrix24.vn/oauth/authorize?client_id=client123&response_type=code&redirect_uri=http://localhost:3000/callback';

    expect(mockRes.redirect).toHaveBeenCalledWith(expectedUrl);
  });

  it('should return 400 if no code in callback', async () => {
    await controller.callback('', mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith('Missing code');
  });

  it('should exchange code and save tokens on callback', async () => {
    const mockTokenData = { access_token: 'access123', refresh_token: 'refresh123' };

    mockedAxios.post.mockResolvedValueOnce({ data: mockTokenData });

    await controller.callback('authcode123', mockRes as Response);

    expect(mockTokenService.saveTokens).toHaveBeenCalledWith(mockTokenData);
    expect(mockRes.send).toHaveBeenCalledWith(
      `Tokens saved: <pre>${JSON.stringify(mockTokenData, null, 2)}</pre>`
    );
  });
});
