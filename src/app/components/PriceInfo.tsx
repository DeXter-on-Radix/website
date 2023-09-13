import React from "react";
import { useAppSelector } from "../hooks";

export function PriceInfo() {
  const priceInfo = useAppSelector((state) => state.priceInfo);
  const lastPrice = priceInfo.lastPrice;
  const change = priceInfo.change24h;
  const high = priceInfo.high24h;
  const low = priceInfo.low24h;
  const volume = priceInfo.value24h;
  const isNegativeOrZero = priceInfo.isNegativeOrZero;
  //   const open = priceInfo.open24h;

  return (
    <div className="flex justify-between py-2">
      <div className="flex flex-col items-start pl-8">
        <span className="text-sm">Price</span>
        <span
          className={
            isNegativeOrZero ? "text-xs text-red-500" : "text-xs text-green-500"
          }
        >
          {lastPrice}
        </span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm">24h Change</span>
        <span
          className={
            isNegativeOrZero ? "text-xs text-red-500" : "text-xs text-green-500"
          }
        >
          {change}
        </span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm">24h High</span>
        <span
          className={
            isNegativeOrZero ? "text-xs text-red-500" : "text-xs text-green-500"
          }
        >
          {high}
        </span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm">24h Low</span>
        <span
          className={
            isNegativeOrZero ? "text-xs text-red-500" : "text-xs text-green-500"
          }
        >
          {low}
        </span>
      </div>
      <div className="flex flex-col items-start pr-8">
        <span className="text-sm">24h Volume</span>
        <span
          className={
            isNegativeOrZero ? "text-xs text-red-500" : "text-xs text-green-500"
          }
        >
          {volume}
        </span>
      </div>
    </div>
  );
}
