import React from "react";

import { useAppDispatch, useAppSelector } from "hooks";
import {
  OrderSide,
  OrderTab,
  TokenInput,
  orderInputSlice,
  selectTargetToken,
  selectBalanceByAddress,
} from "redux/orderInputSlice";

interface TokenInputFiledProps extends TokenInput {
  disabled?: boolean;
  onFocus?: () => void;
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
  const orderTab = useAppSelector((state) => state.orderInput.tab);
  const targetToken = useAppSelector(selectTargetToken);
  const balance = useAppSelector((state) =>
    selectBalanceByAddress(state, props.address)
  );
  const {
    address,
    symbol,
    iconUrl,
    valid,
    message,
    amount,
    disabled,
    onFocus,
    onChange,
  } = props;
  return (
    <div className="form-control my-2">
      {/* balance */}
      <div className="flex justify-between text-secondary-content text-xs">
        <span>BALANCE:</span>
        <span>{balance || "unknown"}</span>
      </div>

      {/* input */}
      <div
        className={
          "flex flex-row flex-nowrap bg-base-300 justify-between py-2 border border-secondary-content" +
          (targetToken.address === address &&
          orderTab === OrderTab.MARKET &&
          valid
            ? " !border-accent"
            : "") +
          (!valid ? " !border-error" : "") +
          (disabled ? " !bg-neutral" : "")
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
          disabled={disabled || false}
          type="number"
          value={amount}
          className={
            "flex-1 text-end mr-1 min-w-0" + (disabled ? " !bg-neutral" : "")
          }
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

function SwitchTokenPlacesButton() {
  const dispatch = useAppDispatch();
  return (
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
  );
}

export function SwapAmountInput() {
  const { token1, token2 } = useAppSelector((state) => state.orderInput);
  const balanceToken1 = useAppSelector((state) =>
    selectBalanceByAddress(state, token1.address)
  );

  const dispatch = useAppDispatch();

  return (
    <div className="my-4">
      <TokenInputFiled
        {...token1}
        onFocus={() => {
          dispatch(orderInputSlice.actions.setSide(OrderSide.SELL));
        }}
        onChange={(event) => {
          const params = {
            amount: nullableNumberInput(event),
            balance: balanceToken1 || 0,
          };
          dispatch(orderInputSlice.actions.setAmountToken1(params));
        }}
      />

      <SwitchTokenPlacesButton />
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
    </div>
  );
}

export function LimitAmountInput() {
  const { token1, token2 } = useAppSelector((state) => state.orderInput);
  const { side } = useAppSelector((state) => state.orderInput);
  const balanceToken1 = useAppSelector((state) =>
    selectBalanceByAddress(state, token1.address)
  );

  const dispatch = useAppDispatch();

  return (
    <div className="my-4">
      <TokenInputFiled
        disabled={side === OrderSide.BUY}
        {...token1}
        onChange={(event) => {
          const params = {
            amount: nullableNumberInput(event),
            balance: balanceToken1 || 0,
          };
          dispatch(orderInputSlice.actions.setAmountToken1(params));
        }}
      />

      <SwitchTokenPlacesButton />

      <TokenInputFiled
        disabled={side === OrderSide.SELL}
        {...token2}
        onChange={(event) => {
          dispatch(
            orderInputSlice.actions.setAmountToken2(nullableNumberInput(event))
          );
        }}
      />
    </div>
  );
}
