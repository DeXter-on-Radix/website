import { useContext, useEffect, useState, useCallback } from "react";

import { useAppDispatch, useAppSelector } from "./hooks";
import { OrderInputState, orderInputSlice } from "./orderInputSlice";
import Image from "next/image";
import { OrderTab } from "./orderInputSlice";

export function OrderInput() {
  const state: OrderInputState = useAppSelector((state) => state.orderInput);
  const actions = orderInputSlice.actions;
  const dispatch = useAppDispatch();

  function tabClass(isActive: boolean) {
    return (
      "flex-1 tab tab-bordered no-underline" + (isActive ? " tab-active" : "")
    );
  }

  return (
    <div className="max-w-sm my-8 flex flex-col">
      <div className="tabs flex flex-row">
        <a
          className={tabClass(state.tab === OrderTab.MARKET)}
          onClick={() => dispatch(actions.setOrderType(OrderTab.MARKET))}
        >
          Market
        </a>
        <a
          className={tabClass(state.tab === OrderTab.LIMIT)}
          onClick={() => dispatch(actions.setOrderType(OrderTab.LIMIT))}
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
        className="mx-auto my-0"
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
