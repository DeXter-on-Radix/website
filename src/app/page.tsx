"use client";

import { OrderBook } from "components/OrderBook";
import { OrderInput } from "components/OrderInput";
import { PairSelector } from "components/PairSelector";
import { PriceChart } from "components/PriceChart";

export default function Home() {
  return (
    <>
      <div className="col-span-12 xl:col-span-3 text-center lg:border-r-4 border-base-300">
        <PairSelector />
      </div>
      <div className="min-h-[50px] col-span-12 xl:col-span-6 text-center">
        Price Info
      </div>
      <div className="col-span-12 xl:col-span-3 hidden xl:block  row-span-2 text-center border-l-4 border-base-300">
        <OrderBook />
      </div>
      <div className="grid grid-cols-12 xl:grid-cols-9 col-span-12 xl:col-span-9">
        <div className="col-span-12 lg:col-span-5 xl:col-span-3 order-2 lg:order-1 text-center lg:border-r-4 border-base-300">
          <OrderInput />
        </div>
        <div className="col-span-12 min-h-[200px] lg:col-span-7 xl:col-span-6 order-1 lg:order-2 text-center xs:border-b-4 lg:border-b-0 border-base-300">
          <PriceChart />
        </div>
      </div>
      <div className="col-span-5 hidden lg:block xl:hidden text-center border-r-4 border-base-300">
        <OrderBook />
      </div>
      <div className="min-h-[200px] col-span-12 lg:col-span-7 xl:col-span-12 text-center">
        Orders History
      </div>
    </>
  );
}
