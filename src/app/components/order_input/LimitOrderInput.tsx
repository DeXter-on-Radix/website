import React, { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "hooks";
import {
  OrderSide,
  fetchQuote,
  isValidQuoteInput,
  orderInputSlice,
  selectBalanceByAddress,
} from "redux/orderInputSlice";
import {
  AmountInput,
  PayReceive,
  SwitchTokenPlacesButton,
} from "./AmountInput";
import { numberOrEmptyInput } from "utils";
import { AiOutlineInfoCircle } from "react-icons/ai";

const POST_ONLY_TOOLTIP =
  "If your price is very close to the current market price, your limit order might fill immediately, " +
  "making you pay taker fees. This option prevents your order from being executed immediately, " +
  "guarantees that your order will make it to the order book and you will earn the liquidity provider fees.";

function NonTargetToken() {
  const { token2, side } = useAppSelector((state) => state.orderInput);
  const balance = useAppSelector((state) =>
    selectBalanceByAddress(state, token2.address)
  );
  const { symbol, iconUrl, valid, message, amount } = token2;

  return (
    <div className="form-control my-2">
      {/* balance */}
      <div className="flex justify-between text-secondary-content text-xs">
        <div className="space-x-1">
          <span>BALANCE:</span>
          <span>{balance || "unknown"}</span>
        </div>
        <span className="text-secondary-content">
          {side === OrderSide.BUY ? PayReceive.PAY : PayReceive.RECEIVE}
        </span>
      </div>

      {/* input */}
      <div
        className={
          "flex justify-between items-center" +
          (!valid ? " border-2 !border-error" : "")
        }
      >
        <div className="flex flex-nowrap items-center bg-base-100 p-2 w-28">
          <img
            src={iconUrl}
            alt={symbol}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span>{symbol}</span>
        </div>

        <span className="mr-1">{amount}</span>
      </div>

      {/* error message */}
      <label className="text-xs flex">
        <span className="text-error">{message}</span>
      </label>
    </div>
  );
}

function PriceInput() {
  const { token1: pairToken1, token2: pairToken2 } = useAppSelector(
    (state) => state.pairSelector
  );
  const { side, price } = useAppSelector((state) => state.orderInput);
  const dispatch = useAppDispatch();
  return (
    <>
      <div className="text-xs text-end">
        {side === OrderSide.BUY ? "AT MAX PRICE:" : "AT MIN PRICE:"}
      </div>
      <div className="flex items-center justify-between space-x-2 border-2 border-secondary-content bg-base-200">
        <div className="flex ml-1">
          <span>1</span>
          <img
            src={pairToken1.iconUrl}
            alt={pairToken1.symbol}
            className="w-6 h-6 rounded-full mx-2"
          />
          =
        </div>
        <div className="flex items-center">
          <input
            type="number"
            className="p-2 text-end text-accent min-w-0 !bg-base-200"
            value={price}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const price = Number(event.target.value);

              dispatch(orderInputSlice.actions.setPrice(price));
            }}
          />
          <img
            src={pairToken2.iconUrl}
            alt={pairToken2.symbol}
            className="w-6 h-6 rounded-full mx-2"
          />
        </div>
      </div>
    </>
  );
}

export function LimitOrderInput() {
  const { token1, price, side, tab, postOnly } = useAppSelector(
    (state) => state.orderInput
  );

  const { address: pairAddress } = useAppSelector(
    (state) => state.pairSelector
  );

  const balanceToken1 = useAppSelector((state) =>
    selectBalanceByAddress(state, token1.address)
  );

  const dispatch = useAppDispatch();

  const bestBuyPrice = useAppSelector((state) => state.orderBook.bestBuy);
  const bestSellPrice = useAppSelector((state) => state.orderBook.bestSell);

  const quoteValidation = useAppSelector(isValidQuoteInput);

  useEffect(() => {
    if (quoteValidation.valid && token1.amount !== "") {
      dispatch(fetchQuote());
    }
  }, [
    dispatch,
    pairAddress,
    token1,
    side,
    price,
    tab,
    postOnly,
    quoteValidation,
  ]);

  return (
    <>
      <div className="form-control w-full">
        <div className="my-4">
          <AmountInput
            {...token1}
            payReceive={
              side === OrderSide.BUY ? PayReceive.RECEIVE : PayReceive.PAY
            }
            onChange={(event) => {
              const params = {
                amount: numberOrEmptyInput(event),
                balance: balanceToken1 || 0,
              };
              dispatch(orderInputSlice.actions.setAmountToken1(params));
            }}
          />

          <SwitchTokenPlacesButton />

          <NonTargetToken />
        </div>

        <PriceInput />

        <div className="flex flex-row justify-between space-x-2">
          <div className="text-left my-2 text-sm">
            <div>
              BEST BUY&nbsp;&nbsp;={" "}
              <span
                className="cursor-pointer hover:text-accent"
                onClick={() =>
                  dispatch(orderInputSlice.actions.setPrice(bestBuyPrice || 0))
                }
              >
                {bestBuyPrice}
              </span>
            </div>
            <div>
              BEST SELL ={" "}
              <span
                className="cursor-pointer hover:text-accent"
                onClick={() =>
                  dispatch(orderInputSlice.actions.setPrice(bestSellPrice || 0))
                }
              >
                {bestSellPrice}
              </span>
            </div>
          </div>

          <div className="flex">
            <input
              checked={postOnly}
              type="checkbox"
              className="checkbox checkbox-sm my-auto mr-2"
              onClick={() => dispatch(orderInputSlice.actions.togglePostOnly())}
            />
            <span className="my-auto text-secondary-content text-sm">
              POST ONLY
            </span>
            <div
              className="my-auto ml-2 tooltip z-10"
              data-tip={POST_ONLY_TOOLTIP}
            >
              <AiOutlineInfoCircle className="text-secondary-content text-sm" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
