import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { loadBinanceSymbols } from './chat/utils/symbol-extractor';
import { BinanceService } from './binance/binance.service';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const binanceService = app.get(BinanceService);
  await loadBinanceSymbols(binanceService);
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);

  console.log('🚀 Server running at http://localhost:3000');
}

bootstrap();