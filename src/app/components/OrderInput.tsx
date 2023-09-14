import React, { useEffect, useRef, useState } from "react";

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
  validateSlippageInput,
  submitOrder,
  setSizePercent,
} from "../redux/orderInputSlice";
import { fetchBalances } from "../redux/pairSelectorSlice";
import { displayAmount } from "../utils";
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

function OrderTypeTabs() {
  const activeTab = useAppSelector((state) => state.orderInput.tab);
  const actions = orderInputSlice.actions;
  const dispatch = useAppDispatch();

  function tabClass(isActive: boolean) {
    return (
      "flex-1 tab tab-bordered border-base-300 no-underline h-full text-base font-semibold pb-3" +
      (isActive ? " tab-active" : "")
    );
  }
  return (
    <div className="tabs mb-2">
      <div
        className={tabClass(activeTab === OrderTab.MARKET)}
        onClick={() => dispatch(actions.setActiveTab(OrderTab.MARKET))}
      >
        Market
      </div>
      <div
        className={tabClass(activeTab === OrderTab.LIMIT)}
        onClick={() => dispatch(actions.setActiveTab(OrderTab.LIMIT))}
      >
        Limit
      </div>
    </div>
  );
}

function AvailableBalances() {
  const token1 = useAppSelector((state) => state.pairSelector.token1);
  const token2 = useAppSelector((state) => state.pairSelector.token2);
  return (
    <div className="flex justify-between">
      <div className="">
        <div className="text-sm">Available balances:</div>
      </div>
      <div className="text-xs">
        <div className="flex flex-row justify-end">
          <div>{displayAmount(token1.balance || 0)}</div>
          <img
            alt="Token 1 Icon"
            src={token1.iconUrl}
            className="w-3 h-3 !my-auto mx-1"
          />
          <span>{token1.symbol}</span>
        </div>

        <div className="flex flex-row justify-end">
          <div>{displayAmount(token2.balance || 0)}</div>
          <img
            alt="Token 2 Icon"
            src={token2.iconUrl}
            className="w-3 h-3 !my-auto mx-1"
          />
          <span>{token2.symbol}</span>
        </div>
      </div>
    </div>
  );
}

function DirectionToggle() {
  const activeSide = useAppSelector((state) => state.orderInput.side);
  const dispatch = useAppDispatch();
  return (
    <div>
      <p className="text-left text-sm font-medium">Direction</p>
      <div className="btn-group border border-base-300 my-2">
        <SingleGroupButton
          text="Buy"
          isActive={activeSide === OrderSide.BUY}
          onClick={() => {
            dispatch(orderInputSlice.actions.setSide(OrderSide.BUY));
          }}
        />
        <SingleGroupButton
          text="Sell"
          isActive={activeSide === OrderSide.SELL}
          onClick={() => {
            dispatch(orderInputSlice.actions.setSide(OrderSide.SELL));
          }}
        />
      </div>
    </div>
  );
}

function AssetToggle() {
  const pairToken1 = useAppSelector((state) => state.pairSelector.token1);
  const pairToken2 = useAppSelector((state) => state.pairSelector.token2);
  const selectedToken = useAppSelector(getSelectedToken);

  const dispatch = useAppDispatch();

  return (
    <div>
      <p className="text-left text-sm font-medium">Asset</p>
      <div className="border btn-group border-base-300 my-2">
        <SingleGroupButton
          avatarUrl={pairToken1.iconUrl}
          text={pairToken1.symbol}
          isActive={selectedToken.address === pairToken1.address}
          onClick={() => {
            dispatch(orderInputSlice.actions.setToken1Selected(true));
          }}
        />
        <SingleGroupButton
          avatarUrl={pairToken2.iconUrl}
          text={pairToken2.symbol}
          isActive={selectedToken.address === pairToken2.address}
          onClick={() => {
            dispatch(orderInputSlice.actions.setToken1Selected(false));
          }}
        />
      </div>
    </div>
  );
}

function PositionSizeInput() {
  const size = useAppSelector((state) => state.orderInput.size);
  const selectedToken = useAppSelector(getSelectedToken);
  const validationResult = useAppSelector(validatePositionSize);
  const dispatch = useAppDispatch();

  const [customPercentage, setCustomPercentage] = useState(0);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);

  const customPercentInputRef = useRef<HTMLInputElement>(null);
  const handleButtonClick = (percent: number) => {
    setCustomPercentage(percent);
    dispatch(setSizePercent(percent));
    if (customPercentInputRef.current) {
      customPercentInputRef.current.value = "";
    }
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isFirstInteraction) setIsFirstInteraction(false);
    if (customPercentInputRef.current) {
      customPercentInputRef.current.value = "";
    }
    const size = Number(event.target.value);
    dispatch(orderInputSlice.actions.setSize(size));
  };

  const handleOnPercentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (Number(event.target.value) > 100) return;
    const size = Number(event.target.value);
    setCustomPercentage(size);
    dispatch(setSizePercent(size));
  };

  return (
    <div className="form-control">
      <p className="text-left text-sm font-medium !mb-2">Position Size</p>
      <Input
        type="number"
        value={size}
        onChange={handleOnChange}
        isError={!isFirstInteraction && !validationResult.valid}
        endAdornment={
          <div className="flex items-center space-x-2">
            <TokenAvatar url={selectedToken.iconUrl} />
            <span className="font-bold text-base">{selectedToken.symbol}</span>
          </div>
        }
      />
      <label className="label">
        <span className="label-text-alt text-error">
          {validationResult.message}
        </span>
      </label>

      <div className="@container flex flex-row items-center justify-between">
        <div className="btn-group border border-base-300 mb-2 flex-wrap w-min @[360px]:w-max">
          <div className="flex flex-row">
            <SingleGroupButton
              text="25%"
              isActive={customPercentage === 25}
              onClick={() => handleButtonClick(25)}
            />
            <SingleGroupButton
              text="50%"
              isActive={customPercentage === 50}
              onClick={() => handleButtonClick(50)}
            />
          </div>
          <div className="flex flex-row">
            <SingleGroupButton
              text="75%"
              isActive={customPercentage === 75}
              onClick={() => handleButtonClick(75)}
            />
            <SingleGroupButton
              text="100%"
              isActive={customPercentage === 100}
              onClick={() => handleButtonClick(100)}
            />
          </div>
        </div>
        <Input
          value={Boolean(customPercentage) ? customPercentage : undefined}
          type="number"
          inputClasses="!w-14"
          endAdornmentClasses="px-0 pr-2"
          parentClasses="mb-2"
          placeholder="0.00"
          endAdornment={<span className="font-bold">%</span>}
          onChange={handleOnPercentChange}
        />
      </div>
    </div>
  );
}

