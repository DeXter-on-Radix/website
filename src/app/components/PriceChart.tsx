import { createChart, CrosshairMode, LineStyle } from "lightweight-charts";
import React, { useEffect, useRef, useState } from "react";
import {
  CANDLE_PERIODS,
  OHLCVData,
  setCandlePeriod,
} from "../redux/priceChartSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

//COLORS==========================
const darkTheme = {
  layout: {
    backgroundColor: "#121212",
    textColor: "#E8E8E8",
  },
  grid: {
    vertLines: {
      color: "#333333",
    },
    horzLines: {
      color: "#333333",
    },
  },
  candlestick: {
    upColor: "#4caf50",
    downColor: "#f44336",
    borderDownColor: "#f44336",
    borderUpColor: "#4caf50",
  },
};

const lightTheme = {
  layout: {
    backgroundColor: "#FFFFFF",
    textColor: "#333",
  },
  grid: {
    vertLines: {
      color: "#E8E8E8",
    },
    horzLines: {
      color: "#E8E8E8",
    },
  },
  candlestick: {
    upColor: "#4caf50",
    downColor: "#f44336",
    borderDownColor: "#f44336",
    borderUpColor: "#4caf50",
  },
};
//COLORS=======================================
interface PriceChartProps {
  data: OHLCVData[];
}

function PriceChartCanvas(props: PriceChartProps) {
  const [candlePrice, setCandlePrice] = useState<OHLCVData | null>(null); //FOR LEGENDS
  const [percChange, setPercChange] = useState<number | null>(null); //FOR PERCENT CHANGE
  const [currentVolume, setCurrentVolume] = useState<number>(0); //FOR LEGEND VOLUME
  const [prevClose, setPrevClose] = useState<number | null>(null); //PREVIOUS CANDLE'S CLOSE PRICE
  const [prevVolume, setPrevVolume] = useState<number | null>(null); //PREVIOUS CANDLE'S VOLUME
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch(); //TEMP
  const pairName = useAppSelector((state) => state.pairSelector.name);
  const candlePeriod = useAppSelector((state) => state.priceChart.candlePeriod);
  const { data } = props;

  //Util functions
  const formatPercentageChange = (percChange: number | null): string => {
    if (percChange !== null) {
      return `(${percChange.toFixed(2)}%)`;
    }
    return "(0.00%)";
  };

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

      //PERCENT CHANGE
      const computePercentageChange = (
        currentClose: number | null,
        prevClose: number | null
      ): number | null => {
        if (currentClose !== null && prevClose !== null) {
          const difference = currentClose - prevClose;
          return (difference / prevClose) * 100;
        }
        return null;
      };

      // PRICEDATA FOR CROSSHAIR
      chart.subscribeCrosshairMove((param) => {
        if (param.time) {
          const currentIndex = data.findIndex(
            (candle) => candle.time === param.time
          );

          if (currentIndex > 0 && currentIndex < data.length) {
            const currentData = data[currentIndex];
            const prevCandle = data[currentIndex - 1];

            setPrevClose(prevCandle.close);
            const volumeData = param.seriesData.get(volumeSeries) as OHLCVData;
            const percentageDifference = computePercentageChange(
              currentData.close,
              prevCandle.close
            );
            setPercChange(percentageDifference);
            setCandlePrice(currentData);
            setCurrentVolume(volumeData ? volumeData.value : 0);
          }
        }
        //console.log(data);
      });
      chart.priceScale("right").applyOptions({
        //COLOR
        borderColor: "#71649C",
        scaleMargins: {
          top: 0,
          bottom: 0.2,
        },
      });

      //VOLUME COLOR
      const getVolumeBarColor = (
        currentClose: number,
        prevClose: number
      ): string => {
        const percChange = ((currentClose - prevClose) / prevClose) * 100;
        return percChange < 0 ? "#f44336" : "#4caf50";
      };

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

  return (
    <div ref={chartContainerRef} className="relative">
      <div className="absolute top-[1vh] left-0 w-full z-20 bg-gray-900 mt-[-2vh] rounded-t-md">
        <div className="flex space-x-[1vw] p-[1vh] transform scale-[calc(1 - 0.01*vw)]">
          <div className="pr-[2vw] text-lg font-roboto text-white">
            {pairName}
          </div>
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
      </div>
    </div>
  );
}

export function PriceChart() {
  const state = useAppSelector((state) => state.priceChart);

  return (
    <div>
      <div className="flex flex-col">
        <PriceChartCanvas data={state.ohlcv} />
      </div>
    </div>
  );
}
