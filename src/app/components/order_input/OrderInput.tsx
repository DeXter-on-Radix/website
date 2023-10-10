import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "hooks";
import {
  OrderTab,
  fetchQuote,
  orderInputSlice,
  selectTargetToken,
  submitOrder,
  isValidQuoteInput,
  isValidTransaction,
} from "redux/orderInputSlice";
import { fetchBalances } from "redux/pairSelectorSlice";
import { OrderTypeTabs } from "./OrderTypeTabs";
import { MarketOrderInput } from "./MarketOrderInput";
import { LimitOrderInput } from "./LimitOrderInput";
import { OrderSideTabs } from "./OrderSideTabs";

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
      {tab === OrderTab.LIMIT && (
        <div className="flex justify-start mb-2">
          <input
            type="checkbox"
            className="checkbox checkbox-sm my-auto mr-2"
            onClick={() => dispatch(orderInputSlice.actions.togglePostOnly())}
          />
          <span className="my-auto text-sm">Post only</span>
        </div>
      )}
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
  const { token1, token2, side, price, postOnly, slippage, tab } =
    useAppSelector((state) => state.orderInput);
  const tartgetToken = useAppSelector(selectTargetToken);
  const pairAddress = useAppSelector((state) => state.pairSelector.address);
  const quote = useAppSelector((state) => state.orderInput.quote);
  const description = useAppSelector((state) => state.orderInput.description);

  const quoteValidation = useAppSelector(isValidQuoteInput);

  useEffect(() => {
    dispatch(fetchBalances());
  }, [dispatch, pairAddress]);

  useEffect(() => {
    if (quoteValidation.valid && tartgetToken.amount !== "") {
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
    postOnly,
    quoteValidation,
    tartgetToken,
  ]);

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
            <div className="flex items-center justify-between">
              <div>Description: </div>
              <div>{description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
