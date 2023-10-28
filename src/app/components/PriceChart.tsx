import { createChart } from "lightweight-charts";
import React, { useEffect, useRef } from "react";
import {
  CANDLE_PERIODS,
  OHLCVData,
  setCandlePeriod,
  handleCrosshairMove,
  // fetchCandlesForInitialPeriod,
  initializeLegend,
} from "../redux/priceChartSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { displayAmount } from "../utils";
import * as tailwindConfig from "../../../tailwind.config";

interface PriceChartProps {
  data: OHLCVData[];
  candlePrice: OHLCVData | null;
  change: number | null;
  percChange: number | null;
  volume: number | null;
  isNegativeOrZero: boolean;
}

function PriceChartCanvas(props: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const { data, candlePrice } = props;
  //displayTime offsets by local timezone, causing discrepancy on chart
  const candleDate = new Date(
    parseInt(candlePrice?.time.toString() || "") * 1000
  ).toUTCString();

  const theme = tailwindConfig.daisyui.themes[0].dark;

  const noDigits = 8;
  const fixedDecimals = 6;

  const volume = displayAmount(props.volume || 0, noDigits, 2);
  const percChange = displayAmount(props.percChange || 0, noDigits, 2);
  const change = displayAmount(props.change || 0, noDigits, 2);

  const candleOpen = displayAmount(
    candlePrice?.open || 0,
    noDigits,
    fixedDecimals
  );

  const candleHigh = displayAmount(
    candlePrice?.high || 0,
    noDigits,
    fixedDecimals
  );

  const candleLow = displayAmount(
    candlePrice?.low || 0,
    noDigits,
    fixedDecimals
  );

  const candleClose = displayAmount(
    candlePrice?.close || 0,
    noDigits,
    fixedDecimals
  );

  useEffect(() => {
    const chartContainer = chartContainerRef.current;

    // dispatch(fetchCandlesForInitialPeriod());
    if (data && data.length > 0) {
      dispatch(initializeLegend());
    }

    if (chartContainer) {
      const handleResize = () => {
        chart.applyOptions({ width: chartContainer.clientWidth });
      };

      const chart = createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 500,
        //MODIFY THEME COLOR HERE
        layout: {
          background: {
            color: theme["base-200"],
          },
          textColor: theme["primary-content"],
        },
        //MODIFY THEME COLOR HERE
        grid: {
          vertLines: { color: theme["base-100"] },
          horzLines: { color: theme["base-100"] },
        },
        timeScale: {
          //MODIFY THEME COLOR HERE
          borderColor: theme["base-100"],
          timeVisible: true,
        },
      });

      const clonedData = JSON.parse(JSON.stringify(data));

      // OHLC
      const ohlcSeries = chart.addCandlestickSeries({});
      ohlcSeries.setData(clonedData);

      ohlcSeries.applyOptions({
        wickUpColor: theme["success"],
        upColor: theme["success"],
        wickDownColor: theme["error"],
        downColor: theme["error"],
      });

      chart.priceScale("right").applyOptions({
        //MODIFY THEME COLOR HERE
        borderColor: theme["base-100"],
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
          color:
            datum.close - datum.open <= 0 ? theme["error"] : theme["success"], //error : success
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
  }, [data, theme, dispatch]);
  //Temporary brute force approach to trim the top of the chart to remove the gap
  return (
    <div>
      <div ref={chartContainerRef} className="relative mt-[-1.7rem]">
        <div
          ref={legendRef}
          className={
            "absolute font-bold text-xs text-left text-secondary-content mt-3 z-50 uppercase " +
            (props.isNegativeOrZero ? "!text-error" : "!text-success")
          }
        >
          <div className="flex justify-start gap-x-6">
            <div className="text-secondary-content">{candleDate}</div>
            <div>
              <span className="text-secondary-content">Change</span> {change} (
              {percChange})%
            </div>
            <div>
              <span className="text-secondary-content">Volume</span> {volume}
            </div>
          </div>
          <div className="flex justify-start gap-x-6">
            <div>
              <span className="text-secondary-content">Open </span>
              {candleOpen}
            </div>
            <div>
              <span className="text-secondary-content">High </span>
              {candleHigh}
            </div>
            <div>
              <span className="text-secondary-content">Low </span>
              {candleLow}
            </div>
            <div>
              <span className="text-secondary-content">Close </span>
              {candleClose}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
      <div className="flex items-center justify-between">
        <div className="">
          <span className="text-secondary-content text-sm font-bold uppercase">
            Trading Chart
          </span>
        </div>
        <div className="">
          {CANDLE_PERIODS.map((period) => (
            <button
              key={period}
              className={`btn btn-sm text-secondary-content ${
                candlePeriod === period
                  ? "!text-primary-content underline underline-offset-8 decoration-accent"
                  : ""
              }`}
              onClick={() => dispatch(setCandlePeriod(period))}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      <PriceChartCanvas
        data={state.ohlcv}
        candlePrice={candlePrice}
        change={change}
        percChange={percChange}
        volume={currentVolume}
        isNegativeOrZero={isNegativeOrZero}
      />
    </div>
  );
}
