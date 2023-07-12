import { createChart, CandlestickData, UTCTimestamp } from "lightweight-charts";
import React, { useEffect, useRef, useContext, useState } from "react";
import { AdexStateContext } from "./page";

// from https://www.npmjs.com/package/alphadex-sdk-js#candleperiods-array
const CANDLE_PERIODS = ["5m", "15m", "1h", "4h", "6h", "12h", "1D", "1W", "1M"];

async function fetchHistoricalData(
  symbol: string,
  interval: string,
  limit: number
): Promise<OHLCVData[]> {
  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  );
  const data = await response.json();

  return data.map((row: any): OHLCVData => {
    const [time, open, high, low, close, value] = row;
    const tradingviewTime = (time / 1000) as UTCTimestamp;
    return {
      time: tradingviewTime,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      value: Number(value),
    };
  });
}

interface OHLCVData extends CandlestickData {
  value: number;
}

interface PriceChartProps {
  data: OHLCVData[];
}

enum DataSource {
  BINANCE = "BINANCE",
  ADEX = "ADEX",
}

function PriceChartCanvas(props: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { data } = props;
  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (chartContainer) {
      const handleResize = () => {
        chart.applyOptions({ width: chartContainer.clientWidth });
      };

      const chart = createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 450,

        // TODO: timescale is not visible
        timeScale: {
          timeVisible: true,
        },
      });

      // OHLC
      const ohlcSeries = chart.addCandlestickSeries({});
      ohlcSeries.setData(data);
      chart.priceScale("right").applyOptions({
        scaleMargins: {
          top: 0,
          bottom: 0.2,
        },
      });

      // Volume
      const volumeSeries = chart.addHistogramSeries({
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "volume",
        color: "#eaeff5",
      });

      volumeSeries.setData(data);
      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        // clearInterval(intervalId);
        chart.remove();
      };
    }
  }, [data]);

  return <div ref={chartContainerRef} />;
}

// TODO: find out if this is guaranteed by AlphaDEX API already
function cleanData(data: OHLCVData[]): OHLCVData[] {
  // avoid lightweight-charts Error: Assertion failed: data must be asc ordered by time

  const dataMap = new Map<number, OHLCVData>();

  // Iterate over the data in reverse order
  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    // If the map doesn't already contain this timestamp, add the row to the map
    if (!dataMap.has(row.time as number)) {
      dataMap.set(row.time as number, row);
    }
  }

  // Convert the map values back to an array and sort it by time
  const cleanedData = Array.from(dataMap.values()).sort(
    (a, b) => (a.time as number) - (b.time as number)
  );

  return cleanedData;
}

function convertAlphaDEXData(data: any[]): OHLCVData[] {
  return data.map((row: any): OHLCVData => {
    const time = (new Date(row.startTime).getTime() / 1000) as UTCTimestamp;
    const open = row.priceOpen;
    const high = row.priceHigh;
    const low = row.priceLow;
    const close = row.priceClose;
    const value = row.tradesValue;
    return { time, open, high, low, close, value };
  });
}

export function PriceChart() {
  //Returns a candlestick chart of the current pair
  const adexState = useContext(AdexStateContext);
  const [dataSource, setDataSource] = useState<DataSource>(DataSource.BINANCE);
  const [data, setData] = useState<OHLCVData[]>([]);
  const [candlePeriod, setCandlePeriod] = useState(CANDLE_PERIODS[0]);

  const [ws, setWs] = useState<WebSocket | null>(null);

  async function selectDataSource(dataSource: DataSource) {
    setData([]);
    if (ws) {
      ws.close();
    }

    switch (dataSource) {
      case DataSource.BINANCE:
        const historicalData = await fetchHistoricalData("BTCUSDT", "1m", 1000);
        setData(historicalData);

        const newWs = new WebSocket(
          "wss://stream.binance.com:9443/ws/btcusdt@kline_1m"
        );
        newWs.onmessage = async (event) => {
          const response = JSON.parse(event.data);
          const {
            t: time,
            o: open,
            h: high,
            l: low,
            c: close,
            v: value,
          } = response.k;
          const tradingviewTime = (time / 1000) as UTCTimestamp;
          const newData = {
            time: tradingviewTime,
            open: Number(open),
            high: Number(high),
            low: Number(low),
            close: Number(close),
            value: Number(value),
          };
          setData((prevData) => cleanData([...prevData, newData]));
        };
        setDataSource(dataSource);
        setWs(newWs);
        break;

      case DataSource.ADEX:
        const adexData = convertAlphaDEXData(adexState.currentPairCandlesList);
        setData(adexData);
        setDataSource(dataSource);
        break;
    }
  }

  useEffect(() => {
    selectDataSource(DataSource.ADEX);

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    if (dataSource === DataSource.ADEX) {
      const adexData = convertAlphaDEXData(adexState.currentPairCandlesList);
      setData(adexData);
    }
  }, [adexState.currentPairCandlesList, dataSource]);

  return (
    <div>
      <select
        className="select w-full max-w-xs bg-gray-200"
        id="source-selector"
        onChange={(e) => {
          selectDataSource(e.target.value as DataSource);
        }}
      >
        <option value={DataSource.ADEX}>AlphaDEX</option>
        <option value={DataSource.BINANCE}>BINANCE</option>
      </select>
      {dataSource === DataSource.ADEX && (
        <div>
          <label htmlFor="candle-period-selector">
            Candle Period (TODO: selector does not work yet):
          </label>
          <select
            className="select select-ghost"
            id="candle-period-selector"
            value={candlePeriod}
            onChange={(e) => {
              setCandlePeriod(e.target.value);
            }}
          >
            {CANDLE_PERIODS.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>

          <PriceChartCanvas data={data} />
        </div>
      )}
      {dataSource === DataSource.BINANCE && (
        <div>
          <h4> Binance BTCUSDT 1m data!</h4>
          <p>
            This is provided purely as an example of how the chart works when
            there is data. It is here until we have some{" "}
            <a
              href="https://github.com/DeXter-on-Radix/website/issues/10"
              target="_blank"
            >
              test data from AlphaDEX
            </a>
            .
          </p>
          <PriceChartCanvas data={data} />
        </div>
      )}
    </div>
  );
}
