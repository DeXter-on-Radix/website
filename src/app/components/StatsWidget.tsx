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

  return (
    <div className="flex opacity-80 flex-col gap-y-8 mx-auto justify-center items-center my-8">
      {/* users */}
      {totalNumOfFollowers ? (
        <>
          <AnimatedCounter
            value={totalNumOfFollowers}
            formatNumberCallback={(num) => simpleFormatNumber(num, 2)}
            wrapperClassName="flex max-md:flex-col max-md:text-3xl md:text-4xl items-center gap-2 max-md:gap-4"
            counterClassName="text-dexter-gradient-green font-bold w-44 max-md:text-center md:text-right"
          >
            <span className="uppercase">users trust us</span>
          </AnimatedCounter>
        </>
      ) : null}

      {/* trade */}
      <div className="flex flex-wrap justify-center gap-4">
        {numOfPairs ? (
          <StatCard label="Pairs" value={<>{numOfPairs}</>} />
        ) : null}

        {tradeVolumeWeeklyXrd && tradeVolumeWeeklyUsd ? (
          <StatCard
            label="Weekly Trading Volume"
            value={
              <span className="flex gap-x-2">
                <span>{simpleFormatNumber(tradeVolumeWeeklyXrd)} XRD</span>
                <span className="text-secondary-content">/</span>
                <span>${simpleFormatNumber(tradeVolumeWeeklyUsd)}</span>
              </span>
            }
          />
        ) : null}

        {tradeVolumeTotalXrd && tradeVolumeTotalUsd ? (
          <StatCard
            label="Total Trading Volume"
            value={
              <span className="flex gap-x-2">
                <span>{simpleFormatNumber(tradeVolumeTotalXrd)} XRD</span>
                <span className="text-secondary-content">/</span>
                <span>${simpleFormatNumber(tradeVolumeTotalUsd)}</span>
              </span>
            }
          />
        ) : null}
      </div>
    </div>
  );
};

export default StatsWidget;

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => {
  return (
    <div className="font-bold flex flex-col items-center justify-center gap-y-2 w-80 h-32 rounded-lg border border-secondary-content border-opacity-50">
      <span className="text-2xl text-dexter-gradient-green text-center">
        {value}
      </span>

      <span className="text-lg">{label}</span>
    </div>
  );
};
