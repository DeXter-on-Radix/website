import React from "react";

export function MarketsInfo() {
  const marketPairs = 0;
  const xrdVolume = 0;
  const volumeChange = 0;

  return (
    <div className="flex justify-between items-start">
      <div className="flex-none mx-9">
        <span className="text-accent">{marketPairs}</span> Market Pairs
      </div>
      <div className="flex-none mx-9">
        <span className="text-accent">{xrdVolume}</span> XRD Volume
      </div>
      <div className="flex-none mx-9">
        <span className="text-accent">{volumeChange}</span> 24HR Volume
      </div>
    </div>
  );
}
