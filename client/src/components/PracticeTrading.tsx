import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { COINS, type CoinMeta } from '../lib/binanceMarket';
import { BinanceLikeChart } from './BinanceLikeChart';

interface PracticeTradingProps {
  virtualBalance: number;
  onBuy: (coinId: string, amount: number, price: number) => void;
  onSell: (coinId: string, amount: number, price: number) => void;
  initialCoinId?: string;
}

type Tf = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

type TickerSnap = {
  price: number;
  change24h: number;
};

export function PracticeTrading({
  virtualBalance,
  onBuy,
  onSell,
  initialCoinId,
}: PracticeTradingProps) {
  const [selectedCoin, setSelectedCoin] = useState<CoinMeta>(() => {
    if (initialCoinId) {
      const found = COINS.find((c) => c.id === initialCoinId);
      if (found) return found;
    }
    return COINS[0];
  });

  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [interval, setIntervalTf] = useState<Tf>('1m');

  // ✅ ticker per coin (key = pairLower, e.g. "btcusdt")
  const [tickers, setTickers] = useState<Record<string, TickerSnap>>({});

  const [notification, setNotification] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');

  const wsRef = useRef<WebSocket | null>(null);
  const notifTimerRef = useRef<number | null>(null);

  // ======= STATIC CLASSES (quan trọng để Tailwind build ra CSS) =======
  const coinBtnBase =
    'flex min-w-[210px] flex-col rounded-xl border p-4 transition-all';
  const coinBtnActive =
    'border-[#9EEC37] bg-[#9EEC37]/10';
  const coinBtnInactive =
    'border-black/10 bg-white hover:bg-black/5';

  const tfBtnBase =
    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors';
  const tfBtnActive =
    'bg-black text-white';
  const tfBtnInactive =
    'border border-black/10 bg-white text-black/60 hover:bg-black/5';

  const sideBtnBase =
    'flex-1 rounded-lg py-2.5 font-medium transition-colors';
  const buyBtnActive =
    'bg-[#9EEC37] text-black';
  const buyBtnInactive =
    'border border-black/10 bg-white text-black/60 hover:bg-black/5';
  const sellBtnActive =
    'border-2 border-black bg-white text-black';
  const sellBtnInactive =
    'border border-black/10 bg-white text-black/60 hover:bg-black/5';

  const quickBtn =
    'rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black/5';

  const submitBuy =
    'w-full rounded-lg bg-[#9EEC37] py-3 font-medium text-black transition-opacity hover:opacity-90';
  const submitSell =
    'w-full rounded-lg border-2 border-black bg-white py-3 font-medium text-black transition-colors hover:bg-black/5';
  // ================================================================

  const showNotification = (message: string) => {
    setNotification(message);
    if (notifTimerRef.current) window.clearTimeout(notifTimerRef.current);
    notifTimerRef.current = window.setTimeout(() => setNotification(null), 3000);
  };

  // sync selected coin from Market -> Trading
  useEffect(() => {
    if (!initialCoinId) return;
    const found = COINS.find((c) => c.id === initialCoinId);
    if (found) setSelectedCoin(found);
  }, [initialCoinId]);

  // ✅ One WS for ALL coins (combined stream)
  useEffect(() => {
    let alive = true;

    const streams = COINS
      .map((c) => `${c.pair.toLowerCase()}@ticker`)
      .join('/');

    const url = `wss://stream.binance.com/stream?streams=${streams}`;
    setWsStatus('connecting');

    // close old
    if (wsRef.current) {
      try {
        wsRef.current.onopen = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => alive && setWsStatus('open');
    ws.onclose = () => alive && setWsStatus('closed');
    ws.onerror = () => alive && setWsStatus('error');

    ws.onmessage = (event) => {
      if (!alive) return;
      try {
        // payload: { stream: "btcusdt@ticker", data: {...} }
        const msg = JSON.parse(event.data);
        const data = msg?.data;
        const symbol = String(data?.s || '').toLowerCase(); // e.g. "BTCUSDT" -> "btcusdt"
        const price = Number(data?.c);
        const pct = Number(data?.P);

        if (!symbol) return;

        setTickers((prev) => {
          const prevSnap = prev[symbol] ?? { price: 0, change24h: 0 };
          return {
            ...prev,
            [symbol]: {
              price: Number.isFinite(price) && price > 0 ? price : prevSnap.price,
              change24h: Number.isFinite(pct) ? pct : prevSnap.change24h,
            },
          };
        });
      } catch {
        // ignore
      }
    };

    return () => {
      alive = false;
      try {
        ws.close();
      } catch {}
    };
  }, []);

  useEffect(() => {
    return () => {
      if (notifTimerRef.current) window.clearTimeout(notifTimerRef.current);
    };
  }, []);

  // ✅ Selected ticker derived
  const selectedKey = selectedCoin.pair.toLowerCase();
  const selectedTicker = tickers[selectedKey] ?? { price: 0, change24h: 0 };
  const livePrice = selectedTicker.price;
  const liveChange24h = selectedTicker.change24h;

  const totalCost = useMemo(() => {
    const amt = parseFloat(tradeAmount);
    if (!Number.isFinite(amt) || amt <= 0) return 0;
    if (!Number.isFinite(livePrice) || livePrice <= 0) return 0;
    return amt * livePrice;
  }, [tradeAmount, livePrice]);

  const handleTrade = () => {
    const amount = parseFloat(tradeAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showNotification('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    const price = livePrice || 0;
    if (price <= 0) {
      showNotification('Chưa nhận được giá từ Binance');
      return;
    }

    if (tradeType === 'buy') {
      const total = amount * price;
      if (total > virtualBalance) {
        showNotification('Số dư không đủ');
        return;
      }
      onBuy(selectedCoin.id, amount, price);
      showNotification(`Đã mua thành công ${amount} ${selectedCoin.symbol}`);
    } else {
      onSell(selectedCoin.id, amount, price);
      showNotification(`Đã bán thành công ${amount} ${selectedCoin.symbol}`);
    }

    setTradeAmount('');
  };

  const changeClass = liveChange24h >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {notification && (
        <div className="fixed right-6 top-20 z-50 animate-in slide-in-from-top rounded-lg border border-black/10 bg-white px-6 py-3 shadow-lg">
          <p className="text-sm font-medium text-black">{notification}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-black">Giao dịch ảo</h1>
            <p className="text-black/60">Realtime price từ Binance • Tiền ảo để luyện tập</p>
          </div>

          <div className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm text-black/70">
            WS:{' '}
            <span
              className={
                wsStatus === 'open'
                  ? 'font-medium text-green-600'
                  : wsStatus === 'connecting'
                    ? 'font-medium text-black/70'
                    : 'font-medium text-red-600'
              }
            >
              {wsStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Coin Selector */}
      <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
        {COINS.map((coin) => {
          const isSelected = selectedCoin.id === coin.id;

          const key = coin.pair.toLowerCase();
          const t = tickers[key] ?? { price: 0, change24h: 0 };
          const coinPrice = t.price;
          const coinChange24h = t.change24h;
          const coinChangeClass = coinChange24h >= 0 ? 'text-green-600' : 'text-red-600';

          return (
            <button
              key={coin.id}
              onClick={() => setSelectedCoin(coin)}
              className={
                isSelected
                  ? `${coinBtnBase} ${coinBtnActive}`
                  : `${coinBtnBase} ${coinBtnInactive}`
              }
            >
              <div className="mb-2 flex items-center gap-3">
                {coin.logo ? (
                  <img
                    src={coin.logo}
                    alt={coin.symbol}
                    className="h-10 w-10 rounded-full bg-[#9EEC37]/20 p-1"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9EEC37]/20 font-bold text-black">
                    {coin.symbol.charAt(0)}
                  </div>
                )}

                <div className="text-left">
                  <div className="font-medium text-black">{coin.symbol}</div>
                  <div className="text-sm text-black/60">{coin.pair}</div>
                </div>
              </div>

              <div className="mb-1 font-bold text-black">
                {coinPrice > 0
                  ? `$${coinPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : '—'}
              </div>

              <div className={`flex items-center gap-1 text-sm ${coinChangeClass}`}>
                {coinChange24h >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                <span>
                  {coinChange24h >= 0 ? '+' : ''}
                  {Number.isFinite(coinChange24h) ? coinChange24h.toFixed(2) : '0.00'}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side - Chart */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="mb-1 font-bold text-black">{selectedCoin.name}</h2>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold text-black">
                    {livePrice > 0
                      ? `$${livePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      : '—'}
                  </div>
                  <div className={`flex items-center gap-1 ${changeClass}`}>
                    {liveChange24h >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    <span className="font-medium">
                      {liveChange24h >= 0 ? '+' : ''}
                      {Number.isFinite(liveChange24h) ? liveChange24h.toFixed(2) : '0.00'}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-black/50">
                  Pair: <span className="font-medium text-black/70">{selectedCoin.pair}</span>
                </div>
              </div>

              {/* Timeframe */}
              <div className="flex flex-wrap gap-2">
                {(['1m', '5m', '15m', '1h', '4h', '1d'] as const).map((it) => (
                  <button
                    key={it}
                    onClick={() => setIntervalTf(it)}
                    className={
                      interval === it
                        ? `${tfBtnBase} ${tfBtnActive}`
                        : `${tfBtnBase} ${tfBtnInactive}`
                    }
                  >
                    {it}
                  </button>
                ))}
              </div>
            </div>

            <BinanceLikeChart
              symbolPair={selectedCoin.pair}
              interval={interval}
              onPrice={(p) => {
                if (!Number.isFinite(p) || p <= 0) return;
                const key = selectedCoin.pair.toLowerCase();
                setTickers((prev) => ({
                  ...prev,
                  [key]: { price: p, change24h: prev[key]?.change24h ?? 0 },
                }));
              }}
            />

            <div className="mt-6 rounded-lg bg-[#9EEC37]/10 p-4">
              <p className="text-sm text-black/60">
                💡 <strong>Lưu ý:</strong> Tiền ảo (virtual) nhưng giá lấy realtime từ Binance (nến OHLC).
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Trade Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-black">Đặt lệnh</h3>

            <div className="mb-6 rounded-lg border border-black/10 bg-black/5 p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-black/60">
                <Wallet className="h-4 w-4" />
                Số dư tiền ảo
              </div>
              <div className="font-bold text-black">
                ${virtualBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setTradeType('buy')}
                className={tradeType === 'buy' ? `${sideBtnBase} ${buyBtnActive}` : `${sideBtnBase} ${buyBtnInactive}`}
              >
                Mua
              </button>
              <button
                onClick={() => setTradeType('sell')}
                className={tradeType === 'sell' ? `${sideBtnBase} ${sellBtnActive}` : `${sideBtnBase} ${sellBtnInactive}`}
              >
                Bán
              </button>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-black">
                Số lượng ({selectedCoin.symbol})
              </label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                placeholder="0.00"
                step="0.000001"
                min="0"
                className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-black placeholder:text-black/40 focus:border-[#9EEC37] focus:outline-none focus:ring-2 focus:ring-[#9EEC37]/20"
              />
            </div>

            <div className="mb-6 rounded-lg border border-black/10 bg-black/5 p-4">
              <div className="mb-1 text-sm text-black/60">
                {tradeType === 'buy' ? 'Tổng chi phí' : 'Tổng giá trị'}
              </div>
              <div className="font-bold text-black">
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-2 text-sm text-black/60">Chọn nhanh</div>
              <div className="grid grid-cols-4 gap-2">
                {['25%', '50%', '75%', '100%'].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => {
                      const p = parseInt(percent, 10) / 100;
                      const price = livePrice || 0;
                      if (price <= 0) return;

                      // NOTE: hiện tại quick amount vẫn theo virtualBalance như code cũ của bạn.
                      // Nếu muốn "Sell 25%" theo holdings thật thì cần truyền holdings vào component.
                      const maxAmount = virtualBalance / price;
                      setTradeAmount((maxAmount * p).toFixed(6));
                    }}
                    className={quickBtn}
                  >
                    {percent}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleTrade}
              className={tradeType === 'buy' ? submitBuy : submitSell}
            >
              {tradeType === 'buy' ? 'Mua' : 'Bán'} {selectedCoin.symbol}
            </button>

            <div className="mt-6 space-y-2 text-sm text-black/60">
              <div className="flex justify-between">
                <span>Giá hiện tại</span>
                <span className="font-medium text-black">
                  {livePrice > 0
                    ? `$${livePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Thay đổi 24h</span>
                <span className={changeClass}>
                  {liveChange24h >= 0 ? '+' : ''}
                  {Number.isFinite(liveChange24h) ? liveChange24h.toFixed(2) : '0.00'}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm text-black/60">
              <strong className="text-black">Ghi nhớ:</strong> Thực hành giúp bạn tiến bộ. Dùng môi trường không rủi ro để luyện chiến lược.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}