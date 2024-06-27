"use client";

import { useEffect, useState, useRef } from "react";
import { fetchKpiData, KpiData } from "./kpis-utils";
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
    <div className="p-10 flex flex-col items-center">
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
  return (
    <>
      <div className="xs:w-[400px] sm:w-[400px] md:[800px] lg:w-[800px] max-w-[100vw]">
        <DexterHeading title="KPI Dashboard" />
        <div className="flex flex-col">
          <p className="text-2xl m-1 !mb-1">Trading</p>
          <div className="flex flex-wrap">
            <div className="m-1">
              <div className="border-[#2e2e2e] border-[2px] p-4 rounded-xl mb-1">
                <p className="text-sm text-[#768089] pb-1">
                  TOTAL Trade Volume (USD)
                </p>
                <p className="text-xl">
                  {Math.round(kpiData.tradeVolume.total.USD).toLocaleString(
                    "en-EN"
                  )}{" "}
                  USD
                </p>
              </div>
              <div className="border-[#2e2e2e] border-[2px] p-4 rounded-xl mt-1">
                <LineChart
                  title={"Weekly Trade Volume (USD)"}
                  x={kpiData.tradeVolume.weekly.USD.map(
                    (o) => o.weekIdentifier
                  )}
                  y={kpiData.tradeVolume.weekly.USD.map((o) => o.value)}
                />
              </div>
            </div>
            <div className="m-1">
              <div className="border-[#2e2e2e] border-[2px] p-4 rounded-xl mb-1">
                <p className="text-sm text-[#768089] pb-1">
                  TOTAL Trade Volume (XRD)
                </p>
                <p className="text-xl">
                  {Math.round(kpiData.tradeVolume.total.XRD).toLocaleString(
                    "en-EN"
                  )}{" "}
                  XRD
                </p>
              </div>
              <div className="border-[#2e2e2e] border-[2px] p-4 rounded-xl mt-1">
                <LineChart
                  title={"Weekly Trade Volume (XRD)"}
                  x={kpiData.tradeVolume.weekly.XRD.map(
                    (o) => o.weekIdentifier
                  )}
                  y={kpiData.tradeVolume.weekly.XRD.map((o) => o.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-8">
          <p className="text-2xl m-1 !mb-1">Website</p>
          <div className="flex flex-wrap">
            <div className="border-[#2e2e2e] border-[2px] p-4 rounded-xl m-1">
              <LineChart
                title={"Page Requests (Weekly)"}
                x={kpiData.website.pageRequests.map((o) => o.weekIdentifier)}
                y={kpiData.website.pageRequests.map((o) => o.value)}
              />
            </div>
            <div className="border-[#2e2e2e] border-[2px] p-4 rounded-xl m-1">
              <LineChart
                title={"Unique Visitors (Weekly)"}
                x={kpiData.website.uniqueVisitors.map((o) => o.weekIdentifier)}
                y={kpiData.website.uniqueVisitors.map((o) => o.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-8 pb-24 w-full">
          <p className="text-2xl">Socials</p>
          <div className="flex w-full justify-between flex-wrap">
            <div className="flex lg:w-[265px] sm:w-[400px] xs:w-[400px] sm:mt-2 xs:mt-2  border-[#2e2e2e] border-[2px] p-4 rounded-xl ">
              <img src="/socials/youtube.png" width={56} height={56} alt="" />
              <div className="pl-2">
                <p className="text-[11px]">Subscribers</p>
                <p className="text-2xl text-[#FFFFFF]">
                  {kpiData.socials.youtubeSubscribers}
                </p>
              </div>
            </div>
            <div className="flex lg:w-[265px] sm:w-[400px] xs:w-[400px] sm:mt-2 xs:mt-2 border-[#2e2e2e] border-[2px] p-4 rounded-xl ">
              <img src="/socials/instagram.png" width={56} height={56} alt="" />
              <div className="pl-2">
                <p className="text-[11px]">Followers</p>
                <p className="text-2xl text-[#FFFFFF]">
                  {kpiData.socials.instagramFollowers}
                </p>
              </div>
            </div>
            <div className="flex lg:w-[265px] sm:w-[400px] xs:w-[400px] sm:mt-2 xs:mt-2 border-[#2e2e2e] border-[2px] p-4 rounded-xl ">
              <img src="/socials/twitter.png" width={56} height={56} alt="" />
              <div className="pl-2">
                <p className="text-[11px]">Followers</p>
                <p className="text-2xl text-[#FFFFFF]">
                  {kpiData.socials.twitterFollowers}
                </p>
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
        width: 357,
        height: 280,
        layout: {
          background: { color: "#191B1D" },
          textColor: "rgba(255, 255, 255, 0.9)",
        },
        grid: {
          vertLines: {
            color: "#232433", // Vertical grid lines color
          },
          horzLines: {
            color: "#232433", // Horizontal grid lines color
          },
        },
      });

      const lineSeries = chart.addLineSeries({
        color: "#A7D22D",
        lineWidth: 2,
        lastValueVisible: true,
        priceLineVisible: false,
      });
      const formattedData = x.map((date, index) => ({
        time: new Date(date).toISOString().split("T")[0],
        value: y[index],
      }));
      lineSeries.setData(formattedData);

      // Automatically fit the data to the canvas
      chart.timeScale().fitContent();

      // Apply options
      chart.applyOptions({
        localization: {
          priceFormatter: Intl.NumberFormat("en-EN", {
            maximumFractionDigits: 0, // No decimal places
          }).format,
        },
      });

      // Fix margin/spacing to make x-axis visible again
      const tvLightweightChartTable = chartContainerRef.current.querySelector(
        ".tv-lightweight-charts table"
      ) as HTMLElement;
      tvLightweightChartTable.style.margin = "0";

      return () => {
        chart.remove();
      };
    }
  }, [x, y]);

  return (
    <div>
      <p className="text-base text-[#768089] pb-2">{title}</p>
      <div ref={chartContainerRef} />
    </div>
  );
}

function DexterHeading({ title }: { title: string }) {
  return (
    <>
      <h1 className="!m-0 !mb-5 text-5xl text-md bg-gradient-to-r from-dexter-gradient-blue to-dexter-gradient-green to-50% bg-clip-text text-transparent font-normal">
        {title}
      </h1>
    </>
  );
}
