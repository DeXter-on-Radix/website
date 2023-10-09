import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "hooks";
import {
  OrderTab,
  fetchQuote,
  orderInputSlice,
  selectTargetToken,
  submitOrder,
  validateOrderInput,
} from "redux/orderInputSlice";
import { fetchBalances } from "redux/pairSelectorSlice";
import { OrderTypeTabs } from "./OrderTypeTabs";
import { MarketOrderInput } from "./MarketOrderInput";
import { LimitOrderInput } from "./LimitOrderInput";

function SubmitButton() {
  const symbol = useAppSelector(selectTargetToken).symbol;
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
  const submitString = tab.toString() + " " + side.toString() + " " + symbol;

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
    token1,
    token2,
    side,
    price,
    preventImmediateExecution,
    slippage,
    tab,
  } = useAppSelector((state) => state.orderInput);
  const tartgetToken = useAppSelector(selectTargetToken);
  const pairAddress = useAppSelector((state) => state.pairSelector.address);

  const validationResult = useAppSelector(validateOrderInput);

  useEffect(() => {
    dispatch(fetchBalances());
  }, [dispatch, pairAddress]);

  useEffect(() => {
    if (validationResult.valid && tartgetToken.amount !== "") {
      dispatch(fetchQuote());
    }
  }, [
    dispatch,
    pairAddress,
    token1,
    token2,
    side,
    price,
    slippage,
    tab,
    preventImmediateExecution,
    validationResult,
    tartgetToken,
  ]);

  return (
    <>
      <OrderTypeTabs />
      <div className="form-control justify-between items-start bg-neutral p-3 flex-1 w-full">
        {tab === OrderTab.MARKET ? <MarketOrderInput /> : <LimitOrderInput />}
        <SubmitButton />
      </div>
    </>
  );
}
