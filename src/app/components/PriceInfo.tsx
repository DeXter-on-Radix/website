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
    <div className="flex justify-between py-2 h-full max-w-[500px] min-[1026px]:m-auto">
      <div className="flex flex-col items-start justify-center pl-5 lg:pl-8">
        <span className="text-sm font-bold text-secondary-content uppercase">
          {t("price")}
        </span>
        <span className={"text-sm font-bold text-primary-content"}>
          {lastPrice}
          <span className="text-sm font-bold text-secondary-content">
            {" "}
            {basePair}
          </span>
        </span>
      </div>
      <div className="flex flex-col items-start justify-center">
        <span className="text-xs font-bold text-secondary-content uppercase pt-1">
          {t("24h_change")}
        </span>
        <span
          className={
            isNegativeOrZero
              ? "text-sm font-bold text-dexter-red"
              : "text-sm font-bold text-dexter-green"
          }
        >
          {isNegativeOrZero ? change : "+" + change}
          <span className="text-sm font-bold text-secondary-content"> %</span>
        </span>
      </div>
      <div className="flex flex-col items-start justify-center">
        <span className="text-xs font-bold text-secondary-content uppercase pt-1">
          {t("24h_volume")}
        </span>
        <span className="text-sm font-bold text-primary-content">
          {volume}
          <span className="text-sm font-bold text-secondary-content">
            {" "}
            {basePair}
          </span>
        </span>
      </div>
      <div className="flex flex-col items-start justify-center">
        <span className="text-xs font-bold text-secondary-content uppercase pt-1">
          {t("24h_high")}
        </span>
        <span className="text-sm font-bold text-primary-content">
          {high}
          <span className="text-sm font-bold text-secondary-content">
            {" "}
            {basePair}
          </span>
        </span>
      </div>
      <div className="flex flex-col items-start justify-center pr-5 lg:pr-8">
        <span className="text-xs font-bold text-secondary-content uppercase pt-1">
          {t("24h_low")}
        </span>
        <span className="text-sm font-bold text-primary-content">
          {low}
          <span className="text-sm font-bold text-secondary-content">
            {" "}
            {basePair}
          </span>
        </span>
      </div>
    </div>
  );
}