// TODO: test if floating point numbers are handled correctly
function slippagePercentage(slippage: number): number {
  return slippage * 100;
}

// TODO: decimal numbers with dots (1.3) don't work (but 1,3 does)
function slippageFromPercentage(percentage: string): number {
  return Number(percentage) / 100;
}

function MarketOrderInput() {
  const slippage = useAppSelector((state) => state.orderInput.slippage);
  const validationResult = useAppSelector(validateSlippageInput);
  const dispatch = useAppDispatch();
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isFirstInteraction) setIsFirstInteraction(false);
    const slippage = slippageFromPercentage(event.target.value);
    dispatch(orderInputSlice.actions.setSlippage(slippage));
  };
  return (
    <>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Slippage</span>
        </label>
        <Input
          type="number"
          value={slippagePercentage(slippage)}
          onChange={handleOnChange}
          endAdornment={<span className="font-bold">%</span>}
          isError={!isFirstInteraction && !validationResult.valid}
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

function LimitOrderInput() {
  const price = useAppSelector((state) => state.orderInput.price);
  const priceToken = useAppSelector((state) => state.pairSelector.token2);
  const validationResult = useAppSelector(validatePriceInput);
  const bestBuyPrice = useAppSelector((state) => state.orderBook.bestBuy);
  const bestSellPrice = useAppSelector((state) => state.orderBook.bestSell);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const dispatch = useAppDispatch();

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isFirstInteraction) setIsFirstInteraction(false);
    const price = Number(event.target.value);
    dispatch(orderInputSlice.actions.setPrice(price));
  };

  return (
    <>
      <div className="form-control">
        <p className="text-left text-sm font-medium !mb-2">Price</p>
        <Input
          type="number"
          value={price}
          onChange={handleOnChange}
          isError={!isFirstInteraction && !validationResult.valid}
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
        <div className="btn-group border border-base-300 w-min mb-2">
          <SingleGroupButton
            text={`Best Buy: ${bestBuyPrice}`}
            isActive={false}
            onClick={() =>
              dispatch(orderInputSlice.actions.setPrice(bestBuyPrice || 0))
            }
            wrapperClass="max-w-[30ch]"
          />
          <SingleGroupButton
            text={`Best Sell: ${bestSellPrice}`}
            isActive={false}
            onClick={() =>
              dispatch(orderInputSlice.actions.setPrice(bestSellPrice || 0))
            }
            wrapperClass="max-w-[30ch]"
          />
        </div>
      </div>
      <PositionSizeInput />

      <div className="flex justify-start">
        <input
          type="checkbox"
          className="checkbox my-auto mr-2"
          onClick={() =>
            dispatch(orderInputSlice.actions.togglePreventImmediateExecution())
          }
        />
        <span className="my-auto">Prevent immediate execution </span>
      </div>
    </>
  );
}

function Description() {
  const description = useAppSelector((state) => state.orderInput.description);
  const quote = useAppSelector((state) => state.orderInput.quote);
  return (
    <div className="text-xs my-2">
      <div className="flex">
        <label>AlphaDEX response: </label>
        <span className="ml-1">{quote?.message}</span>
      </div>
      <p className="">{description}</p>
      <div className="flex">
        <label>Dex fees: </label>
        <span className="ml-1">
          {displayAmount(quote?.platformFeesXrd || 0, 7)} XRD
        </span>
      </div>
      <div className="flex">
        <label>Total fees: </label>
        <span className="ml-1">
          {displayAmount(quote?.totalFeesXrd || 0, 7)} XRD
        </span>
      </div>
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
    <div className="flex flex-col">
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
  // updates quote when any of the listed dependencies changes
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
    dispatch,
  ]);

  return (
    <>
      <OrderTypeTabs />

      <AvailableBalances />

      <div className="flex flex-row justify-between flex-wrap mb-3">
        <DirectionToggle />
        <AssetToggle />
      </div>

      {tab === OrderTab.MARKET ? <MarketOrderInput /> : <LimitOrderInput />}

      <Description />

      <SubmitButton />
    </>
  );
}
