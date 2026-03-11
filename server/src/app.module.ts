import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { IntentModule } from './intent/intent.module';
import { BinanceModule } from './binance/binance.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    KnowledgeModule,
    IntentModule,
    BinanceModule,
    AiModule,
    ChatModule,
  ],
})
export class AppModule {}