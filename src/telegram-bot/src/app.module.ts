import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot_module/bot.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [    
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.docker', '.env'],
    }),BotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
