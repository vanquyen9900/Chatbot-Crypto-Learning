// src/lib/binanceMarket.ts

export type CoinMeta = {
  id: string;
  name: string;
  symbol: string; // BTC
  pair: string;   // BTCUSDT
  logo?: string;  // ✅ icon/logo URL (SVG/PNG)
};

// ✅ Logo coin (SVG) – nhẹ, nét, dùng production
// Bạn có thể đổi sang nguồn khác nếu muốn.
const COIN_LOGOS: Record<string, string> = {
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
  BNB: "https://cryptologos.cc/logos/bnb-bnb-logo.svg",
  SOL: "https://cryptologos.cc/logos/solana-sol-logo.svg",
  ADA: "https://cryptologos.cc/logos/cardano-ada-logo.svg",
  XRP: "https://cryptologos.cc/logos/xrp-xrp-logo.svg",
  DOT: "https://cryptologos.cc/logos/polkadot-new-dot-logo.svg",
  AVAX: "https://cryptologos.cc/logos/avalanche-avax-logo.svg",
};

// ✅ fallback: nếu không có logo thì dùng “first letter badge”
export function getCoinLogo(symbol: string): string | undefined {
  return COIN_LOGOS[symbol.toUpperCase()];
}

export const COINS: CoinMeta[] = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", pair: "BTCUSDT", logo: COIN_LOGOS.BTC },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", pair: "ETHUSDT", logo: COIN_LOGOS.ETH },
  { id: "binancecoin", name: "BNB", symbol: "BNB", pair: "BNBUSDT", logo: COIN_LOGOS.BNB },
  { id: "solana", name: "Solana", symbol: "SOL", pair: "SOLUSDT", logo: COIN_LOGOS.SOL },
  { id: "cardano", name: "Cardano", symbol: "ADA", pair: "ADAUSDT", logo: COIN_LOGOS.ADA },
  { id: "ripple", name: "XRP", symbol: "XRP", pair: "XRPUSDT", logo: COIN_LOGOS.XRP },
  { id: "polkadot", name: "Polkadot", symbol: "DOT", pair: "DOTUSDT", logo: COIN_LOGOS.DOT },
  { id: "avalanche", name: "Avalanche", symbol: "AVAX", pair: "AVAXUSDT", logo: COIN_LOGOS.AVAX },
];

export type MarketRow = {
  id: string;
  name: string;
  symbol: string;
  pair: string;
  logo?: string;     // ✅ thêm để UI render
  price: number;     // lastPrice
  change24h: number; // priceChangePercent
  volume24h: number; // quoteVolume (USDT)
};

export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return (n / 1e12).toFixed(2).replace(/\.00$/, "") + "T";
  if (abs >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (abs >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toFixed(0);
}

export function formatUsd(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export async function fetchBinance24h(
  pairs: string[]
): Promise<
  Record<
    string,
    {
      lastPrice: number;
      changePct: number;
      quoteVolume: number;
    }
  >
> {
  const url =
    "https://api.binance.com/api/v3/ticker/24hr?symbols=" +
    encodeURIComponent(JSON.stringify(pairs));

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance REST failed (${res.status})`);

  const arr = (await res.json()) as Array<{
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    quoteVolume: string;
  }>;

  const map: Record<string, { lastPrice: number; changePct: number; quoteVolume: number }> = {};
  for (const r of arr) {
    map[r.symbol] = {
      lastPrice: Number(r.lastPrice),
      changePct: Number(r.priceChangePercent),
      quoteVolume: Number(r.quoteVolume),
    };
  }
  return map;
}
