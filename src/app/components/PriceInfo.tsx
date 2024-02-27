import React from "react";
import { useAppSelector } from "../hooks";
import { displayNumber } from "../utils";

export function PriceInfo() {
  const priceInfo = useAppSelector((state) => state.priceInfo);
  const noDigits = 4;
  const fixedDecimals = 3;
  const lastPrice = displayNumber(priceInfo.lastPrice, noDigits, fixedDecimals);
  const change = displayNumber(priceInfo.change24h, noDigits, fixedDecimals);
  const high = displayNumber(priceInfo.high24h, noDigits, fixedDecimals);
  const low = displayNumber(priceInfo.low24h, noDigits, fixedDecimals);
  const volume = displayNumber(priceInfo.value24h, noDigits, fixedDecimals);
  const isNegativeOrZero = priceInfo.isNegativeOrZero;
  const basePair = "XRD";

  return (
    <div className="flex justify-between py-2 h-full max-w-[650px] lg:max-w-none ">
      <div className="flex flex-col items-start justify-center pl-5 lg:pl-8">
        <span className="text-sm font-bold text-secondary-content uppercase">
          Price
        </span>
        <span className={"text-sm font-bold"}>
          {lastPrice}
          <span className="text-sm font-bold text-secondary-content">
            {" "}
            {basePair}
          </span>
        </span>
      </div>
      <div className="flex flex-col items-start justify-center">
        <span className="text-xs font-bold text-secondary-content uppercase pb-1">
          24h Change
        </span>
        <span
          className={
            isNegativeOrZero
              ? "text-sm font-bold text-error"
              : "text-sm font-bold text-success"
          }
        >
          {isNegativeOrZero ? change : "+" + change}
          <span className="text-sm font-bold text-secondary-content"> %</span>
        </span>
      </div>
      <div className="flex flex-col items-start justify-center">
        <span className="text-xs font-bold text-secondary-content uppercase pb-1">
          24h Volume
        </span>
        <span className="text-sm font-bold primary-content">
          {volume}
          <span className="text-sm font-bold text-secondary-content">
            {" "}
            {basePair}
          </span>
        </span>
      </div>
      <div className="flex flex-col items-start justify-center">
        <span className="text-xs font-bold text-secondary-content uppercase pb-1">
          24h High
        </span>
        <span className="text-sm font-bold primary-content">
          {high}
          <span className="text-sm font-bold text-secondary-content">
            {" "}
            {basePair}
          </span>
        </span>
      </div>
      <div className="flex flex-col items-start justify-center pr-5 lg:pr-8">
        <span className="text-xs font-bold text-secondary-content uppercase pb-1">
          24h Low
        </span>
        <span className="text-sm font-bold primary-content">
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
