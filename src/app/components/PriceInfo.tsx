import React from "react";
import { useAppSelector } from "../hooks";

export function PriceInfo() {
  const priceInfo = useAppSelector((state) => state.priceInfo);
  const lastPrice = priceInfo.lastPrice.toFixed(3);
  const change = priceInfo.change24h.toFixed(2);
  const high = priceInfo.high24h.toFixed(3);
  const low = priceInfo.low24h.toFixed(3);
  const volume = priceInfo.value24h.toFixed(3);
  const isNegativeOrZero = priceInfo.isNegativeOrZero;
  const basePair = "XRD";

  function formatNumber(lastPrice, basePair) {
    return (lastPrice > 0 ? "+" : "") + lastPrice + " " + basePair;
  }

  return (
    <div className="flex justify-between py-2">
      <div className="flex flex-col items-start pl-8">
        <span className="text-sm font-bold text-secondary-content uppercase">Price</span>
        <span
          className={
            isNegativeOrZero ? "text-sm font-bold text-red-500" : "text-xs text-green-500"
          }
        >
          {lastPrice}
          <span className="text-sm font-bold text-secondary-content"> {basePair}</span>
        </span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-xs font-bold text-secondary-content uppercase pb-1">24h Change</span>
        <span
          className={
            isNegativeOrZero ? "text-sm font-bold text-red-500" : "text-xs text-green-500"
          }
        >
          {isNegativeOrZero ? "-" + change : "+" + change} 
          <span className="text-sm font-bold text-secondary-content"> %</span>
        </span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-xs font-bold text-secondary-content uppercase pb-1">24h Volume</span>
        <span className="text-sm font-bold primary-content">
          {volume}
          <span className="text-sm font-bold text-secondary-content"> {basePair}</span>
        </span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-xs font-bold text-secondary-content uppercase pb-1">24h High</span>
        <span className="text-sm font-bold primary-content">
          {high}
          <span className="text-sm font-bold text-secondary-content"> {basePair}</span>
        </span>
      </div>
      <div className="flex flex-col items-start pr-8">
        <span className="text-xs font-bold text-secondary-content uppercase pb-1">24h Low</span>
        <span className="text-sm font-bold primary-content">
          {low}
          <span className="text-sm font-bold text-secondary-content"> {basePair}</span>
        </span>
      </div>
    </div>
  );
}
