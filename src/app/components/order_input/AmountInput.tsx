import React from "react";

import { useAppDispatch, useAppSelector, useTranslations } from "hooks";
import {
  OrderTab,
  TokenInput,
  orderInputSlice,
  selectBalanceByAddress,
  selectTargetToken,
  selectValidationByAddress,
} from "state/orderInputSlice";
import { BottomRightErrorLabel } from "components/BottomRightErrorLabel";
import { getLocaleSeparators } from "utils";
import { IMaskInput } from "react-imask";

export const enum PayReceive {
  PAY = "PAY",
  RECEIVE = "RECEIVE",
}

interface TokenInputFiledProps extends TokenInput {
  payReceive: string;
  disabled?: boolean;
  onFocus?: () => void;
  onAccept: (value: any) => void;
}

export function AmountInput(props: TokenInputFiledProps) {
  const t = useTranslations();
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
    onAccept,
  } = props;

  const { decimalSeparator } = getLocaleSeparators();
  const placeholder = `0${decimalSeparator}0`;

  return (
    <div className="form-control my-2">
      {/* balance */}
      <div className="flex justify-between text-secondary-content text-xs">
        <div className="space-x-1">
          <span className="uppercase">{t("balance")}:</span>
          <span>{balance}</span>
        </div>
        <span className="text-primary-content uppercase">{t(payReceive)}:</span>
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
          <span className="font-bold text-primary-content text-sm">
            {symbol}
          </span>
        </div>

        <IMaskInput
          disabled={disabled || false}
          min={0}
          mask={Number}
          unmask={"typed"}
          scale={targetToken.decimals}
          placeholder={placeholder}
          radix={decimalSeparator}
          value={String(amount)}
          className={
            "flex-1 text-end mr-1 min-w-0 font-bold text-primary-content" +
            (disabled ? " !bg-neutral" : " !bg-base-200")
          }
          onFocus={onFocus}
          onAccept={onAccept}
        ></IMaskInput>
      </div>

      <BottomRightErrorLabel message={t(message)} />
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
