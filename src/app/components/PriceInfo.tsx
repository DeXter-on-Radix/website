import React from "react";
import { useAppSelector, useTranslations } from "../hooks";
import { displayNumber } from "../utils";

export function PriceInfo() {
  const t = useTranslations();
  const priceInfo = useAppSelector((state) => state.priceInfo);
  const noDigits = 4;
  const fixedDecimals = 3;
  const lastPrice = displayNumber(priceInfo.lastPrice, noDigits, fixedDecimals);
  const change = displayNumber(priceInfo.change24h, noDigits, fixedDecimals);
  const high = displayNumber(priceInfo.high24h, noDigits, fixedDecimals);
  const low = displayNumber(priceInfo.low24h, noDigits, fixedDecimals);
  const volume = displayNumber(priceInfo.value24h, noDigits, fixedDecimals);
  const isNegativeOrZero = priceInfo.isNegativeOrZero;
  const pairSelector = useAppSelector((state) => state.pairSelector);
  const basePair = pairSelector.token2.symbol;

  return (
    <div className="flex flex-wrap justify-between items-center py-2 px-5 h-full max-w-[470px] min-[1026px]:m-auto max-[500px]:py-4 max-[500px]:justify-start">
      <PriceInfoItem
        title={t("price")}
        valueStr={lastPrice}
        label={basePair}
        color={Color.NEUTRAL}
      />
      <PriceInfoItem
        title={t("24h_change")}
        valueStr={isNegativeOrZero ? `${change} %` : `+${change} %`}
        label={""}
        color={isNegativeOrZero ? Color.RED : Color.GREEN}
      />
      <PriceInfoItem
        title={t("24h_volume")}
        valueStr={volume}
        label={basePair}
        color={Color.NEUTRAL}
      />
      <PriceInfoItem
        title={t("24h_high")}
        valueStr={high}
        label={basePair}
        color={Color.NEUTRAL}
      />
      <PriceInfoItem
        title={t("24h_low")}
        valueStr={low}
        label={basePair}
        color={Color.NEUTRAL}
      />
    </div>
  );
}

enum Color {
  NEUTRAL = "text-primary-content",
  RED = "text-dexter-red",
  GREEN = "text-dexter-green",
}

interface PriceInfoItemProps {
  title: string;
  valueStr: string;
  label: string;
  color: Color;
}

function PriceInfoItem({ title, valueStr, label, color }: PriceInfoItemProps) {
  return (
    <div className="flex flex-col items-start justify-start max-[500px]:pr-5">
      <div className="text-sm text-secondary-content pt-1">{title}</div>
      <div className="flex">
        <p className={`text-sm font-bold ${color} mr-1`}>{valueStr}</p>
        <p className="text-sm text-secondary-content"> {label}</p>
      </div>
    </div>
  );
}
