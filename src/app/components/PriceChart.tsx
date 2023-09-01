import { createChart } from "lightweight-charts";
import React, { useEffect, useRef } from "react";
import {
  CANDLE_PERIODS,
  OHLCVData,
  setCandlePeriod,
} from "../redux/priceChartSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

interface PriceChartProps {
  data: OHLCVData[];
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

      const clonedData = JSON.parse(JSON.stringify(data));

      // OHLC
      const ohlcSeries = chart.addCandlestickSeries({});
      ohlcSeries.setData(clonedData);
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

      volumeSeries.setData(clonedData);
      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const chartDiv = chartContainer.querySelector(".tv-lightweight-charts");
      if (chartDiv) {
        (chartDiv as HTMLElement).style.overflow = "visible";
      }

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

export function PriceChart() {
  const state = useAppSelector((state) => state.priceChart);
  const dispatch = useAppDispatch();

  return (
    <div>
      <label htmlFor="candle-period-selector">Candle Period:</label>
      <select
        className="select select-ghost"
        id="candle-period-selector"
        value={state.candlePeriod}
        onChange={(e) => {
          dispatch(setCandlePeriod(e.target.value));
        }}
      >
        {CANDLE_PERIODS.map((period) => (
          <option key={period} value={period}>
            {period}
          </option>
        ))}
      </select>

      <PriceChartCanvas data={state.ohlcv} />
    </div>
  );
}
