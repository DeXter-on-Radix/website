import { createChart } from "lightweight-charts";
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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch(); //TEMP
  const candlePeriod = useAppSelector((state) => state.priceChart.candlePeriod);
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
        //COLOR
        layout: {
          background: { color: "#222" },
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

      // PRICEDATA FOR CROSSHAIR
      chart.subscribeCrosshairMove((param) => {
        if (param.time) {
          const currentData = param.seriesData.get(ohlcSeries) as OHLCVData;
          const volumeData = param.seriesData.get(volumeSeries) as OHLCVData;
          const difference = currentData.close - currentData.open;
          const percentageDifference = (difference / currentData.open) * 100;
          setPercChange(percentageDifference);
          setCandlePrice(currentData);
          setCurrentVolume(volumeData ? volumeData.value : 0);
        }
        // console.log(data);
      });
      chart.priceScale("right").applyOptions({
        //COLOR
        borderColor: "#71649C",
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

  return (
    <div ref={chartContainerRef} style={{ position: "relative" }}>
      <div className="absolute top-0 left-0 w-full z-20 bg-gray-800">
        <div className="flex space-x-2 p-2">
          {CANDLE_PERIODS.map((period) => (
            <button
              key={period}
              className={`px-4 py-1 text-white hover:bg-white hover:bg-opacity-30 hover:rounded-md ${
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
        style={{
          position: "absolute",
          top: 80,
          left: 20,
          zIndex: 20,
          color: "white",
        }}
      >
        <div style={{ display: "flex" }}>
          <div style={{ marginRight: 10 }}>O: {candlePrice?.open}</div>
          <div style={{ marginRight: 10 }}>H: {candlePrice?.high}</div>
          <div style={{ marginRight: 10 }}>L: {candlePrice?.low}</div>
          <div style={{ marginRight: 10 }}>C: {candlePrice?.close}</div>
          <div style={{ marginRight: 10 }}>
            {percChange ? `(${percChange.toFixed(2)}%)` : "(0.00%)"}
          </div>
        </div>
        <div>Volume: {currentVolume === 0 ? 0 : currentVolume.toFixed(2)}</div>
      </div>
    </div>
  );
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
      <div className="flex flex-col">
        <div>sometext</div>
        <PriceChartCanvas data={state.ohlcv} />
      </div>
    </div>
  );
}
