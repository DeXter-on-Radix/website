import { createChart } from "lightweight-charts";
import React, { useEffect, useRef, useState } from "react";
import {
  CANDLE_PERIODS,
  OHLCVData,
  setCandlePeriod,
  handleCrosshairMove,
  setLegendCandlePrice,
  setLegendCurrentVolume,
  setLegendChange,
  // selectVolumeDataWithColor,
} from "../redux/priceChartSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  formatPercentageChange,
  computePercentageChange,
  getVolumeBarColor,
} from "../utils";

interface PriceChartProps {
  data: OHLCVData[];
}

function PriceChartCanvas(props: PriceChartProps) {
  const candlePrice = useAppSelector(
    (state) => state.priceChart.legendCandlePrice
  ); //for legend
  const percChange = useAppSelector((state) => state.priceChart.legendChange); //for legend
  const currentVolume = useAppSelector(
    (state) => state.priceChart.legendCurrentVolume
  ); //for legend
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch(); //TEMP
  const candlePeriod = useAppSelector((state) => state.priceChart.candlePeriod);
  const { data } = props;
  // const volumeDataWithColor = useAppSelector(selectVolumeDataWithColor);

  useEffect(() => {
    const chartContainer = chartContainerRef.current;

    if (chartContainer) {
      const handleResize = () => {
        chart.applyOptions({ width: chartContainer.clientWidth });
      };

      const chart = createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 450,
        //COLOR
        layout: {
          background: { color: "#181c27" },
          textColor: "#DDD",
        },
        //COLOR
        grid: {
          vertLines: { color: "#444" },
          horzLines: { color: "#444" },
        },
        timeScale: {
          //COLOR
          borderColor: "#71649C",
          timeVisible: true,
        },
      });

      const clonedData = JSON.parse(JSON.stringify(data));

      // OHLC
      const ohlcSeries = chart.addCandlestickSeries({});
      ohlcSeries.setData(clonedData);

      chart.priceScale("right").applyOptions({
        //COLOR
        borderColor: "#71649C",
        scaleMargins: {
          top: 0.1,
          bottom: 0.3,
        },
      });

      //VOLUME COLOR
      const volumeDataWithColor = data.map((datum, index) => {
        if (index === 0) {
          return { ...datum, color: "#4caf50" };
        }
        const color = getVolumeBarColor(datum.close, data[index - 1].close);
        return { ...datum, color };
      });
      // Volume
      const volumeSeries = chart.addHistogramSeries({
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "volume",
        color: "#4caf50",
      });

      volumeSeries.setData(volumeDataWithColor);

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
        // clearInterval(intervalId);
        chart.remove();
      };
    }
  }, [data, dispatch]);

  return (
    <div ref={chartContainerRef} className="relative ">
      {/* <div>selector bar</div> */}
      {/* <div className="absolute top-[1vh] left-0 w-full z-20 bg-gray-900 mt-[-2vh] rounded-t-md">
        <div className="flex space-x-[1vw] p-[1vh] transform scale-[calc(1 - 0.01*vw)]">
          {CANDLE_PERIODS.map((period) => (
            <button
              key={period}
              className={`px-[1vw] py-[0.5vh] text-sm font-roboto text-#d4e7df hover:bg-white hover:bg-opacity-30 hover:rounded-md ${
                candlePeriod === period ? "text-blue-500" : ""
              }`}
              onClick={() => dispatch(setCandlePeriod(period))}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      <div
        className={`absolute top-[3.5vh] left-[1vw] z-20 text-sm font-roboto ${
          percChange && percChange < 0 ? "text-red-500" : "text-green-500"
        }`}
      >
        <div className="flex space-x-[1.5vw] mt-[2vh]">
          <div>O: {candlePrice?.open}</div>
          <div>H: {candlePrice?.high}</div>
          <div>L: {candlePrice?.low}</div>
          <div>C: {candlePrice?.close}</div>
          <div>{formatPercentageChange(percChange)}</div>
        </div>
        <div>Volume: {currentVolume === 0 ? 0 : currentVolume.toFixed(2)}</div>
      </div> */}
    </div>
  );
}

export function PriceChart() {
  const state = useAppSelector((state) => state.priceChart);
  const dispatch = useAppDispatch();
  const candlePeriod = useAppSelector((state) => state.priceChart.candlePeriod);
  const candlePrice = useAppSelector(
    (state) => state.priceChart.legendCandlePrice
  ); //for legend
  const change = useAppSelector((state) => state.priceChart.legendChange); //for legend
  const percChange = useAppSelector(
    (state) => state.priceChart.legendPercChange
  ); //for legend
  const currentVolume = useAppSelector(
    (state) => state.priceChart.legendCurrentVolume
  ); //for legend
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
