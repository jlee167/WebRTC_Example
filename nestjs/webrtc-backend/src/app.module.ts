import { Module } from '@nestjs/common';
import { AppController, ViewController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController, ViewController],
  providers: [AppService],
})
export class AppModule {}
