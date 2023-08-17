import React, { useEffect, useRef } from "react";

import { useAppDispatch, useAppSelector } from "./hooks";
import { fetchQuote, orderInputSlice } from "./orderInputSlice";
import { OrderTab, OrderSide } from "./orderInputSlice";

function OrderTypeTabs() {
  const activeTab = useAppSelector((state) => state.orderInput.tab);
  const actions = orderInputSlice.actions;
  const dispatch = useAppDispatch();

  function tabClass(isActive: boolean) {
    return (
      "flex-1 tab tab-bordered no-underline" + (isActive ? " tab-active" : "")
    );
  }
  return (
    <div className="tabs flex flex-row my-2">
      <a
        className={tabClass(activeTab === OrderTab.MARKET)}
        onClick={() => dispatch(actions.setActiveTab(OrderTab.MARKET))}
      >
        Market
      </a>
      <a
        className={tabClass(activeTab === OrderTab.LIMIT)}
        onClick={() => dispatch(actions.setActiveTab(OrderTab.LIMIT))}
      >
        Limit
      </a>
    </div>
  );
}

function DirectionToggle() {
  const activeSide = useAppSelector((state) => state.orderInput.side);
  const dispatch = useAppDispatch();
  return (
    <div className="btn-group">
      <button
        className={"btn" + (activeSide === OrderSide.BUY ? " btn-active" : "")}
        onClick={() => dispatch(orderInputSlice.actions.setSide(OrderSide.BUY))}
      >
        {OrderSide.BUY}
      </button>
      <button
        className={"btn" + (activeSide === OrderSide.SELL ? " btn-active" : "")}
        onClick={() =>
          dispatch(orderInputSlice.actions.setSide(OrderSide.SELL))
        }
      >
        {OrderSide.SELL}
      </button>
    </div>
  );
}

function AssetToggle() {
  const pairToken1 = useAppSelector((state) => state.pairSelector.token1);
  const pairToken2 = useAppSelector((state) => state.pairSelector.token2);

  const tokenTo = useAppSelector((state) => state.orderInput.tokenTo);

  const dispatch = useAppDispatch();

  return (
    <div className="btn-group">
      <button
        className={
          "btn" + (tokenTo.address === pairToken1.address ? " btn-active" : "")
        }
        onClick={() => {
          dispatch(orderInputSlice.actions.setTokenFrom(pairToken2));
          dispatch(orderInputSlice.actions.setTokenTo(pairToken1));
        }}
      >
        {pairToken1.symbol}
      </button>
      <button
        className={
          "btn" + (tokenTo.address === pairToken2.address ? " btn-active" : "")
        }
        onClick={() => {
          dispatch(orderInputSlice.actions.setTokenFrom(pairToken1));
          dispatch(orderInputSlice.actions.setTokenTo(pairToken2));
        }}
      >
        {pairToken2.symbol}
      </button>
    </div>
  );
}

function PositionSizeInput() {
  const defaultValue = useAppSelector((state) => state.orderInput.size);
  const symbol = useAppSelector((state) => state.orderInput.tokenTo.symbol);
  const iconUrl = useAppSelector((state) => state.orderInput.tokenTo.iconUrl);
  const dispatch = useAppDispatch();
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">Position Size</span>
      </label>
      <div className="relative">
        <input
          type="number"
          className="input input-bordered w-full"
          defaultValue={defaultValue}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const size = Number(event.target.value);
            dispatch(orderInputSlice.actions.setSize(size));
          }}
        ></input>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          <img src={iconUrl} className="w-6 h-6 my-auto mx-1" />
          <span>{symbol}</span>
        </div>
      </div>
    </div>
  );
}

function MarketOrderInput() {
  const defaultValue = useAppSelector((state) => state.orderInput.slippage);
  const dispatch = useAppDispatch();
  return (
    <>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Slippage</span>
        </label>
        <div className="relative">
          <input
            type="number"
            className="input input-bordered w-full"
            defaultValue={defaultValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const slippage = Number(event.target.value);
              dispatch(orderInputSlice.actions.setSlippage(slippage));
            }}
          ></input>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <span>%</span>
          </div>
        </div>
      </div>

      <PositionSizeInput />
    </>
  );
}

