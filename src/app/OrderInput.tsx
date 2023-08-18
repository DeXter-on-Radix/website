import React, { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "./hooks";
import {
  OrderTab,
  OrderSide,
  fetchQuote,
  orderInputSlice,
  getSelectedToken,
  getUnselectedToken,
  validateOrderInput,
  validatePositionSize,
  validatePriceInput,
  validateSlippageInput,
  submitOrder,
  setSizePercent,
} from "./orderInputSlice";
import { fetchBalances } from "./radixSlice";
import { displayNumber } from "./utils";

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

function AvailableBalances() {
  const token1 = useAppSelector((state) => state.pairSelector.token1);
  const token2 = useAppSelector((state) => state.pairSelector.token2);
  return (
    <div className="flex justify-between">
      <div className="">
        <div className="text-sm">Available balances:</div>
      </div>
      <div className="text-xs">
        <div className="flex flex-row justify-end">
          <div>{token1.balance}</div>
          <img src={token1.iconUrl} className="w-3 h-3 !my-auto mx-1" />
          <span>{token1.symbol}</span>
        </div>

        <div className="flex flex-row justify-end">
          <div>{token2.balance}</div>
          <img src={token2.iconUrl} className="w-3 h-3 !my-auto mx-1" />
          <span>{token2.symbol}</span>
        </div>
      </div>
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
  const selecedToken = useAppSelector(getSelectedToken);

  const dispatch = useAppDispatch();

  return (
    <div className="btn-group">
      <button
        className={
          "btn" +
          (selecedToken.address === pairToken1.address ? " btn-active" : "")
        }
        onClick={() => {
          dispatch(orderInputSlice.actions.setToken1Selected(true));
        }}
      >
        {pairToken1.symbol}
      </button>
      <button
        className={
          "btn" +
          (selecedToken.address === pairToken2.address ? " btn-active" : "")
        }
        onClick={() => {
          dispatch(orderInputSlice.actions.setToken1Selected(false));
        }}
      >
        {pairToken2.symbol}
      </button>
    </div>
  );
}

function PositionSizeInput() {
  const defaultValue = useAppSelector((state) => state.orderInput.size);
  const selectedToken = useAppSelector(getSelectedToken);
  const validationResult = useAppSelector(validatePositionSize);
  const dispatch = useAppDispatch();
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">Position Size</span>
      </label>
      <div className="relative">
        <input
          type="number"
          className={
            "input input-bordered w-full" +
            (validationResult.valid ? "" : " input-error")
          }
          defaultValue={defaultValue}
          value={defaultValue}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const size = Number(event.target.value);
            dispatch(orderInputSlice.actions.setSize(size));
          }}
        ></input>

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          <img src={selectedToken.iconUrl} className="w-6 h-6 my-auto mx-1" />
          <span>{selectedToken.symbol}</span>
        </div>
      </div>
      <label className="label">
        <span className="label-text-alt text-error">
          {validationResult.valid ? "" : validationResult.message}
        </span>
      </label>

      <div className="btn-group w-full">
        <button
          className="btn btn-sm"
          onClick={() => dispatch(setSizePercent(25))}
        >
          25%
        </button>
        <button
          className="btn btn-sm"
          onClick={() => dispatch(setSizePercent(50))}
        >
          50%
        </button>
        <button
          className="btn btn-sm"
          onClick={() => dispatch(setSizePercent(75))}
        >
          75%
        </button>
        <button
          className="btn btn-sm"
          onClick={() => dispatch(setSizePercent(100))}
        >
          100%
        </button>
        <input
          type="number"
          className="input input-sm bg-neutral"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const size = Number(event.target.value);
            dispatch(setSizePercent(size));
          }}
        ></input>
      </div>
    </div>
  );
}

// TODO: test if floating point numbers are handled correctly
function slippagePercentage(slippage: number): string {
  return displayNumber(slippage * 100, 0);
}

function slippageFromPercentage(percentage: string): number {
  // TODO: decimal numbers with dots (1.3) don't work (but 1,3 does)
  return Number(percentage) / 100;
}

