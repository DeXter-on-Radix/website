import { useContext, useEffect, useState, useCallback } from "react";

import type { RootState } from "./store";
import { useSelector, useDispatch } from "react-redux";
import { orderInputSlice } from "./orderInputSlice";
import * as adex from "alphadex-sdk-js";
import Image from "next/image";
import { OrderType } from "./orderInputSlice";

export function OrderInput() {
  const state = useSelector((state: RootState) => state.orderInput);
  const actions = orderInputSlice.actions;
  const dispatch = useDispatch();

  function tabClass(isActive: boolean) {
    return (
      "flex-1 tab tab-bordered no-underline" + (isActive ? " tab-active" : "")
    );
  }

  return (
    <div className="max-w-sm my-8 flex flex-col">
      <div className="tabs flex flex-row">
        <a
          className={tabClass(state.type === OrderType.MARKET)}
          onClick={() => dispatch(actions.setOrderType(OrderType.MARKET))}
        >
          Market
        </a>
        <a
          className={tabClass(state.type === OrderType.LIMIT)}
          onClick={() => dispatch(actions.setOrderType(OrderType.LIMIT))}
        >
          Limit
        </a>
      </div>

      <div className="flex flex-row">
        <input
          type="number"
          className="input input-bordered w-full mt-2"
        ></input>
        <div className="w-24 text-end my-auto">{state.tokenFrom.symbol}</div>
      </div>

      <Image
        src="/arrow_down.svg"
        width="24"
        height="24"
        alt={`From ${state.tokenFrom.symbol} to ${state.tokenTo.symbol}`}
        className="mx-auto my-2"
      />
      <div className="flex flex-row">
        <input
          type="number"
          className="input input-bordered w-full mb-2"
          disabled
        ></input>
        <div className="w-24 text-end my-auto">{state.tokenTo.symbol}</div>
      </div>
    </div>
  );
}
