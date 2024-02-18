import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "hooks";
import {
  OrderTab,
  selectTargetToken,
  submitOrder,
  validatePriceInput,
  validateSlippageInput,
} from "state/orderInputSlice";
import { fetchBalances } from "state/pairSelectorSlice";
import { LimitOrderInput } from "./LimitOrderInput";
import { MarketOrderInput } from "./MarketOrderInput";
import { OrderSideTabs } from "./OrderSideTabs";
import { OrderTypeTabs } from "./OrderTypeTabs";

function SubmitButton() {
  const symbol = useAppSelector(selectTargetToken).symbol;
  const tartgetToken = useAppSelector(selectTargetToken);

  const {
    tab,
    side,
    validationToken1,
    validationToken2,
    transactionInProgress,
    transactionResult,
  } = useAppSelector((state) => state.orderInput);

  const dispatch = useAppDispatch();
  const submitString = tab.toString() + " " + side.toString() + " " + symbol;

  const isPriceValid = useAppSelector(validatePriceInput).valid;
  const isSlippageValid = useAppSelector(validateSlippageInput).valid;
  const isValidTransaction =
    tartgetToken.amount !== "" &&
    validationToken1.valid &&
    validationToken2.valid &&
    isPriceValid &&
    isSlippageValid;

  return (
    <div className="flex flex-col w-full">
      <button
        className="flex-1 btn btn-accent"
        disabled={!isValidTransaction || transactionInProgress}
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
    <div className="h-full w-full flex flex-col text-base">
      <OrderTypeTabs />
      {tab === OrderTab.LIMIT && <OrderSideTabs />}
      <div className="form-control justify-start flex-grow items-start bg-neutral p-4 w-full">
        {tab === OrderTab.MARKET ? <MarketOrderInput /> : <LimitOrderInput />}
        <SubmitButton />
        <div className="collapse collapse-arrow text-left">
          <input type="checkbox" />
          <div className="collapse-title font-medium text-sm pl-0">
            Total fee: {quote?.totalFees ?? 0} {quote?.toToken?.symbol}
          </div>
          <div className="collapse-content text-sm pl-0">
            <div className="flex items-center justify-between">
              <div>Exchange Fee: </div>
              <div>
                {quote?.exchangeFees} {quote?.toToken?.symbol}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>Platform Fee: </div>
              <div>
                {quote?.platformFees} {quote?.toToken?.symbol}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>Liquidity Fee: </div>
              <div>
                {quote?.liquidityFees} {quote?.toToken?.symbol}
              </div>
            </div>
            <div>
              <div>{description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
