"use client";

import { useEffect } from "react";

import { OrderBook } from "components/OrderBook";
import { OrderInput } from "components/order_input/OrderInput";
import { PairSelector } from "components/PairSelector";
import { PriceChart } from "components/PriceChart";
import { AccountHistory } from "components/AccountHistory";
import { PriceInfo } from "components/PriceInfo";
import { fetchBalances } from "state/pairSelectorSlice";
import { useAppDispatch } from "hooks";
import { fetchAccountHistory } from "state/accountHistorySlice";
import { initializeSubscriptions, unsubscribeAll } from "./subscriptions";
import { store } from "./state/store";

// import { detectBrowserLanguage } from "./utils";
import { i18nSlice } from "./state/i18nSlice";

export default function Home() {
  const dispatch = useAppDispatch();

  // Detect browser langauge
  useEffect(() => {
    // dispatch(i18nSlice.actions.changeLanguage(detectBrowserLanguage()));
    dispatch(i18nSlice.actions.changeLanguage("pt"));
  }, [dispatch]);

  useEffect(() => {
    initializeSubscriptions(store);
    return () => {
      unsubscribeAll();
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(fetchBalances());
      dispatch(fetchAccountHistory());
    }, 5000); // Dispatch every 5000 milliseconds (5 second)

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [dispatch]);

  return (
    <div className="flex-grow grid grid-cols-12 custom-auto-row-grids max-w-none divide-y-4 divide-base-300">
      <div className="col-span-12 lg:col-span-5 xl:col-span-3 text-center lg:border-r-4 border-t-4 border-base-300">
        <PairSelector />
      </div>
      <div className="min-h-[50px] col-span-12 lg:col-span-7 xl:col-span-6 text-center">
        <PriceInfo />
      </div>
      <div className="col-span-12 xl:col-span-3 hidden xl:block  row-span-2 text-center border-l-4 border-base-300">
        <OrderBook />
      </div>
      <div className="grid grid-cols-12 xl:grid-cols-9 col-span-12 xl:col-span-9">
        <div className="col-span-12 lg:col-span-5 xl:col-span-3 order-2 lg:order-1 text-center lg:border-r-4 border-base-300">
          <OrderInput />
        </div>
        <div className="col-span-12 p-2 lg:col-span-7 xl:col-span-6 order-1 lg:order-2 text-center xs:border-b-4 lg:border-b-0 border-base-300">
          <PriceChart />
        </div>
      </div>
      <div className="col-span-12 xl:hidden lg:col-span-5 lg:border-r-4 border-base-300">
        <OrderBook />
      </div>
      <div className="col-span-12 lg:col-span-7 xl:col-span-12 text-center">
        <AccountHistory />
      </div>
    </div>
  );
}
