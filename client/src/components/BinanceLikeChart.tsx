import { useEffect, useMemo, useRef } from "react";
import {
  ColorType,
  createChart,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  type CandlestickData,
  type HistogramData,
  type LogicalRange,
} from "lightweight-charts";

type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
type Theme = "dark" | "light";

type Props = {
  symbolPair: string; // "BTCUSDT"
  interval?: Interval;
  theme?: Theme;
  onPrice?: (p: number) => void;
  heightPx?: number;
  className?: string;
  historyLimit?: number;
  /** nếu true: lần đầu load history sẽ fitContent() */
  fitOnFirstLoad?: boolean;

  /** (optional) nếu muốn DEV dùng polling REST thay vì WS */
  devPolling?: boolean;
  devPollingMs?: number;
};

type KlineMsg = {
  e: "kline";
  E: number;
  s: string;
  k: {
    t: number; // start time (ms)
    T: number; // close time (ms)
    s: string;
    i: string;
    f: number;
    L: number;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    n: number;
    x: boolean;
    q: string;
    V: string;
    Q: string;
    B: string;
  };
};

function toCandleFromKlineArr(k: any[]): CandlestickData<UTCTimestamp> {
  return {
    time: Math.floor(k[0] / 1000) as UTCTimestamp,
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
  };
}

