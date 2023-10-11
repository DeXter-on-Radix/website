import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "hooks";
import {
  OrderTab,
  fetchQuote,
  isValidQuoteInput,
  isValidTransaction,
  selectTargetToken,
  submitOrder,
} from "redux/orderInputSlice";
import { fetchBalances } from "redux/pairSelectorSlice";
import { LimitOrderInput } from "./LimitOrderInput";
import { MarketOrderInput } from "./MarketOrderInput";
import { OrderSideTabs } from "./OrderSideTabs";
import { OrderTypeTabs } from "./OrderTypeTabs";

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
  const transactionValidation = useAppSelector(isValidTransaction);
  const dispatch = useAppDispatch();
  const submitString = tab.toString() + " " + side.toString() + " " + symbol;

  return (
    <div className="flex flex-col w-full">
      <button
        className="flex-1 btn btn-accent"
        disabled={!transactionValidation.valid || transactionInProgress}
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

  const pairAddress = useAppSelector((state) => state.pairSelector.address);
  const { tab, quote, description } = useAppSelector(
    (state) => state.orderInput
  );

  useEffect(() => {
    dispatch(fetchBalances());
  }, [dispatch, pairAddress]);

  return (
    <div className="text-base">
      <OrderTypeTabs />
      {tab === OrderTab.LIMIT && <OrderSideTabs />}
      <div className="form-control justify-between items-start bg-neutral p-4 w-full">
        {tab === OrderTab.MARKET ? <MarketOrderInput /> : <LimitOrderInput />}
        <SubmitButton />
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
            <div className="">
              <div>{description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
