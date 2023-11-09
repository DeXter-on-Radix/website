"use client";

import { useEffect } from "react";

import { DisplayMarketTable } from "components/markets/MarketsTable";
import { MarketsInfo } from "components/markets/MarketsInfo";

import { initializeSubscriptions, unsubscribeAll } from "../subscriptions";

import { store } from "../redux/store";

export default function Markets() {
  useEffect(() => {
    initializeSubscriptions(store);
    return () => {
      unsubscribeAll();
    };
  }, []);

  return (
    <div className="col-span-full p-4 mx-10">
      <div className="flex justify-between items-center uppercase">
        <div className="flex-none">
          <MarketsInfo />
        </div>
        <div className="flex-last">
          <button className="btn btn-lg uppercase bg-neutral text-accent border-x-4 border-y-0 border-accent">
            Trade Now
          </button>
        </div>
      </div>
      <div className="col-span-full uppercase">
        <DisplayMarketTable />
      </div>
    </div>
  );
}
