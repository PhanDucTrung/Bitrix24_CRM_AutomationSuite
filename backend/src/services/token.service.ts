import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs';
import axios from 'axios';

@Injectable()
export class TokenService {
  private readonly TOKEN_FILE = 'token.json';

  /**
   * Lưu tokens vào file, giữ nguyên định dạng Bitrix
   */
  async saveTokens(tokens: any): Promise<void> {
    await fs.writeFile(this.TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf8');
  }

  /**
   * Đọc token từ file
   */
  async loadTokens(): Promise<any | null> {
    try {
      const content = await fs.readFile(this.TOKEN_FILE, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      return null;
    }
  }

  /**
   * Refresh access_token bằng refresh_token
   */
  async refreshToken(): Promise<string> {
    const tokens = await this.loadTokens();

    if (!tokens?.refresh_token) {
      throw new InternalServerErrorException('Không có refresh_token. Vui lòng cài đặt lại ứng dụng.');
    }

    try {
      const res = await axios.post('https://oauth.bitrix.info/oauth/token', null, {
        params: {
          grant_type: 'refresh_token',
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          refresh_token: tokens.refresh_token,
        },
      });

      // Bitrix sẽ trả lại access_token + expires + refresh_token mới
      await this.saveTokens(res.data);
      return res.data.access_token;
    } catch (err) {
      console.error('[TokenService] Refresh token thất bại:', err);
      await fs.unlink(this.TOKEN_FILE).catch(() => {});
      throw new InternalServerErrorException('Refresh token thất bại. Vui lòng cài đặt lại ứng dụng.');
    }
  }

  /**
   * Lấy access_token hợp lệ, tự refresh nếu token đã hết hạn
   */
  async getAccessToken(): Promise<string> {
    const tokens = await this.loadTokens();

    if (!tokens?.access_token || !tokens?.expires) {
       return this.refreshToken();
    }

    const now = Math.floor(Date.now() / 1000);

    if (tokens.expires <= now) {
      // Token đã hết hạn → refresh
      return this.refreshToken();
    }

    return tokens.access_token;
  }
}
