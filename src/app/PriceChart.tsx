import {
  createChart,
  CandlestickData,
  UTCTimestamp,
  ColorType,
} from "lightweight-charts";
import React, { useEffect, useRef, useContext } from "react";
import { AdexStateContext } from "./page";

function generateMockData(numRows: number, startTime?: Date): OHLCVData[] {
  const data = [];
  const priceRange = 1000;
  const volumeRange = 10000;

  if (!startTime) {
    startTime = new Date(new Date().getTime() - numRows * 1000);
  }

  for (let i = 0; i < numRows; i++) {
    const time = new Date(startTime.getTime() + i * 1 * 1000); // increment by 1 second
    // to tradingview format
    // https://tradingview.github.io/lightweight-charts/docs/api#utctimestamp
    const tradtime = (time.getTime() / 1000) as UTCTimestamp;
    const open = Math.random() * priceRange;
    const high = open + (Math.random() * priceRange) / 2;
    const low = open - (Math.random() * priceRange) / 2;
    const close = low + Math.random() * (high - low);
    const value = Math.random() * volumeRange;

    data.push({ time: tradtime, open, high, low, close, value });
  }

  return data;
}

interface OHLCVData extends CandlestickData {
  value: number;
}

interface PriceChartProps {}

export function PriceChart(props: PriceChartProps) {
  //Returns a candlestick chart of the current pair
  const adexState = useContext(AdexStateContext);

  // recreate mock data every second
  let data = generateMockData(20);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("adexState", adexState);
  }, [adexState]);

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

      const intervalId = setInterval(() => {
        const newData = generateMockData(1); // Generate one new row
        ohlcSeries.update(newData[0]); // Update the chart with the new row
        volumeSeries.update(newData[0]); // Update the chart with the new row
      }, 1000);

      return () => {
        window.removeEventListener("resize", handleResize);
        clearInterval(intervalId);
        chart.remove();
      };
    }
  }, [data]);

  return (
    <div>
      <h4>Mock price</h4>
      <div ref={chartContainerRef} />
    </div>
  );
}
