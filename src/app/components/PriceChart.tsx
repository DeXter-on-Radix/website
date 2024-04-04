import { createChart } from "lightweight-charts";
import React, { useEffect, useRef } from "react";
import {
  CANDLE_PERIODS,
  OHLCVData,
  setCandlePeriod,
  handleCrosshairMove,
  // fetchCandlesForInitialPeriod,
  initializeLegend,
  initialPriceChartState,
} from "../state/priceChartSlice";
import { useAppDispatch, useAppSelector, useTranslations } from "../hooks";
import { displayNumber } from "../utils";
import * as tailwindConfig from "../../../tailwind.config";

interface PriceChartProps {
  data: OHLCVData[];
  candlePrice: OHLCVData | null;
  change: number | null;
  percChange: number | null;
  volume: number | null;
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

  const volume = displayNumber(props.volume || 0, noDigits, 2);
  const percChange = displayNumber(props.percChange || 0, noDigits, 2);
  const change = displayNumber(props.change || 0, noDigits, 2);

  const candleOpen = displayNumber(
    candlePrice?.open || 0,
    noDigits,
    fixedDecimals
  );

  const candleHigh = displayNumber(
    candlePrice?.high || 0,
    noDigits,
    fixedDecimals
  );

  const candleLow = displayNumber(
    candlePrice?.low || 0,
    noDigits,
    fixedDecimals
  );

  const candleClose = displayNumber(
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
        height: 300, // TODO(dcts): set back to 500
        layout: {
          background: {
            color: theme["base-200"],
          },
          textColor: theme["secondary-content"],
        },
        grid: {
          vertLines: { color: theme["base-100"] },
          horzLines: { color: theme["base-100"] },
        },
        timeScale: {
          borderColor: theme["base-100"],
          timeVisible: true,
        },
        crosshair: {
          vertLine: {
            color: theme["accent"],
            labelBackgroundColor: theme["accent"],
          },
          horzLine: {
            color: theme["accent"],
            labelBackgroundColor: theme["accent"],
          },
        },
      });

      const clonedData = JSON.parse(JSON.stringify(data));

      // OHLC
      const ohlcSeries = chart.addCandlestickSeries({
        priceLineVisible: false,
        lastValueVisible: false,
      });
      ohlcSeries.setData(clonedData);

      ohlcSeries.applyOptions({
        borderUpColor: theme["success"],
        wickUpColor: theme["success"],
        upColor: theme["success"],
        borderDownColor: theme["error"],
        wickDownColor: theme["error"],
        downColor: theme["error"],
      });

      chart.priceScale("right").applyOptions({
        borderColor: theme["base-100"],
        scaleMargins: {
          top: 0.1,
          bottom: 0.3,
        },
      });

      // Volume Initialization
      const volumeSeries = chart.addHistogramSeries({
        priceLineVisible: false,
        lastValueVisible: false,
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "volume",
      });

      volumeSeries.setData(
        data.map((datum) => ({
          ...datum,
          color:
            datum.close - datum.open < 0 ? theme["error"] : theme["success"],
        }))
      );

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

      // Configure chart for full-canvas candle display. For reference: https://github.com/DeXter-on-Radix/website/issues/269
      chart
        .timeScale()
        .setVisibleLogicalRange({ from: 0, to: clonedData.length });

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
            "absolute font-bold text-xs text-left text-secondary-content mt-3 z-20 uppercase " +
            (props.change && props.change < 0 ? "!text-error" : "!text-success")
          }
        >
          <div className="flex justify-start gap-x-6 text-xs font-medium">
            <div className="text-secondary-content">{candleDate}</div>
            <div className="text-xs font-medium">
              <span className="text-secondary-content">Change</span> {change} (
              {percChange})%
            </div>
            <div className="text-xs font-medium">
              <span className="text-secondary-content">Volume</span> {volume}
            </div>
          </div>
          <div className="flex justify-start gap-x-6">
            <div className="text-xs font-medium">
              <span className="text-secondary-content">Open </span>
              {candleOpen}
            </div>
            <div className="text-xs font-medium">
              <span className="text-secondary-content">High </span>
              {candleHigh}
            </div>
            <div className="text-xs font-medium">
              <span className="text-secondary-content">Low </span>
              {candleLow}
            </div>
            <div className="text-xs font-medium">
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
  const t = useTranslations();
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

  // Set default candlePeriod state as defined in initialState of priceChartSlice
  useEffect(() => {
    dispatch(setCandlePeriod(initialPriceChartState.candlePeriod));
  }, [dispatch]);

  const {
    type,
    side,
    postOnly,
    token1,
    token2,
    // validationToken1,
    // validationToken2,
    // description,
    specifiedToken,
    quote,
    price,
  } = useAppSelector((state) => state.orderInput);
  // const tartgetToken = useAppSelector(selectTargetToken);

  let msg = `side = ${side}\n`;
  msg += `type = ${type}\n`;
  msg += `postOnly = ${postOnly}\n`;
  msg += `price = ${price} ${token2.symbol}\n`;
  msg += `Token1 (quantity) = ${token1.amount} ${token1.symbol}\n`;
  msg += `Token2 (total) = ${token2.amount} ${token2.symbol}\n`;
  msg += `specifiedToken = ${specifiedToken}\n`;
  msg += `quote = ${quote}\n`;

  return (
    <div>
      <strong>STATE DEBUGGER</strong>
      <table className="max-w-[500px] m-auto mb-5">
        <tbody>
          {msg.split("\n").map((line, index) => {
            const parts = line.split("="); // Split each line by "="
            return (
              <tr key={index}>
                <td style={{ padding: 0, fontSize: "18px" }} className="w-1/2">
                  {parts[0]}
                </td>{" "}
                {/* First part of the line */}
                <td style={{ padding: 0, fontSize: "18px" }} className="w-1/2">
                  {parts[1]}
                </td>{" "}
                {/* Second part of the line */}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex items-center justify-between sm:pr-10">
        <div className="">
          <span className="text-secondary-content text-sm font-bold uppercase">
            {t("trading_chart")}
          </span>
        </div>
        <div className="">
          {CANDLE_PERIODS.map((period) => (
            <button
              key={period}
              className={`btn btn-sm text-secondary-content focus-within:-outline-offset-2 ${
                candlePeriod === period
                  ? "!text-primary-content underline underline-offset-8 decoration-accent"
                  : ""
              }`}
              onClick={() => dispatch(setCandlePeriod(period))}
            >
              {t(period)}
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
