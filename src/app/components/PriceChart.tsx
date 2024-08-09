import { createChart } from "lightweight-charts";
import React, { useState, useEffect, useRef } from "react";
import {
  CANDLE_PERIODS,
  OHLCVData,
  setCandlePeriod,
  handleCrosshairMove,
  initializeLegend,
  initialPriceChartState,
  setCopied,
} from "../state/priceChartSlice";
import { useAppDispatch, useAppSelector, useTranslations } from "../hooks";
import { displayNumber, getPrecision } from "../utils";
import * as tailwindConfig from "../../../tailwind.config";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdContentCopy } from "react-icons/md";
import { shortenString } from "../utils";
import { DexterToast } from "components/DexterToaster";

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
  const currency = useAppSelector((state) => state.pairSelector.token2.symbol);
  const dispatch = useAppDispatch();
  const { data, candlePrice } = props;
  const isLoading = data.length === 0;
  //displayTime offsets by local timezone, causing discrepancy on chart
  const candleDate = new Date(
    parseInt(candlePrice?.time.toString() || "") * 1000
  ).toUTCString();

  const theme = tailwindConfig.daisyui.themes[0].dark;

  const nbrOfDigits = 8;
  const currencyPrecision = getPrecision(currency);

  const volume = displayNumber(props.volume || 0, nbrOfDigits, 2);
  const percChange = displayNumber(props.percChange || 0, nbrOfDigits, 2);
  const percChangeFormatted = ` ${
    props.change && props.change > 0 ? "+" : ""
  }${percChange} %`;

  const candleOpen = displayNumber(
    candlePrice?.open || 0,
    nbrOfDigits,
    currencyPrecision
  );

  const candleHigh = displayNumber(
    candlePrice?.high || 0,
    nbrOfDigits,
    currencyPrecision
  );

  const candleLow = displayNumber(
    candlePrice?.low || 0,
    nbrOfDigits,
    currencyPrecision
  );

  const candleClose = displayNumber(
    candlePrice?.close || 0,
    nbrOfDigits,
    currencyPrecision
  );

  useEffect(() => {
    const chartContainer = chartContainerRef.current;

    if (data && data.length > 0) {
      dispatch(initializeLegend());
    }

    if (chartContainer) {
      const handleResize = () => {
        // hacky way to fix resizing issue. This is heavily dependant on the
        // grid area breakpoints, so whenever you change grid area, this
        // needs to be adapted too. This is not ideal and should be fixed.
        // TODO: fix price chart container so this code is not needed anymore.
        const adaptForPadding = 15 * 2; // 15px padding on each side
        const priceChartSize =
          window.innerWidth <= 850
            ? window.innerWidth
            : window.innerWidth <= 1025
            ? window.innerWidth - 300
            : window.innerWidth <= 1350
            ? window.innerWidth - 2 * 260
            : Math.min(921, window.innerWidth - 600);
        chart.applyOptions({ width: priceChartSize - adaptForPadding });
        // // OLD CODE
        // chart.applyOptions({ width: chartContainer.clientWidth });
      };
      const vh = window.innerHeight;
      const promoCarouselExists =
        document.querySelector(".promo-banner") !== null;
      const spaceTaken = promoCarouselExists ? 150 + 64 : 150;
      const chartHeight = Math.min(vh - spaceTaken, 550);
      const chart = createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: chartHeight,
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
        borderUpColor: theme["dexter-green"],
        wickUpColor: theme["dexter-green"],
        upColor: theme["dexter-green"],
        borderDownColor: theme["dexter-red"],
        wickDownColor: theme["dexter-red"],
        downColor: theme["dexter-red"],
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
            datum.close - datum.open < 0
              ? theme["dexter-red"]
              : theme["dexter-green"],
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

      // Configure chart candles to have max-width of 13px
      const totalCandles = clonedData.length;
      const chartWidth =
        document.querySelector(".chart-container-ref")?.clientWidth || 600;
      const minCandleWidth = 13; // in px
      const nbrOfCandlesToDisply = Math.min(chartWidth / minCandleWidth); //chartWidth / ;
      chart.timeScale().setVisibleLogicalRange({
        from: Math.max(totalCandles - nbrOfCandlesToDisply),
        to: totalCandles,
      });

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.remove();
      };
    }
  }, [data, theme, dispatch]);
  //Temporary brute force approach to trim the top of the chart to remove the gap
  return (
    <div>
      <div
        ref={chartContainerRef}
        className="relative mt-[-1.7rem] w-full chart-container-ref"
      >
        <div
          ref={legendRef}
          className={
            "absolute font-bold text-xs text-left text-secondary-content mt-3 z-20 " +
            (isLoading
              ? "hidden"
              : props.change && props.change < 0
              ? "!text-dexter-red"
              : "!text-dexter-green")
          }
        >
          <div className="flex justify-start gap-x-6 text-xs font-medium">
            <div className="text-secondary-content">{candleDate}</div>
            <div className="text-xs font-medium">
              <span className="text-secondary-content">Change</span>
              {percChangeFormatted}
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

enum ChartTabOptions {
  TRADING_CHART = "TRADING_CHART",
  PAIR_INFO = "PAIR_INFO",
}

export function TradingChartOrPairInfo() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const candlePeriod = useAppSelector((state) => state.priceChart.candlePeriod);

  // Set default candlePeriod state as defined in initialState of priceChartSlice
  useEffect(() => {
    dispatch(setCandlePeriod(initialPriceChartState.candlePeriod));
  }, [dispatch]);

  const [currentTab, setCurrentTab] = useState(ChartTabOptions.TRADING_CHART);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:pr-10 pr-4 border-b-[0.5px] border-b-[rgba(255,255,255,0.13)]">
        <div className="flex space-x-4 sm:space-x-5 pb-0 pt-2 px-2">
          {[
            [t("trading_chart"), ChartTabOptions.TRADING_CHART],
            [t("pair_info"), ChartTabOptions.PAIR_INFO],
          ].map(([title, tab], indx) => {
            const isActive = tab === currentTab;
            return (
              <span
                key={indx}
                className={`text-sm sm:text-base pb-2 sm:pb-3 ${
                  isActive
                    ? "text-dexter-green-OG border-b border-[#cafc40]"
                    : "text-[#768089]"
                } cursor-pointer`}
                onClick={() => setCurrentTab(tab as ChartTabOptions)}
              >
                {title}
              </span>
            );
          })}
        </div>
        {currentTab === ChartTabOptions.TRADING_CHART && (
          <div className="flex flex-wrap items-center justify-start sm:justify-end mt-2 sm:mt-0">
            {CANDLE_PERIODS.map((period) => (
              <button
                key={period}
                className={`btn btn-xs sm:btn-sm text-secondary-content focus-within:outline-none ${
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
        )}
      </div>
      <div className="mt-4">
        {currentTab === ChartTabOptions.TRADING_CHART && <TradingChart />}
        {currentTab === ChartTabOptions.PAIR_INFO && <PairInfoTab />}
      </div>
    </div>
  );
}

export function TradingChart() {
  const state = useAppSelector((state) => state.priceChart);
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

  return (
    <>
      <PriceChartCanvas
        data={state.ohlcv}
        candlePrice={candlePrice}
        change={change}
        percChange={percChange}
        volume={currentVolume}
      />
    </>
  );
}

export function PairInfoTab() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { pairsList } = useAppSelector((state) => state.pairSelector);
  const selectedPairAddress = useAppSelector(
    (state) => state.pairSelector.address
  );
  const pairInfo = pairsList.find(
    (pairInfo) => pairInfo.address === selectedPairAddress
  );

  if (!pairInfo) {
    return "Selected pair not found in pairsList";
  }
  const { name, address, orderReceiptAddress, token1, token2 } = pairInfo;

  const handleCopy = () => {
    dispatch(setCopied(true));
    DexterToast.success("Copied!");

    setTimeout(() => {
      dispatch(setCopied(false));
    }, 2000);
  };

  return (
    <>
      <div className="sm:p-4 xs:p-0 text-primary-content">
        <div className="text-lg font-normal mb-4">{name}</div>
        <div className="border-b border-b-[rgba(255,255,255,0.08)] pb-6">
          <div className="text-sm tracking-[0.5px] opacity-50 font-normal mb-1">
            {t("pair_resource")}
          </div>
          <div className="flex flex-row items-start mb-4">
            <div className="text-base flex items-center">
              <span className="mr-2">
                {shortenString(address, 8, 20, "...")}
              </span>
              <CopyToClipboard text={address} onCopy={handleCopy}>
                <MdContentCopy
                  className="cursor-pointer text-base"
                  title="Copy to clipboard"
                />
              </CopyToClipboard>
            </div>
          </div>

          <div className="text-sm tracking-[0.5px] opacity-50 font-normal mb-1">
            {t("order_receipt_address")}
          </div>
          <div className="flex flex-col sm:flex-row items-start">
            <div className="text-base flex items-center">
              <span className="mr-2">
                {shortenString(orderReceiptAddress, 8, 20, "...")}
              </span>
              <CopyToClipboard text={orderReceiptAddress} onCopy={handleCopy}>
                <MdContentCopy
                  className="cursor-pointer text-base"
                  title="Copy to clipboard"
                />
              </CopyToClipboard>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col items-start mb-4 sm:mb-0 flex-grow">
            <div className="flex items-start mb-2 pt-8">
              <img
                src={token1?.iconUrl}
                alt={token1?.symbol}
                className="w-8 h-8 rounded-full"
              />
              <p className="pl-2 text-base">
                {token1?.name.split(" ")[0]} ({token1?.symbol})
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm tracking-[0.5px] opacity-50 font-normal pt-4 !mb-1">
                {t("resource")}
              </p>
              <div className="flex items-start">
                <p className="text-base">
                  {shortenString(token1?.address, 8, 20, "...")}
                </p>
                <CopyToClipboard text={token1?.address} onCopy={handleCopy}>
                  <MdContentCopy
                    className="ml-2 cursor-pointer text-base"
                    title="Copy to clipboard"
                  />
                </CopyToClipboard>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-[rgba(255,255,255,0.05)] sm:border-r-2 sm:border-b-0 my-4 sm:my-0 sm:mx-4 sm:min-h-[150px] sm:max-h-[200px]"></div>

          <div className="flex flex-col items-start mb-4 sm:mb-0 flex-grow">
            <div className="flex items-center sm:mb-2 sm:pt-8 xs:pt-4">
              <img
                src={token2?.iconUrl}
                alt={token2?.symbol}
                className="w-8 h-8 rounded-full"
              />
              <p className="pl-2 text-base">
                {token2?.name.split(" ")[0]} ({token2?.symbol})
              </p>
            </div>
            <div className="flex flex-col xs:mb-12 sm:mb-0">
              <p className="text-sm tracking-[0.5px] opacity-50 font-normal pt-4 !mb-1">
                {t("resource")}
              </p>
              <div className="flex items-center">
                <p className="text-base">
                  {shortenString(token2?.address, 8, 20, "...")}
                </p>
                <CopyToClipboard text={token2?.address} onCopy={handleCopy}>
                  <MdContentCopy
                    className="ml-2 cursor-pointer text-base"
                    title="Copy to clipboard"
                  />
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TradingChartOrPairInfo;
