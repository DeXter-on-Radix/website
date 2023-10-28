import React from "react";

import { useAppDispatch, useAppSelector } from "hooks";
import {
  OrderTab,
  TokenInput,
  orderInputSlice,
  selectBalanceByAddress,
  selectTargetToken,
  selectValidationByAddress,
} from "redux/orderInputSlice";
import { BottomRightErrorLabel } from "components/BottomRightErrorLabel";

export const enum PayReceive {
  PAY = "YOU PAY:",
  RECEIVE = "YOU RECEIVE:",
}

interface TokenInputFiledProps extends TokenInput {
  payReceive: string;
  disabled?: boolean;
  onFocus?: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AmountInput(props: TokenInputFiledProps) {
  const tab = useAppSelector((state) => state.orderInput.tab);
  const targetToken = useAppSelector(selectTargetToken);
  const balance = useAppSelector((state) =>
    selectBalanceByAddress(state, props.address)
  );
  const { valid, message } = useAppSelector((state) =>
    selectValidationByAddress(state, props.address)
  );
  const {
    address,
    symbol,
    iconUrl,
    amount,
    disabled,
    payReceive,
    onFocus,
    onChange,
  } = props;

  // TODO: after https://github.com/DeXter-on-Radix/website/pull/159
  // read this from the state instead
  const getDecimalSeparator = () => {
    const numberWithDecimal = 1.1;
    return numberWithDecimal.toLocaleString().substring(1, 2);
  };

  const placeholder = `0${getDecimalSeparator()}0`;

  return (
    <div className="form-control my-2">
      {/* balance */}
      <div className="flex justify-between text-secondary-content text-xs">
        <div className="space-x-1">
          <span>BALANCE:</span>
          <span>{balance}</span>
        </div>
        <span className="text-primary-content">{payReceive}</span>
      </div>

      {/* input */}
      <div
        className={
          "flex flex-row flex-nowrap bg-base-200 justify-between py-2 border-2 border-secondary-content" +
          (targetToken.address === address && tab === OrderTab.MARKET && valid
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
          placeholder={placeholder}
          value={amount}
          className={
            "flex-1 text-end mr-1 min-w-0" +
            (disabled ? " !bg-neutral" : " !bg-base-200")
          }
          onChange={onChange}
          onFocus={onFocus}
        ></input>
      </div>

      <BottomRightErrorLabel message={message} />
    </div>
  );
}

export function SwitchTokenPlacesButton() {
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
