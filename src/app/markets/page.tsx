"use client";

import { useState, useEffect } from "react";
import { useAppDispatch } from "../hooks";

import { DisplayMarketTable } from "components/MarketsTable";

import { initializeSubscriptions, unsubscribeAll } from "../subscriptions";

import { store } from "../redux/store";
import { fetchMarketData } from "redux/marketSlice";

export default function Markets() {
  const dispatch = useAppDispatch();
  const marketPairs = useState(0);
  const xrdVolume = useState(0);
  const volumeChange = useState(0);
  useEffect(() => {
    //initializeSubscriptions(store);
    dispatch(fetchMarketData());
    return () => {
      unsubscribeAll();
    };
  }, [dispatch]);

  return (
    <div className="col-span-full p-4">
      <div className="flex justify-between uppercase">
        <div className="flex-none">
          <span className="text-accent">{marketPairs}</span> Market Pairs
          <span className="text-accent">{xrdVolume}</span> XRD Volume
          <span className="text-accent">{volumeChange}</span> 24HR Volume
        </div>
        <div className="flex-last">
          <button className="btn uppercase">Trade Now</button>
        </div>
      </div>
      <div className="col-span-full uppercase">
        <DisplayMarketTable />
      </div>
    </div>
  );
}
