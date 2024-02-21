import React from "react";
import { useAppSelector } from "../../hooks";
import { displayNumber } from "../../utils";

export function MarketsInfo() {
  const marketInfo = useAppSelector((state) => console.log("test"));

  const marketPairs = 0;
  const xrdVolume = 0;
  const volumeChange = 0;

  return (
    <div className="flex flex-grow flex-row items-start gap-x-8 flex-wrap">
      <div className="flex gap-x-4">
        <span className="text-accent">{marketPairs}</span>
        <span className="text-secondary-content">Market Pairs</span>
      </div>
      <div className="flex gap-x-4">
        <span className="text-accent">{xrdVolume}</span>
        <span className="text-secondary-content">XRD Volume</span>
      </div>
      <div className="flex gap-x-4">
        <span className="text-accent">{volumeChange}</span>
        <span className="text-secondary-content">24HR Volume</span>
      </div>
    </div>
  );
}
