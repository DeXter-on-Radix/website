import React, { useEffect } from "react";

import { useAppDispatch, useAppSelector, useTranslations } from "hooks";
import {
  OrderSide,
  fetchQuote,
  orderInputSlice,
  selectBalanceByAddress,
  validatePriceInput,
} from "state/orderInputSlice";
import {
  AmountInput,
  PayReceive,
  SwitchTokenPlacesButton,
} from "./AmountInput";
import { numberOrEmptyInput } from "utils";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BottomRightErrorLabel } from "components/BottomRightErrorLabel";

const POST_ONLY_TOOLTIP =
  "Select 'POST ONLY' when you want your order to be added to the order book without matching existing orders. " +
  "If the order can be matched immediately, it will not be created. " +
  "This option helps ensure you receive the maker rebate.";

function NonTargetToken() {
  const t = useTranslations();
  const { token2, validationToken2, side } = useAppSelector(
    (state) => state.orderInput
  );
  const balance = useAppSelector((state) =>
    selectBalanceByAddress(state, token2.address)
  );
  const { symbol, iconUrl, amount, address } = token2;
  const { valid, message } = validationToken2;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (side === OrderSide.SELL) {
      dispatch(orderInputSlice.actions.validateAmount({ amount, address }));
    } else {
      dispatch(
        orderInputSlice.actions.validateAmountWithBalance({
          amount,
          address,
          balance: balance || 0,
        })
      );
    }
  }, [amount, side, dispatch, balance, address]);

  return (
    <div className="form-control my-2">
      {/* balance */}
      <div className="flex justify-between text-secondary-content text-xs">
        <div className="space-x-1">
          <span className="uppercase">{t("balance")}:</span>
          <span>{balance}</span>
        </div>
        <span className="text-secondary-content uppercase">
          {side === OrderSide.BUY ? t(PayReceive.PAY) : t(PayReceive.RECEIVE)}
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

      <BottomRightErrorLabel message={t(message)} />
    </div>
  );
}

function PriceInput() {
  const t = useTranslations();
  const { token1: pairToken1, token2: pairToken2 } = useAppSelector(
    (state) => state.pairSelector
  );
  const { side, price } = useAppSelector((state) => state.orderInput);
  const dispatch = useAppDispatch();
  const priceValidationResult = useAppSelector(validatePriceInput);
  return (
    <>
      <div className="text-xs text-end">
        {side === OrderSide.BUY ? "AT MAX PRICE:" : "AT MIN PRICE:"}
      </div>
      <div
        className={
          "flex items-center justify-between space-x-2 border-2 border-secondary-content bg-base-200" +
          (priceValidationResult.valid ? "" : " !border-error")
        }
      >
        <div className="flex ml-1">
          <span>1</span>
          <img
            src={pairToken1.iconUrl}
            alt={pairToken1.symbol}
            className="w-6 h-6 rounded-full mx-1"
          />
          <span>=</span>
        </div>
        <div className="flex items-center">
          <input
            type="number"
            className="p-2 text-end text-accent min-w-0 !bg-base-200"
            value={price}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              dispatch(
                orderInputSlice.actions.setPrice(
                  numberOrEmptyInput(event.target.value)
                )
              );
            }}
          />
          <img
            src={pairToken2.iconUrl}
            alt={pairToken2.symbol}
            className="w-6 h-6 rounded-full mx-2"
          />
        </div>
      </div>

      <BottomRightErrorLabel message={t(priceValidationResult.message)} />
    </>
  );
}

export function LimitOrderInput() {
  const t = useTranslations();
  const { token1, validationToken1, price, side, tab, postOnly } =
    useAppSelector((state) => state.orderInput);

  const { address: pairAddress } = useAppSelector(
    (state) => state.pairSelector
  );

  const balanceToken1 = useAppSelector((state) =>
    selectBalanceByAddress(state, token1.address)
  );

  const dispatch = useAppDispatch();

  const bestBuyPrice = useAppSelector((state) => state.orderBook.bestBuy);
  const bestSellPrice = useAppSelector((state) => state.orderBook.bestSell);
  const priceValidationResult = useAppSelector(validatePriceInput);

  useEffect(() => {
    if (
      validationToken1.valid &&
      token1.amount !== "" &&
      priceValidationResult.valid
    ) {
      dispatch(fetchQuote());
    }
  }, [
    dispatch,
    pairAddress,
    token1,
    validationToken1,
    side,
    price,
    tab,
    postOnly,
    priceValidationResult,
  ]);

  useEffect(() => {
    if (side === OrderSide.BUY) {
      dispatch(orderInputSlice.actions.validateAmount(token1));
    } else {
      const tokenWithBalance = {
        ...token1,
        balance: balanceToken1 || 0,
      };
      dispatch(
        orderInputSlice.actions.validateAmountWithBalance(tokenWithBalance)
      );
    }
  }, [token1, balanceToken1, side, dispatch]);

  return (
    <div className="form-control w-full">
      <div className="my-4">
        <AmountInput
          {...token1}
          payReceive={
            side === OrderSide.BUY ? PayReceive.RECEIVE : PayReceive.PAY
          }
          onAccept={(value) => {
            dispatch(orderInputSlice.actions.resetValidation());
            dispatch(
              orderInputSlice.actions.setAmountToken1(numberOrEmptyInput(value))
            );
          }}
        />

        <SwitchTokenPlacesButton />

        <NonTargetToken />
      </div>

      <PriceInput />

      <div className="flex flex-row justify-between space-x-2">
        <div className="text-left my-2 text-sm">
          <div className="uppercase">
            {t("best_buy")}&nbsp;&nbsp;={" "}
            <span
              className="cursor-pointer hover:text-accent"
              onClick={() =>
                dispatch(orderInputSlice.actions.setPrice(bestBuyPrice || 0))
              }
            >
              {bestBuyPrice}
            </span>
          </div>
          <div className="uppercase">
            {t("best_sell")} ={" "}
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
            onChange={() => dispatch(orderInputSlice.actions.togglePostOnly())}
          />
          <span className="my-auto text-secondary-content text-sm uppercase">
            {t("post_only")}
          </span>
          <div
            className="my-auto ml-2 tooltip before:bg-base-300 z-10"
            data-tip={t("post_only_tooltip")}
          >
            <AiOutlineInfoCircle className="text-secondary-content text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
