"use client";

import { SetStateAction, useEffect, useState } from "react";

import { OrderBook } from "components/OrderBook";
import { OrderInput } from "components/order_input/OrderInput";
import { PairSelector } from "components/PairSelector";
// import { PriceChart } from "components/PriceChart";
import { AccountHistory } from "components/AccountHistory";
import { PriceInfo } from "components/PriceInfo";
import { fetchBalances } from "state/pairSelectorSlice";
import { useAppDispatch, useAppSelector } from "hooks";
import { fetchAccountHistory } from "state/accountHistorySlice";
import { initializeSubscriptions, unsubscribeAll } from "./subscriptions";
import { store } from "./state/store";

import { detectBrowserLanguage } from "./utils";
import { i18nSlice } from "./state/i18nSlice";

import Cookies from "js-cookie";

import { toast } from "react-hot-toast";

export default function Home() {
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
          <ToasterTest />
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

function ToasterTest() {
  const [background, setBackground] = useState("#1a1c1e");
  const [color, setColor] = useState("#FFFAEE");
  const [border, setBorder] = useState("1px solid rgba(255,255,255,0.1)");
  const [padding, setPadding] = useState("8px");
  const [iconPrimary, setIconPrimary] = useState("#cafc40");
  const [iconSecondary, setIconSecondary] = useState("#1a1c1e");

  const launchNotification = () => {
    toast.success("Success Notification", {
      style: {
        border: border,
        padding: padding,
        color: color,
        background: background,
      },
      iconTheme: {
        primary: iconPrimary,
        secondary: iconSecondary,
      },
    });
  };

  const handleChangeColor =
    (setter: {
      (value: SetStateAction<string>): void;
      (value: SetStateAction<string>): void;
      (arg0: any): void;
    }) =>
    (e: { target: { value: any } }) => {
      setter(e.target.value);
    };

  return (
    <>
      <h1 className="mb-4">Toaster Playground</h1>
      {[
        { label: "Background Color", value: background, setter: setBackground },
        { label: "Text Color", value: color, setter: setColor },
        {
          label: "Icon Primary Color",
          value: iconPrimary,
          setter: setIconPrimary,
        },
        {
          label: "Icon Secondary Color",
          value: iconSecondary,
          setter: setIconSecondary,
        },
      ].map((item, index) => (
        <div key={index} className="flex items-center mb-2 space-x-2">
          <label className="min-w-max">{item.label}:</label>
          <input
            type="color"
            value={item.value}
            onChange={handleChangeColor(item.setter)}
            className="w-16 h-10 p-0 border-0"
          />
          <input
            type="text"
            value={item.value}
            onChange={handleChangeColor(item.setter)}
            placeholder="Hex code"
            className="flex-1 border-gray-300 rounded-md shadow-sm"
          />
        </div>
      ))}
      <div className="flex items-center mb-2 space-x-2">
        <label className="min-w-max">Border:</label>
        <input
          type="text"
          value={border}
          onChange={(e) => setBorder(e.target.value)}
          placeholder="e.g., 1px solid #000000"
          className="flex-1 border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div className="flex items-center mb-2 space-x-2">
        <label className="min-w-max">Padding:</label>
        <input
          type="text"
          value={padding}
          onChange={(e) => setPadding(e.target.value)}
          placeholder="e.g., 20px"
          className="flex-1 border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <button
        onClick={launchNotification}
        style={{
          marginTop: "10px",
          backgroundColor: "#cafc40",
          color: "black",
          padding: "10px 20px",
          fontWeight: "bold",
        }}
      >
        LAUNCH TOAST
      </button>
    </>
  );
}