function MarketOrderInput() {
  const defaultValue = useAppSelector((state) => state.orderInput.slippage);
  const validationResult = useAppSelector(validateSlippageInput);
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
            className={
              "input input-bordered w-full" +
              (validationResult.valid ? "" : " input-error")
            }
            defaultValue={slippagePercentage(defaultValue)}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const slippage = slippageFromPercentage(event.target.value);
              dispatch(orderInputSlice.actions.setSlippage(slippage));
            }}
          ></input>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <span>%</span>
          </div>
        </div>
        <label className="label">
          <span className="label-text-alt text-error">
            {validationResult.valid ? "" : validationResult.message}
          </span>
        </label>
      </div>

      <PositionSizeInput />
    </>
  );
}

function LimitOrderInput() {
  const defaultValue = useAppSelector((state) => state.orderInput.price);
  const priceToken = useAppSelector(getUnselectedToken);
  const validationResult = useAppSelector(validatePriceInput);
  const bestBuyPrice = useAppSelector((state) => state.orderBook.bestBuy);
  const bestSellPrice = useAppSelector((state) => state.orderBook.bestSell);
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
            className={
              "input input-bordered w-full" +
              (validationResult.valid ? "" : " input-error")
            }
            value={defaultValue}
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
        <label className="label">
          <span className="label-text-alt text-error">
            {validationResult.valid ? "" : validationResult.message}
          </span>
        </label>
        <div className="btn-group w-full">
          <button
            className="btn btn-sm"
            onClick={() =>
              dispatch(orderInputSlice.actions.setPrice(bestBuyPrice || 0))
            }
          >
            Best Buy: {bestBuyPrice}
          </button>
          <button
            className="btn btn-sm"
            onClick={() =>
              dispatch(orderInputSlice.actions.setPrice(bestSellPrice || 0))
            }
          >
            Best Sell: {bestSellPrice}
          </button>
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
  const symbol = useAppSelector(getSelectedToken).symbol;
  const tab = useAppSelector((state) => state.orderInput.tab);
  const side = useAppSelector((state) => state.orderInput.side);
  const transactionInProgress = useAppSelector(
    (state) => state.orderInput.transactionInProgress
  );
  const transactionResult = useAppSelector(
    (state) => state.orderInput.transactionResult
  );
  const validationResult = useAppSelector(validateOrderInput);
  const dispatch = useAppDispatch();
  const submitString =
    (tab === OrderTab.LIMIT ? "LIMIT " : "") +
    (side === OrderSide.BUY ? "Buy " : "Sell ") +
    symbol;

  return (
    <div className="flex flex-col">
      <button
        className="flex-1 btn btn-primary"
        disabled={!validationResult.valid || transactionInProgress}
        onClick={() => dispatch(submitOrder())}
      >
        {transactionInProgress ? "Transaction in progress..." : submitString}
      </button>
      <div className="text-sm">{transactionResult}</div>
    </div>
  );
}

export function OrderInput() {
  // updates quote when any of the listed dependencies changes
  const dispatch = useAppDispatch();
  const pairAddress = useAppSelector((state) => state.pairSelector.address);
  const token1Selected = useAppSelector(
    (state) => state.orderInput.token1Selected
  );
  const side = useAppSelector((state) => state.orderInput.side);
  const size = useAppSelector((state) => state.orderInput.size);
  const price = useAppSelector((state) => state.orderInput.price);
  const preventImmediateExecution = useAppSelector(
    (state) => state.orderInput.preventImmediateExecution
  );
  const slippage = useAppSelector((state) => state.orderInput.slippage);
  const tab = useAppSelector((state) => state.orderInput.tab);

  const validationResult = useAppSelector(validateOrderInput);

  useEffect(() => {
    dispatch(fetchBalances());
  }, [dispatch, pairAddress]);

  useEffect(() => {
    if (validationResult.valid) {
      dispatch(fetchQuote());
    }
  }, [
    pairAddress,
    side,
    size,
    price,
    slippage,
    tab,
    token1Selected,
    preventImmediateExecution,
    validationResult,
    dispatch,
  ]);

  return (
    <div className="max-w-sm my-8 flex flex-col">
      <OrderTypeTabs />

      <AvailableBalances />

      <div className="flex flex-row justify-between my-2">
        <DirectionToggle />
        <AssetToggle />
      </div>

      {tab === OrderTab.MARKET ? <MarketOrderInput /> : <LimitOrderInput />}

      <Description />

      <SubmitButton />
    </div>
  );
}