function toVolumeFromKlineArr(k: any[]): HistogramData<UTCTimestamp> {
  const open = Number(k[1]);
  const close = Number(k[4]);
  return {
    time: Math.floor(k[0] / 1000) as UTCTimestamp,
    value: Number(k[5]),
    color: close >= open ? "rgba(14, 203, 129, 0.5)" : "rgba(246, 70, 93, 0.5)",
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function BinanceLikeChart({
  symbolPair,
  interval = "1m",
  theme = "dark",
  onPrice,
  heightPx = 420,
  className,
  historyLimit = 200,
  fitOnFirstLoad = true,
  devPolling = false,
  devPollingMs = 2500,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // giữ callback ổn định để không trigger loadHistory re-run
  const onPriceRef = useRef<Props["onPrice"]>(onPrice);
  useEffect(() => {
    onPriceRef.current = onPrice;
  }, [onPrice]);

  // dùng để không fitContent() mỗi lần gọi lại history
  const didFitOnceRef = useRef(false);

  // guard chống StrictMode/dev mount 2 lần gọi history trùng
  const lastHistoryKeyRef = useRef<string>("");

  const pairUpper = useMemo(() => symbolPair.toUpperCase(), [symbolPair]);
  const pairLower = useMemo(() => symbolPair.toLowerCase(), [symbolPair]);

  // combined stream
  const wsUrl = useMemo(() => {
    const stream = `${pairLower}@kline_${interval}`;
    return `wss://stream.binance.com/stream?streams=${stream}`;
  }, [pairLower, interval]);

  const restHistoryUrl = useMemo(() => {
    return `....`;
  }, [pairUpper, interval, historyLimit]);

  /** 0) reset fit-flag khi đổi pair/interval */
  useEffect(() => {
    didFitOnceRef.current = false;
  }, [pairUpper, interval]);

  /** 1) Create chart: chỉ tạo 1 lần */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // cleanup nếu hot-reload tạo trùng
    if (roRef.current) {
      try {
        roRef.current.disconnect();
      } catch {}
      roRef.current = null;
    }
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch {}
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
    }

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "#0b0e11" },
        textColor: "rgba(234,236,239,0.9)",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "rgba(234,236,239,0.06)" },
        horzLines: { color: "rgba(234,236,239,0.06)" },
      },
      rightPriceScale: {
        borderColor: "rgba(234,236,239,0.12)",
        scaleMargins: { top: 0.12, bottom: 0.25 },
      },
      timeScale: {
        borderColor: "rgba(234,236,239,0.12)",
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (t) =>
          new Date((t as number) * 1000).toLocaleTimeString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: { color: "rgba(234,236,239,0.25)", width: 1 },
        horzLine: { color: "rgba(234,236,239,0.25)", width: 1 },
      },
      handleScroll: true,
      handleScale: true,
      width: el.clientWidth,
      height: el.clientHeight,
      localization: {
        timeFormatter: (t) =>
          new Date((t as number) * 1000).toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          }),
      },
    });

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: "#0ECB81",
      downColor: "#F6465D",
      borderUpColor: "#0ECB81",
      borderDownColor: "#F6465D",
      wickUpColor: "#0ECB81",
      wickDownColor: "#F6465D",
    });

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    candles.applyOptions({ lastValueVisible: true, priceLineVisible: true });

    chartRef.current = chart;
    candleRef.current = candles;
    volumeRef.current = volume;

    const ro = new ResizeObserver(() => {
      const node = containerRef.current;
      const c = chartRef.current;
      if (!node || !c) return;
      c.applyOptions({ width: node.clientWidth, height: node.clientHeight });
    });
    ro.observe(el);
    roRef.current = ro;

    return () => {
      try {
        ro.disconnect();
      } catch {}
      try {
        chart.remove();
      } catch {}
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      roRef.current = null;
    };
  }, []);

  /** 2) Apply theme: chỉ applyOptions, KHÔNG recreate chart */
  useEffect(() => {
    const c = chartRef.current;
    if (!c) return;

    const isDark = theme === "dark";
    const bg = isDark ? "#0b0e11" : "#ffffff";
    const text = isDark ? "rgba(234,236,239,0.9)" : "rgba(0,0,0,0.75)";
    const grid = isDark ? "rgba(234,236,239,0.06)" : "rgba(0,0,0,0.06)";
    const border = isDark ? "rgba(234,236,239,0.12)" : "rgba(0,0,0,0.12)";
    const cross = isDark ? "rgba(234,236,239,0.25)" : "rgba(0,0,0,0.25)";

    c.applyOptions({
      layout: { background: { type: ColorType.Solid, color: bg }, textColor: text },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      rightPriceScale: { borderColor: border },
      timeScale: { borderColor: border },
      crosshair: {
        vertLine: { color: cross, width: 1 },
        horzLine: { color: cross, width: 1 },
      },
    });
  }, [theme]);

  /** 3) Load history: GIỮ zoom/range khi setData */
  useEffect(() => {
    const chart = chartRef.current;
    const candleSeries = candleRef.current;
    const volSeries = volumeRef.current;
    if (!chart || !candleSeries || !volSeries) return;

    // StrictMode/dev mount 2 lần: chặn gọi trùng cùng key
    const key = restHistoryUrl;
    if (lastHistoryKeyRef.current === key) {
      return;
    }
    lastHistoryKeyRef.current = key;

    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch(restHistoryUrl, { signal: ac.signal });
        if (!res.ok) throw new Error("history fetch failed");
        const klines = (await res.json()) as any[];

        if (ac.signal.aborted) return;

        const ts = chart.timeScale();
        const prevRange: LogicalRange | null = ts.getVisibleLogicalRange();

        const candleData = klines.map(toCandleFromKlineArr);
        const volumeData = klines.map(toVolumeFromKlineArr);

        candleSeries.setData(candleData);
        volSeries.setData(volumeData);

        const last = candleData[candleData.length - 1];
        if (last) onPriceRef.current?.(last.close);

        if (fitOnFirstLoad && !didFitOnceRef.current) {
          ts.fitContent();
          didFitOnceRef.current = true;
        } else if (prevRange) {
          ts.setVisibleLogicalRange(prevRange);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      ac.abort();
    };
  }, [restHistoryUrl, fitOnFirstLoad]);

  /** helper: stop WS */
  const stopWsIfAny = () => {
    const ws = wsRef.current;
    if (!ws) return;
    try {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      ws.close(1000, "cleanup");
    } catch {}
    wsRef.current = null;
  };

  /** 4) Realtime: WS (mặc định cả dev/prod), có reconnect */
  useEffect(() => {
    let alive = true;

    const startPolling = () => {
      let timer: number | null = null;
      const tick = async () => {
        try {
          const url = `....`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("poll failed");
          const data = (await res.json()) as any[];
          const k = data[data.length - 1];
          if (!alive) return;

          const candle = toCandleFromKlineArr(k);
          const vol = toVolumeFromKlineArr(k);

          candleRef.current?.update(candle);
          volumeRef.current?.update(vol);
          onPriceRef.current?.(candle.close);
        } catch {
          // ignore
        } finally {
          if (!alive) return;
          timer = window.setTimeout(tick, devPollingMs);
        }
      };

      tick();

      return () => {
        if (timer) window.clearTimeout(timer);
      };
    };

    const isDev = import.meta.env.DEV;

    // nếu muốn dev polling thì dùng, còn lại WS
    if (isDev && devPolling) {
      stopWsIfAny();
      const stop = startPolling();
      return () => {
        alive = false;
        stop();
      };
    }

    // WS mode
    stopWsIfAny();

    let attempt = 0;
    let manualClose = false;

    const connect = async () => {
      if (!alive) return;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (ev) => {
          if (!alive) return;
          try {
            const payload = JSON.parse(ev.data) as { data?: KlineMsg } | KlineMsg;
            const msg: KlineMsg | undefined =
              (payload as any)?.data?.e === "kline" ? (payload as any).data : (payload as any);

            if (!msg || msg.e !== "kline") return;

            const candle: CandlestickData<UTCTimestamp> = {
              time: Math.floor(msg.k.t / 1000) as UTCTimestamp,
              open: Number(msg.k.o),
              high: Number(msg.k.h),
              low: Number(msg.k.l),
              close: Number(msg.k.c),
            };
            const vol: HistogramData<UTCTimestamp> = {
              time: Math.floor(msg.k.t / 1000) as UTCTimestamp,
              value: Number(msg.k.v),
              color:
                Number(msg.k.c) >= Number(msg.k.o)
                  ? "rgba(14, 203, 129, 0.5)"
                  : "rgba(246, 70, 93, 0.5)",
            };

            candleRef.current?.update(candle);
            volumeRef.current?.update(vol);
            onPriceRef.current?.(candle.close);
          } catch {
            // ignore
          }
        };

        ws.onopen = () => {
          attempt = 0; // reset backoff
        };

        ws.onclose = async () => {
          if (!alive || manualClose) return;

          // reconnect backoff nhẹ (max ~10s)
          attempt += 1;
          const delay = Math.min(10000, 400 * Math.pow(2, Math.min(6, attempt)));
          await sleep(delay);
          if (!alive) return;
          connect();
        };

        ws.onerror = () => {
          // để onclose xử lý reconnect
        };
      } catch {
        // connect fail => backoff rồi thử lại
        attempt += 1;
        const delay = Math.min(10000, 400 * Math.pow(2, Math.min(6, attempt)));
        await sleep(delay);
        if (!alive) return;
        connect();
      }
    };

    connect();

    return () => {
      alive = false;
      manualClose = true;
      stopWsIfAny();
    };
  }, [wsUrl, pairUpper, interval, devPolling, devPollingMs]);

  const isDark = theme === "dark";
  const wrapperBg = isDark ? "bg-[#0b0e11]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-black/10";

  return (
    <div className={className}>
      <div className={`w-full rounded-xl border ${border} ${wrapperBg} p-3`}>
        <div ref={containerRef} className="w-full" style={{ height: heightPx }} />
      </div>
    </div>
  );
}