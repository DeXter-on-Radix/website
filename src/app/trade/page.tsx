"use client";

import { useEffect } from "react";

import { OrderBook } from "../components/OrderBook";
import { OrderInput } from "../components/OrderInput";
import { PairSelector } from "../components/PairSelector";
import { PriceChart } from "../components/PriceChart";
import { AccountHistory } from "../components/AccountHistory";
import { PriceInfo } from "../components/PriceInfo";
import { fetchBalances } from "state/pairSelectorSlice";
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
  const dispatch = useAppDispatch();
  const pairName = useAppSelector((state) => state.pairSelector.name);

  // Detect changes in selected pair and adjust pagetitle
  useEffect(() => {
    document.title = pairName ? `DeXter • ${pairName.toUpperCase()}` : "DeXter";
  }, [pairName]);

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
    <div className="">
      <PromoBanner {...promoBannerConfig} />
      {/* <div className="border-x-4 border-black"> */}
      <div className="min-[1721px]:max-w-[1521px] min-[1721px]:m-auto min-[1721px]:border-x min-[1721px]:border-[#d0d0d01a]">
        <div className="grid-container">
          <div className="pairSelector">
            <PairSelector />
          </div>
          <div className="priceInfo">
            <PriceInfo />
          </div>
          <div className="orderBook max-[850px]:p-5 max-[700px]:p-0 ">
            <OrderBook />
          </div>
          <div className="orderInput max-[850px]:p-5 max-[700px]:p-0 ">
            <OrderInput />
          </div>
          <div className="priceChart pl-4 pt-2">
            {/* <p className="p-5 text-secondary-content text-base">Price Chart</p> */}
            <PriceChart />
          </div>
          <div className="tradeHistory">
            <AccountHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
