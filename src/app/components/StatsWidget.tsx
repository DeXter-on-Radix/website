"use client";

import { useAppSelector } from "hooks";
import { fetchKpiData, KpiData } from "kpis/kpis-utils";
import { useEffect, useState } from "react";
import { simpleFormatNumber } from "utils/simpleFormatNumber";
import AnimatedCounter from "./AnimatedCounter";

const StatsWidget = () => {
  // google sheet data
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  // alphadex data
  const { pairsList } = useAppSelector((state) => state.rewardSlice);

  // fetch socials & trade volumes (in XRD / USD)
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchKpiData();
        setKpiData(data);
      } catch (error) {
        console.error("StatsWidget -> fetchKpiData error", error);
      }
    })();
  }, []);

  // 1. google sheet data
  // 1.1. socials data
  const socials = kpiData?.socials;
  const numOfIgFollowers = socials?.instagramFollowers ?? 0;
  const numOfXFollowers = socials?.twitterFollowers ?? 0;
  const numOfUTubeFollowers = socials?.youtubeSubscribers ?? 0;
  const totalNumOfFollowers =
    numOfIgFollowers + numOfXFollowers + numOfUTubeFollowers;

  // 1.2. trade volume data - total & weekly - XRD & USD
  const tradeVolume = kpiData?.tradeVolume;

  // total
  const tradeVolumeTotalXrd = tradeVolume?.total?.XRD ?? 0;
  const tradeVolumeTotalUsd = tradeVolume?.total?.USD ?? 0;

  // weekly
  const tradeVolumeWeeklyXrd = tradeVolume?.weekly?.XRD?.at(-1)?.value ?? 0;
  const tradeVolumeWeeklyUsd = tradeVolume?.weekly?.USD?.at(-1)?.value ?? 0;

  // 2. alphadex data
  // Number of pairs listed
  const numOfPairs = pairsList.length;

  // DEXTR/XRD pairInfo
  const dextrXrdPairInfo = pairsList.find((pair) => pair.name === "DEXTR/XRD");
  // Trade volume in the last 24 hours
  const dextrVol24h = dextrXrdPairInfo?.quantity24h ?? 0;
  const xrdVol24h = dextrXrdPairInfo?.value24h ?? 0;

  // Trade volume in the last 7d (available soon) or use GoogleSheet data ?

  // Average weekly trade volume since inception (in XRD and USD)

  const stats = [
    {
      id: 1,
      label: "Total Pairs",
      value: numOfPairs,
      prefix: "",
    },
    {
      id: 2,
      label: "Total Volume",
      value: tradeVolumeTotalXrd,
      prefix: "XRD",
    },
    {
      id: 3,
      label: "Total Volume",
      value: tradeVolumeTotalUsd,
      prefix: "$",
    },
    {
      id: 4,
      label: "Weekly Volume",
      value: tradeVolumeWeeklyXrd,
      prefix: "XRD",
    },
    {
      id: 5,
      label: "Weekly Volume",
      value: tradeVolumeWeeklyUsd,
      prefix: "$",
    },
    {
      id: 6,
      label: "24h Volume",
      value: xrdVol24h,
      prefix: "XRD",
    },
    {
      id: 7,
      label: "24h Volume",
      value: dextrVol24h,
      prefix: "DEXTR",
    },
  ];

  return (
    <div className="flex flex-col gap-y-16 mx-auto justify-center items-center my-8">
      {/* stats */}
      <div className="flex gap-x-16">
        <>
          {stats?.length > 0
            ? stats.map((stat) => {
                return stat?.value ? (
                  <div
                    key={stat.id}
                    className="flex flex-col items-center justify-center"
                  >
                    <span className="min-w-44 text-3xl font-bold text-dexter-gradient-green text-center">
                      <span className="mr-2">{stat.prefix}</span>
                      <span>{simpleFormatNumber(stat.value)}</span>
                    </span>

                    <span className="text-lg">{stat.label}</span>
                  </div>
                ) : null;
              })
            : null}
        </>
      </div>

      {/* users */}
      {totalNumOfFollowers ? (
        <div className="text-6xl flex flex-col justify-center items-center gap-y-2">
          <AnimatedCounter
            value={totalNumOfFollowers}
            formatNumberCallback={(num) => simpleFormatNumber(num, 2)}
            wrapperClassName="flex flex-col items-center gap-y-2"
            counterClassName="text-dexter-gradient-green font-bold"
          >
            <span className="uppercase font-bold">users trust us</span>
          </AnimatedCounter>
        </div>
      ) : null}
    </div>
  );
};

export default StatsWidget;
