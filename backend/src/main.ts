import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger } from '@nestjs/common';
import * as ngrok from 'ngrok';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT);



  const logger = new Logger('Bootstrap');
  logger.log(` Server running on http://localhost:${PORT}`);

  // 👇 Khởi động ngrok
  const ngrokUrl = await ngrok.connect({
    addr: PORT,
    authtoken: process.env.NGROK_AUTH_TOKEN,
  });

  logger.log(`Ngrok public URL: ${ngrokUrl}`);

  // 👇 Ghi lại REDIRECT_URI mới vào .env
  const envPath = '.env';
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  envConfig.REDIRECT_URI = `${ngrokUrl}/callback`;
  envConfig.BITRIX_WEBHOOK = `${ngrokUrl}/api/webhook/lead`;

  const updatedEnv = Object.entries(envConfig)
    .map(([key, val]) => `${key}=${val}`)
    .join('\n');

  fs.writeFileSync(envPath, updatedEnv);

  logger.log(`✅ REDIRECT_URI updated in .env: ${envConfig.REDIRECT_URI}`);
  logger.log(`✅ webhoook updated in .env: ${envConfig.BITRIX_WEBHOOK}`);
}

bootstrap();
