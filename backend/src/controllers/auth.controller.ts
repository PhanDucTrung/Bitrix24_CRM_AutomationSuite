import { Controller, Get, Query, Res } from '@nestjs/common';
import axios from 'axios';
import { TokenService } from '../services/token.service';
import { Response } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly tokenservice: TokenService) {}

  @Get('install')
  install(@Res() res: Response) {
    const redirectUrl = `https://${process.env.BITRIX_DOMAIN}/oauth/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}`;
    res.redirect(redirectUrl);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    if (!code) return res.status(400).send('Missing code');

      const response = await axios.post('https://oauth.bitrix.info/oauth/token', null, {
      params: {
        grant_type: 'authorization_code', 
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET, 
        redirect_uri: process.env.REDIRECT_URI, 
        code }
    });
      const tokens=  await this.tokenservice.saveTokens(response.data);
   
    res.send(`Tokens saved: <pre>${JSON.stringify(tokens, null, 2)}</pre>`);
  }
}