function LimitOrderInput() {
  const defaultValue = useAppSelector((state) => state.orderInput.price);
  const priceToken = useAppSelector((state) => state.orderInput.tokenFrom);
  const dispatch = useAppDispatch();
  return (
    <>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Price</span>
        </label>
        <div className="relative">
          <input
            type="number"
            className="input input-bordered w-full"
            defaultValue={defaultValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const price = Number(event.target.value);
              dispatch(orderInputSlice.actions.setPrice(price));
            }}
          ></input>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <img src={priceToken.iconUrl} className="w-6 h-6 my-auto mx-1" />
            <span>{priceToken.symbol}</span>
          </div>
        </div>
      </div>
      <PositionSizeInput />

      <div className="flex justify-start">
        <input
          type="checkbox"
          className="checkbox my-auto mr-2"
          onClick={() =>
            dispatch(orderInputSlice.actions.togglePreventImmediateExecution())
          }
        />
        <span className="my-auto">Prevent immediate execution </span>
      </div>
    </>
  );
}

function Description() {
  const description = useAppSelector((state) => state.orderInput.description);
  const quote = useAppSelector((state) => state.orderInput.quote);
  return (
    <div className="text-xs my-2">
      <div className="flex">
        <label>AlphaDEX response: </label>
        <span className="ml-1">{quote?.message}</span>
      </div>
      <p className="">{description}</p>
      <div className="flex">
        <label>Dex fees: </label>
        <span className="ml-1">{quote?.platformFeesXrd || 0} XRD</span>
      </div>
      <div className="flex">
        <label>Total fees: </label>
        <span className="ml-1">{quote?.totalFeesXrd || 0} XRD</span>
      </div>
    </div>
  );
}

function SubmitButton() {
  const tokenTo = useAppSelector((state) => state.orderInput.tokenTo.symbol);
  const tab = useAppSelector((state) => state.orderInput.tab);
  const side = useAppSelector((state) => state.orderInput.side);
  const dispatch = useAppDispatch();
  return (
    <div className="flex">
      <button className="flex-1 btn btn-primary">
        {tab === OrderTab.LIMIT ? "LIMIT " : ""}
        {side === OrderSide.BUY ? "Buy" : "Sell"} {tokenTo}
      </button>
    </div>
  );
}

export function OrderInput() {
  // updates quote when any of the listed dependencies changes
  const dispatch = useAppDispatch();
  const side = useAppSelector((state) => state.orderInput.side);
  const size = useAppSelector((state) => state.orderInput.size);
  const price = useAppSelector((state) => state.orderInput.price);
  const preventImmediateExecution = useAppSelector(
    (state) => state.orderInput.preventImmediateExecution
  );
  const slippage = useAppSelector((state) => state.orderInput.slippage);
  const tab = useAppSelector((state) => state.orderInput.tab);
  const tokenFrom = useAppSelector((state) => state.orderInput.tokenTo);
  const tokenTo = useAppSelector((state) => state.orderInput.tokenTo);
  useEffect(() => {
    dispatch(fetchQuote());
  }, [
    side,
    size,
    price,
    slippage,
    tab,
    tokenFrom,
    tokenTo,
    preventImmediateExecution,
    dispatch,
  ]);

  return (
    <div className="max-w-sm my-8 flex flex-col">
      <OrderTypeTabs />

      <div className="flex flex-row justify-between my-2">
        <DirectionToggle />
        <AssetToggle />
      </div>

      {useAppSelector((state) => state.orderInput.tab) === OrderTab.MARKET ? (
        <MarketOrderInput />
      ) : (
        <LimitOrderInput />
      )}

      <Description />

      <SubmitButton />
    </div>
  );
}
