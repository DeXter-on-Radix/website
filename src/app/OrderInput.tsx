import React, { useEffect, useRef } from "react";

import { useAppDispatch, useAppSelector } from "./hooks";
import { fetchQuote, orderInputSlice } from "./orderInputSlice";
import Image from "next/image";
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
    <div className="tabs flex flex-row">
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

function ToggleDirectionButton() {
  // TODO: turn to swap image on hover
  // TODO: dispatch swap action
  const tokenFrom = useAppSelector((state) => state.orderInput.tokenFrom.name);
  const tokenTo = useAppSelector((state) => state.orderInput.tokenTo.name);
  const dispatch = useAppDispatch();
  return (
    <button
      onClick={() => {
        dispatch(orderInputSlice.actions.toggleDirection());
      }}
      className="btn btn-neutral not-prose"
    >
      <Image
        src="/arrows_circle.svg"
        width="24"
        height="24"
        alt={`From ${tokenFrom} to ${tokenTo}`}
        className="mx-auto"
      />
    </button>
  );
}

function TokenFromInput() {
  const symbol = useAppSelector((state) => state.orderInput.tokenFrom.symbol);
  const iconUrl = useAppSelector((state) => state.orderInput.tokenFrom.iconUrl);
  const dispatch = useAppDispatch();
  return (
    <div className="flex flex-row">
      <input
        type="number"
        className="input input-bordered w-full my-1"
        defaultValue={useAppSelector((state) => state.orderInput.size)}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const size = Number(event.target.value);
          dispatch(orderInputSlice.actions.setSize(size));
        }}
      ></input>
      <div className="flex w-24 justify-end">
        <img src={iconUrl} className="w-6 h-6 my-auto mx-1" />
        <div className="my-auto">{symbol}</div>
      </div>
    </div>
  );
}

function TokenToInput() {
  const symbol = useAppSelector((state) => state.orderInput.tokenTo.symbol);
  const iconUrl = useAppSelector((state) => state.orderInput.tokenTo.iconUrl);
  return (
    <div className="flex flex-row">
      <input
        type="number"
        className="input input-bordered w-full my-1"
        disabled
      ></input>
      <div className="flex w-24 justify-end">
        <img src={iconUrl} className="w-6 h-6 my-auto mx-1" />
        <div className="my-auto">{symbol}</div>
      </div>
    </div>
  );
}

function MarketOrderInput() {
  const dispatch = useAppDispatch();
  return (
    <>
      <TokenFromInput />
      <div>
        <div className="flex flex-row">
          <label className="label">Slippage</label>
          <input
            type="number"
            className="input input-bordered w-full my-1"
            defaultValue={useAppSelector((state) => state.orderInput.slippage)}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const slippage = Number(event.target.value);
              dispatch(orderInputSlice.actions.setSlippage(slippage));
            }}
          ></input>
          <div className="w-24 text-end my-auto">%</div>
        </div>
      </div>

      <ToggleDirectionButton />

      <TokenToInput />
    </>
  );
}

function LimitOrderInput() {
  const defaultPrice = useAppSelector((state) => state.orderInput.price);
  const tokenTo = useAppSelector((state) => state.orderInput.tokenTo.symbol);
  const dispatch = useAppDispatch();
  return (
    <>
      <TokenFromInput />

      <div>
        <div className="flex flex-row">
          <label className="label">Price</label>
          <input
            type="number"
            className="input input-bordered w-full my-1"
            defaultValue={defaultPrice}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const price = Number(event.target.value);
              dispatch(orderInputSlice.actions.setPrice(price));
            }}
          ></input>
          <div className="w-24 text-end my-auto">{tokenTo}</div>
        </div>
      </div>

      <ToggleDirectionButton />

      <TokenToInput />
    </>
  );
}

function TransactionPreview() {
  const modalRef = useRef<HTMLDialogElement | null>(null);
  let quote = useAppSelector((state) => state.orderInput.quote);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (modalRef.current) {
      window.transactionPreviewModal = modalRef.current;
    }
  }, []);

  return (
    <dialog id="transactionPreviewModal" className="modal">
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Transaction Preview</h3>
        <div>Total fees: {quote?.totalFees}</div>
        <div>Quote message: {quote?.message}</div>
        <div>Best price: {quote?.bestPrice}</div>
        <div className="modal-action">
          {/* if there is a button in form, it will close the modal */}
          <button
            className="btn btn-accent"
            onClick={() => {
              // TODO: add another one on esc button press
              dispatch(orderInputSlice.actions.clearQuote());
            }}
          >
            Submitting does not work yet
          </button>
        </div>
      </form>
    </dialog>
  );
}

function BuySellButtons() {
  const tokenTo = useAppSelector((state) => state.orderInput.tokenTo.symbol);
  const tab = useAppSelector((state) => state.orderInput.tab);
  const dispatch = useAppDispatch();
  return (
    <div className="flex">
      <TransactionPreview />
      <button
        className="flex-1 btn btn-success"
        onClick={() => {
          dispatch(orderInputSlice.actions.setSide(OrderSide.BUY));
          dispatch(fetchQuote());
          window.transactionPreviewModal?.showModal();
        }}
      >
        {tab === OrderTab.LIMIT ? "LIMIT " : ""} Buy {tokenTo}
      </button>
      <button
        className=" flex-1 btn btn-error"
        onClick={() => {
          dispatch(orderInputSlice.actions.setSide(OrderSide.SELL));
          dispatch(fetchQuote());
          window.transactionPreviewModal?.showModal();
        }}
      >
        {tab === OrderTab.LIMIT ? "LIMIT " : ""} Sell {tokenTo}
      </button>
    </div>
  );
}

export function OrderInput() {
  // updates quote when any of the listed dependencies change
  // alternatively we can fetch on clicking buy/sell button
  const dispatch = useAppDispatch();
  const side = useAppSelector((state) => state.orderInput.side);
  const size = useAppSelector((state) => state.orderInput.size);
  const price = useAppSelector((state) => state.orderInput.price);
  const slippage = useAppSelector((state) => state.orderInput.slippage);
  const tab = useAppSelector((state) => state.orderInput.tab);
  const tokenFrom = useAppSelector((state) => state.orderInput.tokenFrom);
  const tokenTo = useAppSelector((state) => state.orderInput.tokenTo);

  useEffect(() => {
    dispatch(fetchQuote());
  }, [side, size, price, slippage, tab, tokenFrom, tokenTo, dispatch]);

  return (
    <div className="max-w-sm my-8 flex flex-col">
      <OrderTypeTabs />

      {useAppSelector((state) => state.orderInput.tab) === OrderTab.MARKET ? (
        <MarketOrderInput />
      ) : (
        <LimitOrderInput />
      )}

      <BuySellButtons />
    </div>
  );
}
