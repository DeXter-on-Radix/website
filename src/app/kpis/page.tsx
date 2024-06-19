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
    <div className="my-10 p-10 flex flex-col items-center">
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
  // console.log("INSIDE KPI DASH");
  // console.log(kpiData);
  return (
    <>
      <div className="xs:w-[400px] sm:w-[400px] md:[800px] lg:w-[800px] ">
        <h2 className="text-md text-[45px] mb-[20px] bg-gradient-to-r from-dexter-gradient-blue to-dexter-gradient-green to-50% bg-clip-text text-transparent font-normal">
          KPI Dashboard
        </h2>
        <div className="flex flex-col">
          <p className="text-[24px] m-1">Trading</p>
          <div className="flex flex-wrap">
            <div className="m-1">
              <div className="border-[#3c3d3d] border-[2px] p-4 rounded-xl mb-1">
                <p className="text-[14px] text-[#768089]">
                  TOTAL Trade Volume (USD)
                </p>
                <p>{Math.round(kpiData.tradeVolume.total.USD).toLocaleString("en-EN")}</p>
              </div>
              <div className="border-[#3c3d3d] border-[2px] p-4 rounded-xl mt-1">
                <LineChart
                  title={"Weekly Trade Volume (USD)"}
                  lastWeekAmount={Math.round(kpiData.tradeVolume.total.USD).toLocaleString("en-EN")}
                  x={kpiData.tradeVolume.weekly.USD.map((o) => o.weekIdentifier)}
                  y={kpiData.tradeVolume.weekly.USD.map((o) => o.value)}
                />
              </div>
            </div>
            <div className="m-1">
              <div className="border-[#3c3d3d] border-[2px] p-4 rounded-xl mb-1">
                <p className="text-[14px] text-[#768089]">
                  TOTAL Trade Volume (XRD)
                </p>
                <p>{Math.round(kpiData.tradeVolume.total.XRD).toLocaleString("en-EN")}</p>
              </div>
              <div className="border-[#3c3d3d] border-[2px] p-4 rounded-xl mt-1">
                <LineChart
                  title={"Weekly Trade Volume (XRD)"}
                  lastWeekAmount={Math.round(kpiData.tradeVolume.total.XRD).toLocaleString("en-EN")}
                  x={kpiData.tradeVolume.weekly.XRD.map((o) => o.weekIdentifier)}
                  y={kpiData.tradeVolume.weekly.XRD.map((o) => o.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-8">
          <p className="text-[24px] m-1">Website</p>
          <div className="flex flex-wrap">
            <div className="border-[#3c3d3d] border-[2px] p-4 rounded-xl m-1">
              <LineChart
                title={"Weekly Website Page Requests"}
                lastWeekAmount={kpiData.website.pageRequests[kpiData.website.pageRequests.length-1].value}
                x={kpiData.website.pageRequests.map((o) => o.weekIdentifier)}
                y={kpiData.website.pageRequests.map((o) => o.value)}
              />
            </div>
            <div className="border-[#3c3d3d] border-[2px] p-4 rounded-xl m-1">
              <LineChart
                title={"Weekly Website Unique Visitors"}
                lastWeekAmount={kpiData.website.uniqueVisitors[kpiData.website.uniqueVisitors.length - 1].value}
                x={kpiData.website.uniqueVisitors.map((o) => o.weekIdentifier)}
                y={kpiData.website.uniqueVisitors.map((o) => o.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-8 w-full">
          <p className="text-[24px]">Socials</p>
          <div className="flex w-full justify-between flex-wrap">
            <div className="flex lg:w-[265px] sm:w-[400px] xs:w-[400px] sm:mt-2 xs:mt-2  border-[#3c3d3d] border-[2px] p-4 rounded-xl ">
              <img src="/socials/youtube.png" width={56} height={56} alt="" />
              <div className="pl-2">
                <p className="text-[11px]">Subscribers</p>
                <p className="text-2xl text-[#FFFFFF]">{kpiData.socials.youtubeSubscribers}</p>
              </div>
            </div>
            <div className="flex lg:w-[265px] sm:w-[400px] xs:w-[400px] sm:mt-2 xs:mt-2 border-[#3c3d3d] border-[2px] p-4 rounded-xl ">
              <img src="/socials/instagram.png" width={56} height={56} alt="" />
              <div className="pl-2">
                <p className="text-[11px]">Followers</p>
                <p className="text-2xl text-[#FFFFFF]">{kpiData.socials.instagramFollowers}</p>
              </div>
            </div>
            <div className="flex lg:w-[265px] sm:w-[400px] xs:w-[400px] sm:mt-2 xs:mt-2 border-[#3c3d3d] border-[2px] p-4 rounded-xl ">
              <img src="/socials/twitter.png" width={56} height={56} alt="" />
              <div className="pl-2">
                <p className="text-[11px]">Followers</p>
                <p className="text-2xl text-[#FFFFFF]">{kpiData.socials.twitterFollowers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LineChart({
  title,
  lastWeekAmount,
  x,
  y,
}: {
  title: string;
  lastWeekAmount: string;
  x: string[];
  y: number[];
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: 357,
        height: 280,
        layout: {
          background: "#191B1D",
          textColor: "rgba(255, 255, 255, 0.9)",
        },
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
          fontSize: "14px",
          color: "white",
        }}
      >
        {title}
      </div>
      <div>
        {lastWeekAmount}
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
}
