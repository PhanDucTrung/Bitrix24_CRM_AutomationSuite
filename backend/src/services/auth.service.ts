import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs/promises';



@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {}

  async exchangeCodeForToken(code: string) {
    const params = {
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      code,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post('https://oauth.bitrix.info/oauth/token', null, { params }),
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Ghi vào file token.json
      await this.saveTokensToFile({ access_token, refresh_token, expires_in, created_at: Date.now() });

      return { access_token, refresh_token, expires_in };
    } catch (error) {
      throw new HttpException('Failed to exchange code for token', 500);
    }
  }

  async saveTokensToFile(data: any) {
    const path = 'token.json';
    await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf8');
  }

  async loadTokensFromFile() {
    const path = 'token.json';
    try {
      const content = await fs.readFile(path, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
}
