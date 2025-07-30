import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
