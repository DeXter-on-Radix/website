import React, { useEffect, useMemo, useRef } from "react";

import { useAppDispatch, useAppSelector } from "../hooks";
import {
  OrderTab,
  OrderSide,
  fetchQuote,
  orderInputSlice,
  getSelectedToken,
  validateOrderInput,
  validatePositionSize,
  validatePriceInput,
  submitOrder,
} from "../redux/orderInputSlice";
import { fetchBalances } from "../redux/pairSelectorSlice";
import { TokenAvatar } from "common/tokenAvatar";
import { Input } from "common/input";

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
          "w-1/2 max-w-none border-none " +
          (isBuyActive ? "!bg-green-800/10" : "")
        }
      />
      <SingleGroupButton
        text="Sell"
        isActive={isSellActive}
        onClick={() => {
          dispatch(orderInputSlice.actions.setSide(OrderSide.SELL));
        }}
        wrapperClass={
          "w-1/2 max-w-none border-none " +
          (isSellActive ? "!bg-red-800/10" : "")
        }
      />
    </div>
  );
}

function PositionSizeInput() {
  const { size, quote, side, tab, price } = useAppSelector(
    (state) => state.orderInput
  );
  const {
    token1: { balance: balance1 },
    token2: { balance: balance2 },
  } = useAppSelector((state) => state.pairSelector);
  const validationResult = useAppSelector(validatePositionSize);
  const { token2, token1 } = useAppSelector((state) => state.pairSelector);
  const dispatch = useAppDispatch();
  // const [customPercentage, setCustomPercentage] = useState(0);

  const customPercentInputRef = useRef<HTMLInputElement>(null);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (customPercentInputRef.current) {
      customPercentInputRef.current.value = "";
    }
    const size = Number(event.target.value);
    dispatch(orderInputSlice.actions.setSize(size));
  };

  // const handleOnPercentChange = (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   if (Number(event.target.value) > 100) return;
  //   const size = Number(event.target.value);
  //   setCustomPercentage(size);
  //   dispatch(setSizePercent(size));
  // };

  const isBuy = useMemo(() => side === OrderSide.BUY, [side]);
  const isSell = useMemo(() => side === OrderSide.SELL, [side]);
  const feeToken = useMemo(
    () => (isBuy ? token1 : token2),
    [isBuy, token1, token2]
  );

  const token2Amount = useMemo(
    () =>
      tab === OrderTab.MARKET
        ? (quote?.avgPrice ?? 0) * size
        : (price ?? 0) * size,
    [price, quote?.avgPrice, size, tab]
  );

  return (
    <div className="form-control w-full">
      <div className="flex flex-row items-center justify-between !mb-2">
        <p className="text-left text-sm font-medium">
          {side.toUpperCase()} Amount:
        </p>
        {isSell && (
          <p className="text-left text-sm font-medium cursor-pointer">
            Balance: <span className="text-white">{balance1}</span>
          </p>
        )}
      </div>
      <Input
        type="number"
        value={size}
        onChange={handleOnChange}
        isError={isSell && !validationResult.valid}
        endAdornment={
          <div className="flex items-center space-x-2">
            <TokenAvatar url={token1.iconUrl} />
            <span className="font-bold text-base">{token1.symbol}</span>
          </div>
        }
      />
      <label className="label">
        <span
          data-value={isSell}
          className="label-text-alt text-error opacity-0 data-[value=true]:opacity-100"
        >
          {validationResult.message}
        </span>
      </label>

      <div className="flex flex-row items-center justify-between !mb-2">
        <p className="text-left text-sm font-medium">
          {isBuy ? "You will give:" : "You will get:"}
        </p>
        {isBuy && (
          <p className="text-left text-sm font-medium cursor-pointer">
            Balance: <span className="text-white">{balance2}</span>
          </p>
        )}
      </div>
      <Input
        type="number"
        value={token2Amount}
        disabled
        isError={isBuy && !validationResult.valid}
        endAdornment={
          <div className="flex items-center space-x-2">
            <TokenAvatar url={token2.iconUrl} />
            <span className="font-bold text-base">{token2.symbol}</span>
          </div>
        }
      />
      <label className="label">
        <span
          data-value={isBuy}
          className="label-text-alt text-error opacity-0 data-[value=true]:opacity-100"
        >
          {validationResult.message}
        </span>
      </label>

      <div className="collapse collapse-arrow text-left">
        <input type="checkbox" />
        <div className="collapse-title font-medium text-sm pl-0">
          Total fee: {quote?.totalFees ?? 0} {feeToken.symbol}
        </div>
        <div className="collapse-content text-sm pl-0">
          <div className="flex items-center justify-between">
            <div>Exchange Fee: </div>
            <div>
              {quote?.exchangeFees} {feeToken.symbol}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>Platform Fee: </div>
            <div>
              {quote?.platformFees} {feeToken.symbol}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>Liquidity Fee: </div>
            <div>
              {quote?.liquidityFees} {feeToken.symbol}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// TODO: test if floating point numbers are handled correctly
// function slippagePercentage(slippage: number): number {
//   return slippage * 100;
// }

// TODO: decimal numbers with dots (1.3) don't work (but 1,3 does)
// function slippageFromPercentage(percentage: string): number {
//   return Number(percentage) / 100;
// }

function MarketOrderInput() {
  // const slippage = useAppSelector((state) => state.orderInput.slippage);
  // const validationResult = useAppSelector(validateSlippageInput);
  // const dispatch = useAppDispatch();

  // const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const slippage = slippageFromPercentage(event.target.value);
  //   dispatch(orderInputSlice.actions.setSlippage(slippage));
  // };
  return (
    <>
      {/* <div className="form-control">
        <label className="label">
          <span className="label-text">Slippage</span>
        </label>
        <Input
          type="number"
          value={slippagePercentage(slippage)}
          onChange={handleOnChange}
          endAdornment={<span className="font-bold">%</span>}
          isError={!validationResult.valid}
        />
        <label className="label">
          <span className="label-text-alt text-error">
            {validationResult.message}
          </span>
        </label>
      </div> */}
      <PositionSizeInput />
    </>
  );
}

function LimitOrderInput() {
  const { price, side } = useAppSelector((state) => state.orderInput);
  const priceToken = useAppSelector((state) => state.pairSelector.token2);
  const validationResult = useAppSelector(validatePriceInput);
  const bestBuyPrice = useAppSelector((state) => state.orderBook.bestBuy);
  const bestSellPrice = useAppSelector((state) => state.orderBook.bestSell);
  const dispatch = useAppDispatch();

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const price = Number(event.target.value);
    dispatch(orderInputSlice.actions.setPrice(price));
  };

  return (
    <>
      <div className="form-control w-full">
        <div className="flex flex-row items-center justify-between">
          <p className="text-left text-sm font-medium !mb-2">
            {side.toUpperCase()} Price
          </p>
          <p
            className="text-left text-sm font-medium !mb-2 cursor-pointer"
            onClick={() =>
              dispatch(
                orderInputSlice.actions.setPrice(
                  side === OrderSide.BUY
                    ? bestBuyPrice || 0
                    : bestSellPrice || 0
                )
              )
            }
          >
            Best Price:{" "}
            <span
              className={
                "font-semibold " +
                (side === OrderSide.BUY ? "text-accent" : "text-error")
              }
            >
              {side === OrderSide.BUY ? bestBuyPrice : bestSellPrice}{" "}
              {priceToken.symbol}
            </span>
          </p>
        </div>
        <Input
          type="number"
          value={price}
          onChange={handleOnChange}
          isError={!validationResult.valid}
          endAdornment={
            <div className="flex items-center space-x-2">
              <TokenAvatar url={priceToken.iconUrl} />
              <span className="font-bold text-base">{priceToken.symbol}</span>
            </div>
          }
        />
        <label className="label">
          <span className="label-text-alt text-error">
            {validationResult.message}
          </span>
        </label>
      </div>
      <PositionSizeInput />
    </>
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
      <div className="flex justify-start">
        <input
          type="checkbox"
          className="checkbox checkbox-sm my-auto mr-2"
          onClick={() =>
            dispatch(orderInputSlice.actions.togglePreventImmediateExecution())
          }
        />
        <span className="my-auto text-sm">Prevent immediate execution </span>
      </div>
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
    <div
      data-value={side}
      className="data-[value=BUY]:bg-green-800/10 data-[value=SELL]:bg-red-800/10 min-h-full flex flex-col items-start"
    >
      <DirectionToggle />
      <div className="flex flex-col justify-between items-start p-3 flex-1 w-full">
        {tab === OrderTab.MARKET ? <MarketOrderInput /> : <LimitOrderInput />}
        <SubmitButton />
      </div>
    </div>
  );
}
