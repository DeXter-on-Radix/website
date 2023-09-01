import { createChart } from "lightweight-charts";
import React, { useEffect, useRef, useState } from "react";
import {
  CANDLE_PERIODS,
  OHLCVData,
  setCandlePeriod,
} from "../redux/priceChartSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

interface PriceChartProps {
  data: OHLCVData[];
  theme: "dark" | "light";
}

const colors = [
  "#008FFB",
  "#00E396",
  "#FEB019",
  "#FF4560",
  "#775DD0",
  "#F86624",
  "#A5978B",
];

const darkTheme = {
  layout: {
    backgroundColor: "#131722",
    lineColor: "#2B2B43",
    textColor: "#D9D9D9",
  },
  grid: {
    vertLines: {
      color: "#363c4e",
    },
    horzLines: {
      color: "#363c4e",
    },
  },
};

const lightTheme = {
  layout: {
    backgroundColor: "#FFFFFF",
    lineColor: "#2B2B43",
    textColor: "#191919",
  },
  grid: {
    vertLines: {
      color: "#e1ecf2",
    },
    horzLines: {
      color: "#e1ecf2",
    },
  },
};

interface PriceChartProps {
  data: OHLCVData[];
  theme: "dark" | "light";
}

function PriceChartCanvas(props: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>();
  const { data, theme } = props;
  const chartOptions = theme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (chartContainer) {
      const handleResize = () => {
        chartRef.current?.applyOptions({ width: chartContainer.clientWidth });
      };

      const chart = createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 450,
        ...chartOptions,
        timeScale: {
          timeVisible: true,
          borderVisible: true, // Making sure the timeScale border is visible
        },
      });
      chartRef.current = chart;

      const ohlcSeries = chart.addCandlestickSeries({});
      ohlcSeries.setData(JSON.parse(JSON.stringify(data)));
      chart.priceScale("right").applyOptions({
        scaleMargins: {
          top: 0,
          bottom: 0.2,
        },
      });

      const volumeSeries = chart.addHistogramSeries({
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "volume",
        color: colors[4], // Using the purple from your colors array to make it stand out
      });
      volumeSeries.setData(JSON.parse(JSON.stringify(data)));
      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.remove();
      };
    }
  }, [data, chartOptions]);

  return (
    <div
      ref={chartContainerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "450px",
        overflow: "visible !important",
      }}
    />
  );
}

export function PriceChart() {
  const state = useAppSelector((state) => state.priceChart);
  const dispatch = useAppDispatch();

  const [currentTheme, setTheme] = useState<"dark" | "light">("light");

  const handleToggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
  return (
    <div>
      <button
        style={{ display: "block", marginBottom: "10px" }} // Ensuring visibility
        onClick={handleToggleTheme}
      >
        Toggle Theme
      </button>

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

      <PriceChartCanvas data={state.ohlcv} theme={currentTheme} />
    </div>
  );
}
