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
import {
  PromoBannerCarousel,
  PromoBannerProps,
} from "../components/PromoBannerCarousel";

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
    <div className="">
      <PromoBannerCarousel items={[promoBannerConfig]} />
      <div className="max-w-[1521px] m-auto border-x border-[#d0d0d01a]">
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
          <div className="priceChart px-4 pt-2">
            <PriceChart />
          </div>
          <div className="tradeHistory max-w-[100%] w-full overflow-x-auto scrollbar-thin">
            <AccountHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
