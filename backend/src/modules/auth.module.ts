import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

@Module({
  imports: [
    HttpModule, 
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService],
  exports: [TokenService],
})
export class AuthModule {}
