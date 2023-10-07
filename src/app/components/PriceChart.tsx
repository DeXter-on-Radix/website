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
}

function PriceChartCanvas(props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const { data, candlePrice, change, percChange, volume } = props;
  const theme = tailwindConfig.daisyui.themes[0].dark;

  // Update the legend
  if (legendRef.current && candlePrice) {
    const noDigits = 4;
    const decimalSeparator = ".";
    const thousandSeparator = ",";
    const fixedDecimals = 3;
    //This is a fix because for some rease the useEffect is called multiple times.
    if (legendRef.current.firstChild) {
      const firstRow = legendRef.current;
      firstRow.innerText =
        "Open " +
        displayAmount(
          candlePrice.open,
          noDigits,
          decimalSeparator,
          thousandSeparator,
          fixedDecimals
        ) +
        " High " +
        displayAmount(
          candlePrice.high,
          noDigits,
          decimalSeparator,
          thousandSeparator,
          fixedDecimals
        ) +
        " Low " +
        displayAmount(
          candlePrice.low,
          noDigits,
          decimalSeparator,
          thousandSeparator,
          fixedDecimals
        ) +
        " Close " +
        displayAmount(
          candlePrice.close,
          noDigits,
          decimalSeparator,
          thousandSeparator,
          fixedDecimals
        ) +
        " Change " +
        displayAmount(
          change,
          noDigits,
          decimalSeparator,
          thousandSeparator,
          fixedDecimals
        ) +
        "(" +
        displayAmount(
          percChange,
          noDigits,
          decimalSeparator,
          thousandSeparator,
          fixedDecimals
        ) +
        "%)" +
        " Volume " +
        displayAmount(
          volume,
          noDigits,
          decimalSeparator,
          thousandSeparator,
          fixedDecimals
        );
    }
  }

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

      // Create the legend
      if (legendRef.current) {
        const firstRow = document.createElement("div");
        //This is a fix because for some rease the useEffect is called multiple times.
        if (!legendRef.current.firstChild) {
          legendRef.current.appendChild(firstRow);
        }
      }

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
  }, [data, dispatch]);
  //Temporary brute force approach to trim the top of the chart to remove the gap
  return (
    <div>
      <div ref={chartContainerRef} className="relative mt-[-1.7rem]">
        <div
          ref={legendRef}
          className="absolute text-xs text-secondary-content mt-3 z-50 uppercase"
        ></div>
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

  //console.log(candlePrice.close)

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
      />
    </div>
  );
}
