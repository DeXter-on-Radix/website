"use client";

/**
 * MVP ToDos:
 * - [ ] load public data from spreadsheet
 * - [ ] extract:
 *   - [ ] weekly trade volume in XRD
 *   - [ ] weekly trade volume in USD
 *   - [ ] weekly unique website visitors
 *   - [ ] weekly website requests
 *   - [ ] social media followers
 */

import { useEffect, useState, useRef } from "react";
import { fetchKpiData, KpiData } from "./kpis-utils";
import { displayNumber } from "utils";
import { createChart } from "lightweight-charts";

enum Status {
  LOADING = "LOADING",
  OK = "OK",
  ERROR = "ERROR",
}

export default function Kpis() {
  const [status, setStatus] = useState<Status>(Status.LOADING);
  const [kpiData, setKpiData] = useState<KpiData>({} as KpiData);

  useEffect(() => {
    async function fetch() {
      try {
        setStatus(Status.LOADING);
        const kpiDataTemp = await fetchKpiData();
        setKpiData(kpiDataTemp);
        setStatus(Status.OK);
      } catch (err) {
        setStatus(Status.ERROR);
      }
    }
    fetch();
  }, []);

  return (
    <div className="my-10 p-10">
      {status === Status.LOADING && <LoadingState />}
      {status === Status.ERROR && <ErrorStatus />}
      {status === Status.OK && <KpiDashboard kpiData={kpiData} />}
    </div>
  );
}

function ErrorStatus() {
  return <>Error!</>;
}

function LoadingState() {
  return <>Loading...</>;
}

function KpiDashboard({ kpiData }: { kpiData: KpiData }) {
  console.log("INSIDE KPI DASH");
  console.log(kpiData);
  return (
    <>
      <h1>KPI Dashboard</h1>
      <p>
        TOTAL Trade Volume (USD): {displayNumber(kpiData.tradeVolume.total.USD)}
      </p>
      <p>TOTAL Trade Volume (XRD): {kpiData.tradeVolume.total.XRD}</p>
      <LineChart
        title={"Weekly Trade Volume (XRD)"}
        x={kpiData.tradeVolume.weekly.XRD.map((o) => o.weekIdentifier)}
        y={kpiData.tradeVolume.weekly.XRD.map((o) => o.value)}
      />
      <LineChart
        title={"Weekly Trade Volume (USD)"}
        x={kpiData.tradeVolume.weekly.USD.map((o) => o.weekIdentifier)}
        y={kpiData.tradeVolume.weekly.USD.map((o) => o.value)}
      />
      <h2>Socials</h2>
      <p>Youtube Subscribers: {kpiData.socials.youtubeSubscribers}</p>
      <p>Instagram Followers: {kpiData.socials.instagramFollowers}</p>
      <p>Twitter Followers: {kpiData.socials.twitterFollowers}</p>
    </>
  );
}

function LineChart({
  title,
  x,
  y,
}: {
  title: string;
  x: string[];
  y: number[];
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: 400,
        height: 250,
      });
      const lineSeries = chart.addLineSeries();

      const formattedData = x.map((date, index) => ({
        time: new Date(date).toISOString().split("T")[0],
        value: y[index],
      }));

      lineSeries.setData(formattedData);

      // Automatically fit the data to the canvas
      chart.timeScale().fitContent();

      return () => {
        chart.remove();
      };
    }
  }, [x, y]);

  return (
    <div>
      <div
        style={{
          textAlign: "left",
          margin: "0",
          fontSize: "22px",
          color: "white",
        }}
      >
        {title}
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
}
