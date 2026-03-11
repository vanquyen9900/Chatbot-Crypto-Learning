import { BinanceService } from '../../binance/binance.service';

let BINANCE_SYMBOLS: string[] = [];

// load toàn bộ coin từ Binance khi server start
export async function loadBinanceSymbols(
  binanceService: BinanceService
) {

  BINANCE_SYMBOLS = await binanceService.getAvailableCoins();

}

// extract coin từ câu hỏi
export function extractSymbol(message: string): string | null {

  const words = message
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .split(/\s+/);
  console.log("WORDS:", words);
  for (const word of words) {

    if (BINANCE_SYMBOLS.includes(word)) {
      return word;
    }

  }

  return null;

}