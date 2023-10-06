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
import { formatPercentageChange } from "../utils";
import { displayAmount } from "../utils";
import * as tailwindConfig from "../../../tailwind.config";

interface PriceChartProps {
  data: OHLCVData[];
}

interface candleData {
  open: number | undefined;
  high: number | undefined;
  low: number | undefined;
  close: number | undefined;
}
function PriceChartCanvas(props: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const { data } = props;
  const theme = tailwindConfig.daisyui.themes[0].dark;

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
            color: theme["base-100"],
          }, //base-100
          textColor: theme["primary-content"],
        },
        //MODIFY THEME COLOR HERE
        grid: {
          vertLines: { color: theme["secondary-content"] },
          horzLines: { color: theme["secondary-content"] },
        },
        timeScale: {
          //MODIFY THEME COLOR HERE
          borderColor: theme["primary-content"],
          timeVisible: true,
        },
      });

      // Create the legend
      if (legendRef.current) {
        const firstRow = document.createElement("div");
        //This is a fix because for some rease the useEffect is called multiple times.
        if (!legendRef.current.firstChild) {
          legendRef.current.appendChild(firstRow);
          firstRow.style.color = theme["primary-content"];
        }
        firstRow.innerText = "OHLC";
      }

      const clonedData = JSON.parse(JSON.stringify(data));

      // OHLC
      const ohlcSeries = chart.addCandlestickSeries({});
      ohlcSeries.setData(clonedData);

      ohlcSeries.applyOptions({
        wickUpColor: theme["success"], //success
        upColor: theme["success"], //success
        wickDownColor: theme["error"], //error
        downColor: theme["error"], //error
      });

      chart.priceScale("right").applyOptions({
        //MODIFY THEME COLOR HERE
        borderColor: theme["primary-content"], //primary-content
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
  }, [data, dispatch]);
  //Temporary brute force approach to trim the top of the chart to remove the gap
  return (
    <div>
      <div ref={chartContainerRef} className="relative mt-[-1.7rem]">
        <div ref={legendRef} className="absolute z-50"></div>
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
  const noDigits = 4;
  const decimalSeparator = ".";
  const thousandSeparator = ",";
  const fixedDecimals = 3;

  const candleData = {
    open: candlePrice?.open,
    high: candlePrice?.high,
    low: candlePrice?.low,
    close: candlePrice?.close,
  };

  return (
    <div>
      <div className="">
        <div className="flex">
          {CANDLE_PERIODS.map((period) => (
            <button
              key={period}
              className={`btn btn-sm ${
                candlePeriod === period ? "text-accent" : ""
              }`}
              onClick={() => dispatch(setCandlePeriod(period))}
            >
              {period}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-sm">
          <div className="ml-4">
            Open:{" "}
            <span>
              {displayAmount(
                candlePrice?.open || 0,
                noDigits,
                decimalSeparator,
                thousandSeparator,
                fixedDecimals
              )}
            </span>
          </div>
          <div>
            High:{" "}
            <span>
              {displayAmount(
                candlePrice?.high || 0,
                noDigits,
                decimalSeparator,
                thousandSeparator,
                fixedDecimals
              )}
            </span>
          </div>
          <div>
            Low:{" "}
            <span>
              {displayAmount(
                candlePrice?.low || 0,
                noDigits,
                decimalSeparator,
                thousandSeparator,
                fixedDecimals
              )}
            </span>
          </div>
          <div>
            Close:{" "}
            <span>
              {displayAmount(
                candlePrice?.close || 0,
                noDigits,
                decimalSeparator,
                thousandSeparator,
                fixedDecimals
              )}
            </span>
          </div>
          <div>
            Volume:{" "}
            <span>
              {displayAmount(
                currentVolume,
                noDigits,
                decimalSeparator,
                thousandSeparator,
                fixedDecimals
              )}
            </span>
          </div>
          <div className="mr-4">
            Change:{" "}
            <span className={isNegativeOrZero ? "text-error" : "text-success"}>
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
