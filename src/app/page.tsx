"use client";

import { useEffect, useState } from "react";

import { OrderBook } from "components/OrderBook";
import { OrderInput } from "components/order_input/OrderInput";
import { PairSelector } from "components/PairSelector";
import { PriceChart } from "components/PriceChart";
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
  const [background, setBackground] = useState("white");
  const [color, setColor] = useState("#713200");
  const [border, setBorder] = useState("1px solid #713200");
  const [padding, setPadding] = useState("16px");
  const [iconPrimary, setIconPrimary] = useState("#713200");
  const [iconSecondary, setIconSecondary] = useState("#FFFAEE");
  const [message, setMessage] = useState("Transaction Successful");

  const launchNotification = () => {
    toast.success(message, {
      style: {
        border: border,
        padding: padding,
        color: color,
        background: background, // Make sure you apply the background state
      },
      iconTheme: {
        primary: iconPrimary,
        secondary: iconSecondary,
      },
    });
  };

  // Inline styles for alignment and spacing
  const rowStyle = {
    display: "flex",
    flexDirection: "column",
    marginBottom: "10px", // Add spacing between rows
    alignItems: "flex-start", // Align items to the left
  };

  return (
    <>
      <h1>Toaster Playground</h1>
      <div style={rowStyle}>
        <label>
          Background Color:
          <input
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          />
        </label>
      </div>
      <div style={rowStyle}>
        <label>
          Text Color:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
      </div>
      <div style={rowStyle}>
        <label>
          Border:
          <input
            type="text"
            value={border}
            onChange={(e) => setBorder(e.target.value)}
            placeholder="e.g., 1px solid #000000"
          />
        </label>
      </div>
      <div style={rowStyle}>
        <label>
          Padding:
          <input
            type="text"
            value={padding}
            onChange={(e) => setPadding(e.target.value)}
            placeholder="e.g., 20px"
          />
        </label>
      </div>
      <div style={rowStyle}>
        <label>
          Icon Primary Color:
          <input
            type="color"
            value={iconPrimary}
            onChange={(e) => setIconPrimary(e.target.value)}
          />
        </label>
      </div>
      <div style={rowStyle}>
        <label>
          Icon Secondary Color:
          <input
            type="color"
            value={iconSecondary}
            onChange={(e) => setIconSecondary(e.target.value)}
          />
        </label>
      </div>
      <div style={rowStyle}>
        <label>
          Notification Message:
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., Transaction Success"
          />
        </label>
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
