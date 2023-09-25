import React from "react";
import { useAppSelector } from "../hooks";
import { displayAmount } from "../utils";

export function PriceInfo() {
  const priceInfo = useAppSelector((state) => state.priceInfo);
  const noDigits = 4;
  const decimalSeparator = ".";
  const thousandSeparator = ",";
  const fixedDecimals = 3;
  const lastPrice = displayAmount(
    priceInfo.lastPrice,
    noDigits,
    decimalSeparator,
    thousandSeparator,
    fixedDecimals
  );
  const change = displayAmount(
    priceInfo.change24h,
    noDigits,
    decimalSeparator,
    thousandSeparator,
    fixedDecimals
  );
  const high = displayAmount(
    priceInfo.high24h,
    noDigits,
    decimalSeparator,
    thousandSeparator,
    fixedDecimals
  );
  const low = displayAmount(
    priceInfo.low24h,
    noDigits,
    decimalSeparator,
    thousandSeparator,
    fixedDecimals
  );
  const volume = displayAmount(
    priceInfo.value24h,
    noDigits,
    decimalSeparator,
    thousandSeparator,
    fixedDecimals
  );
  const isNegativeOrZero = priceInfo.isNegativeOrZero;
  const basePair = "XRD";

  return (
    <div className="flex justify-between py-2">
      <div className="flex flex-col items-start pl-8">
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
      <div className="flex flex-col items-start">
        <span className="text-xs font-bold text-secondary-content uppercase pb-1">
          24h Change
        </span>
        <span
          className={
            isNegativeOrZero
              ? "text-sm font-bold text-success"
              : "text-sm font-bold text-error"
          }
        >
          {isNegativeOrZero ? change : "+" + change}
          <span className="text-sm font-bold text-secondary-content"> %</span>
        </span>
      </div>
      <div className="flex flex-col items-start">
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
      <div className="flex flex-col items-start">
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
      <div className="flex flex-col items-start pr-8">
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
