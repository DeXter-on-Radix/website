"use client";

import { useAppSelector, useTranslations } from "hooks";
import { fetchKpiData, KpiData } from "kpis/kpis-utils";
import { useEffect, useState } from "react";
import { simpleFormatNumber } from "utils/simpleFormatNumber";
import AnimatedCounter from "./AnimatedCounter";
import Link from "next/link";
import HoverGradientButton from "./HoverGradientButton";

const StatsWidget = () => {
  const t = useTranslations();
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

  // TODO: compute actual users with a script fetching all orders on adex.
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
  const tradeVolumeTotalUsd = tradeVolume?.total?.USD ?? 0;

  // weekly
  const tradeVolumeWeeklyUsd = tradeVolume?.weekly?.USD?.at(-1)?.value ?? 0;

  // 2. alphadex data
  // Number of pairs listed
  const numOfPairs = pairsList.length;

  return (
    <div className="flex w-full opacity-80 flex-col gap-y-8 mx-auto justify-center items-center mt-8 mb-32">
      {/* users */}
      {totalNumOfFollowers ? (
        <>
          <AnimatedCounter
            end={totalNumOfFollowers}
            decimals={0}
            label={<span className="uppercase">{t("users_trust_us")}</span>}
            wrapperClassName="w-full flex justify-center max-md:flex-col max-md:text-3xl md:text-4xl items-center gap-2 max-md:gap-4"
            counterClassName="text-dexter-green-OG font-bold min-w-44 max-md:text-center md:text-right"
            labelClassName="ml-2"
          />
        </>
      ) : null}

      {/* trade */}
      <div className="grid max-lg:px-8 max-lg:grid-cols-1 lg:grid-cols-3 max-lg:w-full justify-center gap-8">
        {numOfPairs ? (
          <StatCard label={t("pairs")} value={<>{numOfPairs}</>} />
        ) : null}

        {tradeVolumeWeeklyUsd ? (
          <StatCard
            label={t("weekly_trading_volume")}
            value={
              <span className="flex gap-x-2">
                ${simpleFormatNumber(tradeVolumeWeeklyUsd)}
              </span>
            }
          />
        ) : null}

        {tradeVolumeTotalUsd ? (
          <StatCard
            label={t("total_trading_volume")}
            value={
              <span className="flex gap-x-2">
                ${simpleFormatNumber(tradeVolumeTotalUsd)}
              </span>
            }
          />
        ) : null}
      </div>

      {/* show more */}
      <Link href="/kpis">
        <HoverGradientButton label={t("explore_more_metrics")} />
      </Link>
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
    <div className="lg:w-80 font-bold flex flex-col items-center justify-center gap-y-2 h-32 rounded-lg border border-secondary-content border-opacity-50">
      <span className="text-2xl text-dexter-green-OG text-center">{value}</span>

      <span className="text-lg">{label}</span>
    </div>
  );
};
