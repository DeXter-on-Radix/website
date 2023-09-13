import { createChart } from "lightweight-charts";
import React, { useEffect, useRef, useState } from "react";
import {
  CANDLE_PERIODS,
  OHLCVData,
  setCandlePeriod,
  handleCrosshairMove,
  fetchCandlesForInitialPeriod,
} from "../redux/priceChartSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { formatPercentageChange } from "../utils";

interface PriceChartProps {
  data: OHLCVData[];
}

function PriceChartCanvas(props: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { data } = props;

  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    dispatch(fetchCandlesForInitialPeriod());

    if (chartContainer) {
      const handleResize = () => {
        chart.applyOptions({ width: chartContainer.clientWidth });
      };

      const chart = createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 485,
        //MODIFY THEME COLOR HERE
        layout: {
          background: { color: "#181c27" },
          textColor: "#DDD",
        },
        //MODIFY THEME COLOR HERE
        grid: {
          vertLines: { color: "#444" },
          horzLines: { color: "#444" },
        },
        timeScale: {
          //MODIFY THEME COLOR HERE
          borderColor: "#d3d3d4",
          timeVisible: true,
        },
      });

      const clonedData = JSON.parse(JSON.stringify(data));

      // OHLC
      const ohlcSeries = chart.addCandlestickSeries({});
      ohlcSeries.setData(clonedData);

      chart.priceScale("right").applyOptions({
        //MODIFY THEME COLOR HERE
        borderColor: "#d3d3d4",
        scaleMargins: {
          top: 0.1,
          bottom: 0.3,
        },
      });

      // Volume Initialization
      const volumeSeries = chart.addHistogramSeries({
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "volume",
      });

      // VOLUME BARS
      // MODIFY THEME COLOR HERE
      volumeSeries.setData(
        data.map((datum) => ({
          ...datum,
          color: datum.close - datum.open <= 0 ? "#ef5350" : "#26a69a",
        }))
      );

      // volumeSeries.setData(clonedData);
      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0.01,
        },
      });

      //Crosshair Data for legend
      dispatch(handleCrosshairMove(chart, data, volumeSeries));

      //Prevent Chart from clipping
      const chartDiv = chartContainer.querySelector(".tv-lightweight-charts");
      if (chartDiv) {
        (chartDiv as HTMLElement).style.overflow = "visible";
      }

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.remove();
      };
    }
  }, [data, dispatch]);

  return <div ref={chartContainerRef} className="relative "></div>;
}

export function PriceChart() {
  const state = useAppSelector((state) => state.priceChart);
  const dispatch = useAppDispatch();
  const candlePeriod = useAppSelector((state) => state.priceChart.candlePeriod);
  const candlePrice = useAppSelector(
    (state) => state.priceChart.legendCandlePrice
  );
  const change = useAppSelector((state) => state.priceChart.legendChange);
  const percChange = useAppSelector(
    (state) => state.priceChart.legendPercChange
  );
  const currentVolume = useAppSelector(
    (state) => state.priceChart.legendCurrentVolume
  );
  const isNegativeOrZero = useAppSelector(
    (state) => state.priceChart.isNegativeOrZero
  );

  return (
    <div>
      <div className="">
        <div className="flex p-[1vh]">
          {CANDLE_PERIODS.map((period) => (
            <button
              key={period}
              className={`px-[0.5vw] py-[0.5vw] text-sm font-roboto text-#d4e7df hover:bg-white hover:bg-opacity-30 hover:rounded-md ${
                candlePeriod === period ? "text-blue-500" : ""
              }`}
              onClick={() => dispatch(setCandlePeriod(period))}
            >
              {period}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-sm font-roboto">
          <div className="ml-4">
            Open:{" "}
            <span
              className={isNegativeOrZero ? "text-red-500" : "text-green-500"}
            >
              {candlePrice?.open}
            </span>
          </div>
          <div>
            High:{" "}
            <span
              className={isNegativeOrZero ? "text-red-500" : "text-green-500"}
            >
              {candlePrice?.high}
            </span>
          </div>
          <div>
            Low:{" "}
            <span
              className={isNegativeOrZero ? "text-red-500" : "text-green-500"}
            >
              {candlePrice?.low}
            </span>
          </div>
          <div>
            Close:{" "}
            <span
              className={isNegativeOrZero ? "text-red-500" : "text-green-500"}
            >
              {candlePrice?.close}
            </span>
          </div>
          <div>
            Volume:{" "}
            <span
              className={isNegativeOrZero ? "text-red-500" : "text-green-500"}
            >
              {currentVolume === 0 ? 0 : currentVolume.toFixed(2)}
            </span>
          </div>
          <div className="mr-4">
            Change:{" "}
            <span
              className={isNegativeOrZero ? "text-red-500" : "text-green-500"}
            >
              {change}
              {formatPercentageChange(percChange)}
            </span>
          </div>
        </div>
      </div>
      <PriceChartCanvas data={state.ohlcv} />
    </div>
  );
}
