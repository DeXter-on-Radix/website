import React from "react";
import { useAppSelector } from "../hooks";

export function PriceInfo() {
  const priceInfo = useAppSelector((state) => state.priceInfo);
  const lastPrice = priceInfo.lastPrice;
  const change = priceInfo.change24h;
  const high = priceInfo.high24h;
  const low = priceInfo.low24h;
  const volume = priceInfo.value24h;
  //   const open = priceInfo.open24h;

  return (
    <div className="flex justify-between py-2">
      {" "}
      <div className="flex flex-col items-start pl-8">
        {" "}
        <span className="text-sm">Price</span>
        <span className="text-xs">{lastPrice}</span>{" "}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm">24h Change</span>
        <span className="text-xs">{change}</span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm">24h High</span>
        <span className="text-xs">{high}</span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm">24h Low</span>
        <span className="text-xs">{low}</span>
      </div>
      <div className="flex flex-col items-start pr-8">
        {" "}
        <span className="text-sm">24h Volume</span>
        <span className="text-xs">{volume}</span>
      </div>
    </div>
  );
}
