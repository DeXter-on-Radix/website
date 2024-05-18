"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { OrderBook } from "../components/OrderBook";
import { OrderInput } from "../components/OrderInput";
import { PairSelector } from "../components/PairSelector";
import { PriceChart } from "../components/PriceChart";
import { AccountHistory } from "../components/AccountHistory";
import { PriceInfo } from "../components/PriceInfo";
import { fetchBalances, selectPair } from "state/pairSelectorSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchAccountHistory } from "../state/accountHistorySlice";

import { detectBrowserLanguage } from "../utils";
import { i18nSlice } from "../state/i18nSlice";

import Cookies from "js-cookie";
import { PromoBanner, PromoBannerProps } from "../components/PromoBanner";

// Configuration for promo banner
// Once both images and a targetUrl are defined the banner will automatically show
const promoBannerConfig: PromoBannerProps = {
  imageUrl: "/promo-banners/validator-node-staking/desktop-600x80.svg",
  imageUrlMobile: "/promo-banners/validator-node-staking/mobile-600x200.svg",
  redirectUrl:
    "https://dashboard.radixdlt.com/network-staking/validator_rdx1s0sr7xsr286jwffkkcwz8ffnkjlhc7h594xk5gvamtr8xqxr23a99a",
};

export default function Trade() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const pairSelector = useAppSelector((state) => state.pairSelector);
  const pairName = pairSelector.name;
  const pairsList = pairSelector.pairsList;

  // Detect changes in selected pair and adjust pagetitle
  useEffect(() => {
    document.title = pairName ? `DeXter • ${pairName.toUpperCase()}` : "DeXter";
  }, [pairName]);

  // Set pair that was specified in query param
  useEffect(() => {
    if (pairsList.length > 0) {
      const pairToInit = searchParams.get("pair")?.split("-").join("/");
      const pair = pairsList.find(
        (pair) => pair.name.toUpperCase() === pairToInit?.toUpperCase()
      );
      if (pair) {
        dispatch(
          selectPair({ pairAddress: pair.address, pairName: pair.name })
        );
      }
    }
  }, [pairsList, dispatch, searchParams]);

  // Detect browser langauge
  useEffect(() => {
    const userLanguageCookieValue = Cookies.get("userLanguage");
    if (userLanguageCookieValue) {
      dispatch(i18nSlice.actions.changeLanguage(userLanguageCookieValue));
    } else {
      dispatch(i18nSlice.actions.changeLanguage(detectBrowserLanguage()));
    }
  }, [dispatch]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(fetchBalances());
      dispatch(fetchAccountHistory());
    }, 5000); // Dispatch every 5000 milliseconds (5 second)

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [dispatch]);

  return (
    <>
      <PromoBanner {...promoBannerConfig} />
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
    </>
  );
}
