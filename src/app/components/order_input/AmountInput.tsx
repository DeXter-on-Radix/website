import React from "react";

import { useAppDispatch, useAppSelector } from "hooks";
import {
  OrderSide,
  TokenInput,
  orderInputSlice,
  selectTargetToken,
} from "redux/orderInputSlice";

interface TokenInputFiledProps extends TokenInput {
  onFocus: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function nullableNumberInput(event: React.ChangeEvent<HTMLInputElement>) {
  let amount: number | "";
  if (event.target.value === "") {
    amount = "";
  } else {
    amount = Number(event.target.value);
  }
  return amount;
}

function TokenInputFiled(props: TokenInputFiledProps) {
  const targetToken = useAppSelector(selectTargetToken);
  const {
    address,
    symbol,
    iconUrl,
    valid,
    message,
    amount,
    balance,
    onChange,
    onFocus,
  } = props;
  return (
    <div className="form-control my-2">
      {/* balance */}
      <div className="flex justify-between text-secondary-content text-xs">
        <span>Current balance:</span>
        <span>{balance || "unknown"}</span>
      </div>

      {/* input */}
      <div
        className={
          "flex flex-row flex-nowrap bg-base-300 justify-between py-1" +
          (targetToken.address === address ? " border border-accent" : "") +
          (!valid ? " border border-error" : "")
        }
      >
        <div className="flex flex-nowrap items-center">
          <img
            src={iconUrl}
            alt={symbol}
            className="w-6 h-6 rounded-full mx-2"
          />
          <span>{symbol}</span>
        </div>

        <input
          type="number"
          value={amount}
          className="flex-1 text-end mr-1 min-w-0"
          onChange={onChange}
          onFocus={onFocus}
        ></input>
      </div>

      {/* error message */}
      <label className="text-xs flex">
        <span className="text-error">{message}</span>
      </label>
    </div>
  );
}

export function AmountInput() {
  const { token1, token2, quote, description } = useAppSelector(
    (state) => state.orderInput
  );

  const dispatch = useAppDispatch();

  return (
    <div className="">
      <TokenInputFiled
        {...token1}
        onFocus={() => {
          dispatch(orderInputSlice.actions.setSide(OrderSide.SELL));
        }}
        onChange={(event) => {
          dispatch(
            orderInputSlice.actions.setAmountToken1(nullableNumberInput(event))
          );
        }}
      />

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="20"
        viewBox="0 0 16 20"
        className="text-primary-content hover:text-accent ml-4"
        fill="none"
        onClick={() => {
          dispatch(orderInputSlice.actions.swapTokens());
        }}
      >
        <path
          d="M4 11V3.825L1.425 6.4L0 5L5 0L10 5L8.575 6.4L6 3.825V11H4ZM11 20L6 15L7.425 13.6L10 16.175V9H12V16.175L14.575 13.6L16 15L11 20Z"
          fill="currentColor"
        />
      </svg>

      <TokenInputFiled
        {...token2}
        onFocus={() => {
          dispatch(orderInputSlice.actions.setSide(OrderSide.BUY));
        }}
        onChange={(event) => {
          dispatch(
            orderInputSlice.actions.setAmountToken2(nullableNumberInput(event))
          );
        }}
      />

      <div className="collapse collapse-arrow text-left">
        <input type="checkbox" />
        <div className="collapse-title font-medium text-sm pl-0">
          Total fee: {quote?.totalFees ?? 0} {quote?.toToken.symbol}
        </div>
        <div className="collapse-content text-sm pl-0">
          <div className="flex items-center justify-between">
            <div>Exchange Fee: </div>
            <div>
              {quote?.exchangeFees} {quote?.toToken.symbol}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>Platform Fee: </div>
            <div>
              {quote?.platformFees} {quote?.toToken.symbol}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>Liquidity Fee: </div>
            <div>
              {quote?.liquidityFees} {quote?.toToken.symbol}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>Description: </div>
            <div>{description}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
