import { useEffect } from "react";

import { TokenAvatar } from "common/tokenAvatar";
import { useAppDispatch, useAppSelector } from "hooks";
import {
  OrderSide,
  OrderTab,
  fetchQuote,
  getSelectedToken,
  orderInputSlice,
  submitOrder,
  validateOrderInput,
} from "redux/orderInputSlice";
import { fetchBalances } from "redux/pairSelectorSlice";
import { OrderTypeTabs } from "./OrderTypeTabs";
import { MarketOrderInput } from "./MarketOrderInput";
import { LimitOrderInput } from "./LimitOrderInput";

function SingleGroupButton({
  isActive,
  onClick,
  avatarUrl,
  text,
  wrapperClass,
}: {
  isActive: boolean;
  onClick: () => void;
  avatarUrl?: string;
  text: string;
  wrapperClass?: string;
}) {
  return (
    <div
      className={
        "btn btn-primary flex flex-row flex-nowrap !ml-0 max-w-[15ch] min-h-0 h-11 " +
        (isActive ? "btn-active " : "") +
        wrapperClass
      }
      onClick={onClick}
    >
      {avatarUrl && <TokenAvatar url={avatarUrl} />}
      <p className="truncate" title={text}>
        {text}
      </p>
    </div>
  );
}

function DirectionToggle() {
  const activeSide = useAppSelector((state) => state.orderInput.side);
  const dispatch = useAppDispatch();
  const isBuyActive = activeSide === OrderSide.BUY;
  const isSellActive = activeSide === OrderSide.SELL;
  return (
    <div className="btn-group w-full ">
      <SingleGroupButton
        text="Buy"
        isActive={isBuyActive}
        onClick={() => {
          dispatch(orderInputSlice.actions.setSide(OrderSide.BUY));
        }}
        wrapperClass={
          "w-1/2 max-w-none border-none " + (isBuyActive ? "!bg-neutral" : "")
        }
      />
      <SingleGroupButton
        text="Sell"
        isActive={isSellActive}
        onClick={() => {
          dispatch(orderInputSlice.actions.setSide(OrderSide.SELL));
        }}
        wrapperClass={
          "w-1/2 max-w-none border-none " + (isSellActive ? "!bg-neutral" : "")
        }
      />
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
    <div className="flex flex-col w-full">
      {tab === OrderTab.LIMIT && (
        <div className="flex justify-start mb-2">
          <input
            type="checkbox"
            className="checkbox checkbox-sm my-auto mr-2"
            onClick={() =>
              dispatch(
                orderInputSlice.actions.togglePreventImmediateExecution()
              )
            }
          />
          <span className="my-auto text-sm">Prevent immediate execution </span>
        </div>
      )}
      <button
        className="flex-1 btn btn-accent"
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
  const dispatch = useAppDispatch();
  const {
    token1Selected,
    side,
    size,
    price,
    preventImmediateExecution,
    slippage,
    tab,
  } = useAppSelector((state) => state.orderInput);
  const pairAddress = useAppSelector((state) => state.pairSelector.address);

  const validationResult = useAppSelector(validateOrderInput);

  useEffect(() => {
    dispatch(fetchBalances());
  }, [dispatch, pairAddress]);

  useEffect(() => {
    if (validationResult.valid) {
      dispatch(fetchQuote());
    }
  }, [
    dispatch,
    pairAddress,
    side,
    size,
    price,
    slippage,
    tab,
    token1Selected,
    preventImmediateExecution,
    validationResult,
  ]);

  return (
    <>
      <OrderTypeTabs />
      <div data-value={side} className="flex flex-col items-start">
        <DirectionToggle />
        <div className="flex flex-col justify-between items-start bg-neutral p-3 flex-1 w-full">
          {tab === OrderTab.MARKET ? <MarketOrderInput /> : <LimitOrderInput />}
          <SubmitButton />
        </div>
      </div>
    </>
  );
}
