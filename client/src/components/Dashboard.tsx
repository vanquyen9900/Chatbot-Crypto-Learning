import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Users, ArrowRight, Wallet, BarChart3 } from "lucide-react";
import { COINS, fetchBinance24h, formatCompact, type MarketRow, getCoinLogo } from "../lib/binanceMarket";

interface DashboardProps {
  onNavigate: (page: "dashboard" | "market" | "trading" | "news" | "community") => void;
  virtualBalance: number;
  holdings: Record<string, number>; // key = coinId (vd: "bitcoin"), value = amount
}

export function Dashboard({ onNavigate, virtualBalance, holdings }: DashboardProps) {
  const [rows, setRows] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Lấy dữ liệu realtime từ Binance (poll 10s)
  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setError(null);
        const pairs = COINS.map((c) => c.pair);
        const data = await fetchBinance24h(pairs);

        const next: MarketRow[] = COINS.map((c) => ({
          id: c.id,
          name: c.name,
          symbol: c.symbol,
          pair: c.pair,
          logo: c.logo ?? (typeof getCoinLogo === "function" ? getCoinLogo(c.symbol) : undefined),
          price: data[c.pair]?.lastPrice ?? 0,
          change24h: data[c.pair]?.changePct ?? 0,
          volume24h: data[c.pair]?.quoteVolume ?? 0,
        }));

        if (alive) setRows(next);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Fetch error");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    const t = window.setInterval(load, 10_000);

    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, []);

  // map coinId -> market row
  const rowById = useMemo(() => {
    const map = new Map<string, MarketRow>();
    for (const r of rows) map.set(r.id, r);
    return map;
  }, [rows]);

  // ✅ Tính tổng giá trị portfolio theo giá realtime
  const portfolioValue = useMemo(() => {
    let total = 0;
    for (const [coinId, amount] of Object.entries(holdings)) {
      const r = rowById.get(coinId);
      const price = r?.price ?? 0;
      const amt = Number(amount);
      if (Number.isFinite(amt) && Number.isFinite(price)) {
        total += amt * price;
      }
    }
    return total;
  }, [holdings, rowById]);

  const totalValue = virtualBalance + portfolioValue;

  // ✅ Đếm số loại coin đang nắm giữ (amount > 0)
  const numHoldings = useMemo(() => {
    return Object.values(holdings).filter((a) => Number(a) > 0).length;
  }, [holdings]);

  // ✅ Top coins: lấy từ rows theo volume24h (nếu chưa có rows thì fallback COINS)
  const topCoins = useMemo(() => {
    const list = rows.length
      ? [...rows].sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0)).slice(0, 4)
      : COINS.slice(0, 4).map((c) => ({
          id: c.id,
          name: c.name,
          symbol: c.symbol,
          pair: c.pair,
          logo: c.logo ?? (typeof getCoinLogo === "function" ? getCoinLogo(c.symbol) : undefined),
          price: 0,
          change24h: 0,
          volume24h: 0,
        }));

    return list;
  }, [rows]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-bold text-black">Chào mừng đến với CoinSight</h1>
        <p className="text-lg text-black/60">Học và thực hành đầu tư coin an toàn với tiền ảo (giá realtime từ Binance)</p>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="mb-6 rounded-xl border border-black/10 bg-white p-4 text-sm text-black/60">
          Đang tải dữ liệu realtime...
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Lỗi tải dữ liệu: {error}
        </div>
      )}

      {/* Portfolio Overview */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm text-black/60">
            <Wallet className="h-4 w-4" />
            Số dư khả dụng
          </div>
          <div className="text-3xl font-bold text-black">
            ${virtualBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm text-black/60">
            <BarChart3 className="h-4 w-4" />
            Giá trị đầu tư
          </div>
          <div className="text-3xl font-bold text-black">
            ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-sm text-black/60">{numHoldings} loại coin đang nắm giữ</div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-2 text-sm text-black/60">Tổng giá trị</div>
          <div className="text-3xl font-bold text-black">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div
          onClick={() => onNavigate("market")}
          className="cursor-pointer rounded-xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#9EEC37]/20">
            <TrendingUp className="h-6 w-6 text-black" />
          </div>
          <h3 className="mb-2 font-bold text-black">Thị trường</h3>
          <p className="mb-4 text-sm text-black/60">Theo dõi giá và biến động 24h (poll 10s)</p>
          <div className="flex items-center gap-2 text-sm font-medium text-black">
            Xem thị trường <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        <div
          onClick={() => onNavigate("trading")}
          className="cursor-pointer rounded-xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#9EEC37]/20">
            <BarChart3 className="h-6 w-6 text-black" />
          </div>
          <h3 className="mb-2 font-bold text-black">Giao dịch ảo</h3>
          <p className="mb-4 text-sm text-black/60">Thực hành mua bán coin với tiền ảo theo giá realtime</p>
          <div className="flex items-center gap-2 text-sm font-medium text-black">
            Bắt đầu giao dịch <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        <div
          onClick={() => onNavigate("community")}
          className="cursor-pointer rounded-xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#9EEC37]/20">
            <Users className="h-6 w-6 text-black" />
          </div>
          <h3 className="mb-2 font-bold text-black">Cộng đồng</h3>
          <p className="mb-4 text-sm text-black/60">Kết nối và chia sẻ chiến lược</p>
          <div className="flex items-center gap-2 text-sm font-medium text-black">
            Tham gia ngay <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Top Coins */}
      <div className="mb-10 rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-black">Coin được quan tâm hôm nay</h2>
          <button onClick={() => onNavigate("market")} className="text-sm font-medium text-black/60 hover:text-black">
            Xem tất cả →
          </button>
        </div>

        <div className="space-y-4">
          {topCoins.map((coin) => (
            <div
              key={coin.id}
              className="flex items-center justify-between rounded-lg border border-black/5 p-4 transition-colors hover:bg-black/5"
            >
              <div className="flex items-center gap-4">
                {coin.logo ? (
                  <img
                    src={coin.logo}
                    alt={coin.symbol}
                    className="h-10 w-10 rounded-full bg-[#9EEC37]/20 p-1"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9EEC37]/20 font-medium text-black">
                    {coin.symbol[0]}
                  </div>
                )}

                <div>
                  <div className="font-medium text-black">{coin.name}</div>
                  <div className="text-sm text-black/60">{coin.symbol}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-black">
                  {coin.price > 0
                    ? `$${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "—"}
                </div>
                <div className={`text-sm ${coin.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {coin.price > 0 ? (
                    <>
                      {coin.change24h >= 0 ? "+" : ""}
                      {coin.change24h.toFixed(2)}%
                      <span className="ml-2 text-black/40">Vol: ${formatCompact(coin.volume24h)}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started Guide */}
      <div>
        <h2 className="mb-6 font-bold text-black">Bắt đầu với CoinSight</h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Khám phá thị trường", desc: "Xem giá và xu hướng của các coin", cta: "Xem thị trường", page: "market" as const },
            { step: "2", title: "Thực hành giao dịch", desc: "Mua bán coin với tiền ảo", cta: "Bắt đầu", page: "trading" as const },
            { step: "3", title: "Tham gia cộng đồng", desc: "Chia sẻ và học hỏi từ cộng đồng", cta: "Tham gia", page: "community" as const },
          ].map((item) => (
            <div key={item.step} className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9EEC37] font-bold text-black">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-medium text-black">{item.title}</h4>
                  <p className="text-sm text-black/60">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate(item.page)}
                className="rounded-lg border border-black/10 bg-white px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-black/5"
              >
                {item.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
