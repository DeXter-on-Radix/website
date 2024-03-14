import { useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { IMaskInput } from "react-imask";
import {
  capitalizeFirstLetter,
  getLocaleSeparators,
  numberOrEmptyInput,
} from "../../utils";

import { useAppDispatch, useAppSelector } from "hooks";
import { fetchBalances } from "state/pairSelectorSlice";
import {
  OrderSide,
  OrderType,
  // fetchQuote,
  selectBalanceByAddress,
  orderInputSlice,
  // selectTargetToken,
  // submitOrder,
  // selectTargetToken,
  // validatePriceInput,
} from "state/orderInputSlice";

const POST_ONLY_TOOLTIP =
  "Select 'POST ONLY' when you want your order to be added to the order book without matching existing orders. " +
  "If the order can be matched immediately, it will not be created. " +
  "This option helps ensure you receive the maker rebate.";

interface OrderInputProps {
  label: string;
  currency?: string;
  secondaryLabel?: string;
  secondaryLabelValue?: number | string;
  available?: number;
  disabled?: boolean;
  // onFocus?: () => void;
  onAccept?: (value: any) => void;
  value?: number | "";
}

interface OrderTypeTabProps {
  orderType: OrderType;
}

interface OrderSideTabProps {
  orderSide: OrderSide;
}

interface CurrencyLabelProps {
  currency?: string;
}

interface OrderInputPrimaryLabelProps {
  label: string;
}

interface OrderInputSecondaryLabelProps {
  label?: string;
  currency?: string;
  labelValue?: number | string;
}

export function OrderInput() {
  // const state = useAppSelector((state) => state);
  const dispatch = useAppDispatch();
  const pairAddress = useAppSelector((state) => state.pairSelector.address);
  const {
    type,
    side,
    token1,
    token2,
    // validationToken1,
    // validationToken2,
    // description,
    specifiedToken,
    quote,
    price,
  } = useAppSelector((state) => state.orderInput);
  // const tartgetToken = useAppSelector(selectTargetToken);

  const showCurrentState = () => {
    let msg = `side = ${side}\n`;
    msg += `type = ${type}\n`;
    msg += `token1 (amount) = ${token1.symbol} [${token1.amount}]\n`;
    msg += `token2 (amount) = ${token2.symbol} [${token2.amount}]\n`;
    msg += `specifiedToken = ${specifiedToken}\n`;
    msg += `price = ${price}\n`;
    msg += `quote = ${quote}\n`;
    alert(msg);
  };

  useEffect(() => {
    dispatch(fetchBalances());
  }, [dispatch, pairAddress]);

  useEffect(() => {
    dispatch(orderInputSlice.actions.resetUserInput());
  }, [dispatch, side, type]);

  // useEffect(() => {
  //   if (
  //     tartgetToken.amount !== "" &&
  //     validationToken1.valid &&
  //     validationToken2.valid
  //   ) {
  //     dispatch(fetchQuote());
  //   }
  // }, [
  //   dispatch,
  //   pairAddress,
  //   token1,
  //   token2,
  //   side,
  //   type,
  //   tartgetToken,
  //   validationToken1.valid,
  //   validationToken2.valid,
  // ]);

  // useEffect(() => {
  //   console.log("quote");
  //   console.log(quote);
  //   console.log("description");
  //   console.log(description);
  // }, [quote, description]);

  // useEffect(() => {
  //   orderInputSlice.actions.swapTokens();
  // }, []);

  // useEffect(() => {
  //   console.log("SIDE CHANGED");
  //   dispatch(orderInputSlice.actions.resetUserInput());
  // }, [dispatch, side]);

  return (
    <div className="h-full flex flex-col text-base justify-center items-center">
      <OrderSideTabs />
      {/* INNER_CONTAINER_MAX_WIDTH */}
      <div className={`p-[24px] max-w-[380px] m-auto`}>
        <OrderTypeTabs />
        <UserInputContainer />
        <SubmitButton />
        {type === "MARKET" && (
          <>
            <EstimatedTotalOrQuantity />
            <MarketOrderDisclaimer />
          </>
        )}
        {type === "LIMIT" && <PostOnlyCheckbox />}
        <FeesTable />
        <FeesDisclaimer />
        <button onClick={showCurrentState}>DEBUG: show state</button>
      </div>
    </div>
  );
}

function EstimatedTotalOrQuantity() {
  const { quote } = useAppSelector((state) => state.orderInput);
  const amount = quote?.toAmount;
  const symbol = quote?.toToken.symbol;
  return (
    <div className="flex content-between w-full text-white">
      {amount && (
        <>
          <p className="grow text-left">Total:</p>
          <p className="">
            ~ {amount} {symbol}
          </p>
        </>
      )}
    </div>
  );
}

function MarketOrderDisclaimer() {
  return (
    <div className="">
      <p className="text-xs tracking-[0.5px] opacity-70 pb-6 border-b-[1px] border-b-[rgba(255,255,255,0.2)]">
        Displayed value is exact at quote time, may change on button press due
        market changes.
      </p>
    </div>
  );
}

function FeesDisclaimer() {
  return (
    <div className="">
      <p className="text-xs tracking-[0.5px] opacity-70 pb-6">
        Fees are paid in received currency. Total received amount already
        discounts fees.
      </p>
    </div>
  );
}

function FeesTable() {
  const { side, token1, token2, quote } = useAppSelector(
    (state) => state.orderInput
  );
  const currency = side === "BUY" ? token1.symbol : token2.symbol;
  const exchange = quote?.exchangeFees || 0;
  const platform = quote?.platformFees || 0;
  const liquidity = quote?.liquidityFees || 0;
  const fees = {
    total: (exchange + platform + liquidity).toFixed(4),
    exchange: exchange.toFixed(4),
    platform: platform.toFixed(4),
    liquidity: liquidity.toFixed(4),
  };

  return (
    <div className="my-4">
      {Object.entries(fees).map(([key, value], indx) => (
        <div
          className={`flex content-between w-full my-1 ${
            indx === 0 ? "text-white" : "text-secondary-content"
          }`}
          key={indx}
        >
          <p className="text-xs text-left grow">
            {capitalizeFirstLetter(key)} fee:
          </p>
          <p className="text-xs">
            {value} {currency}{" "}
          </p>
        </div>
      ))}
    </div>
  );
}

function PostOnlyCheckbox() {
  const dispatch = useAppDispatch();
  const { postOnly } = useAppSelector((state) => state.orderInput);

  return (
    <div className="flex justify-center ">
      <input
        checked={postOnly}
        type="checkbox"
        className="checkbox checkbox-xs my-auto mr-2 text-white"
        onChange={() => dispatch(orderInputSlice.actions.togglePostOnly())}
      />
      <span
        className="my-auto text-white text-xs cursor-pointer"
        onClick={() => dispatch(orderInputSlice.actions.togglePostOnly())}
      >
        POST ONLY
      </span>
      <div
        className="my-auto ml-2 tooltip text-3xl before:bg-base-300 z-10"
        data-tip={POST_ONLY_TOOLTIP}
      >
        <AiOutlineInfoCircle className="text-white text-sm" />
      </div>
    </div>
  );
}

function SubmitButton() {
  const { side, type, token2 } = useAppSelector((state) => state.orderInput);

  return (
    <button
      className={`w-full font-bold text-sm tracking-[.1px] min-h-[44px] p-3 my-6 ${
        side === "BUY"
          ? "bg-dexter-green  text-black "
          : "bg-dexter-red text-white "
      }`}
    >{`${type} ${side} ${token2.symbol}`}</button>
  );
}

function UserInputContainer() {
  const { side, type, price, token1, token2 } = useAppSelector(
    (state) => state.orderInput
  );
  const { bestBuy, bestSell } = useAppSelector((state) => state.orderBook);
  const [token1Balance, token2Balance] = useAppSelector((state) => {
    return [
      selectBalanceByAddress(state, token1.address),
      selectBalanceByAddress(state, token2.address),
    ];
  });
  const dispatch = useAppDispatch();

  if (type === "MARKET") {
    return (
      <div className="bg-base-100 px-5 pb-5 mb-6" key="market">
        <OrderInputElement label={"Price"} disabled={true} key="market-price" />
        <OrderInputElement
          label={side === "BUY" ? "Total" : "Quantity"}
          secondaryLabel={"Available"}
          secondaryLabelValue={
            side === "BUY"
              ? token2Balance?.toFixed(4) || 0
              : token1Balance?.toFixed(4) || 0
          }
          currency={side === "BUY" ? token2.symbol : token1.symbol}
          onAccept={(value) => {
            dispatch(orderInputSlice.actions.resetValidation());
            dispatch(
              orderInputSlice.actions[
                side === "BUY" ? "setAmountToken2" : "setAmountToken1"
              ](numberOrEmptyInput(value))
            );
          }}
          key={"market-" + side === "BUY" ? "total" : "quantity"}
          value={side === "BUY" ? token2.amount : token1.amount}
        />
        <PercentageSlider />
      </div>
    );
  }
  if (type === "LIMIT") {
    return (
      <div className="bg-base-100 px-5 pb-5 " key="limit">
        <OrderInputElement
          label={"Price"}
          currency={token2.symbol}
          secondaryLabel={`Best ${side.toLowerCase()}`}
          secondaryLabelValue={side === "BUY" ? bestBuy || 0 : bestSell || 0}
          key="limit-price"
          value={price}
          onAccept={(value) => {
            dispatch(orderInputSlice.actions.resetValidation());
            dispatch(
              orderInputSlice.actions.setPrice(numberOrEmptyInput(value))
            );
          }}
        />
        <OrderInputElement
          label={"Quantity"}
          currency={token1.symbol}
          secondaryLabel={`${side === "BUY" ? "" : "Available"}`}
          secondaryLabelValue={token1Balance?.toFixed(4) || 0}
          key="limit-quantity"
        />
        <PercentageSlider />
        <OrderInputElement
          label={"Total"}
          currency={token2.symbol}
          secondaryLabel={`${side === "SELL" ? "" : "Available"}`}
          secondaryLabelValue={token2Balance?.toFixed(4) || 0}
          key="limit-total"
        />
      </div>
    );
  }
  return <></>;
}

function OrderInputElement({
  label,
  currency,
  secondaryLabel,
  secondaryLabelValue,
  disabled = false,
  onAccept,
  value,
}: OrderInputProps): JSX.Element | null {
  const decimalSeparator = getLocaleSeparators().decimalSeparator;
  return (
    // Container with labels (left + right) and input field
    <div className="pt-5">
      <div className="w-full flex content-between">
        <OrderInputPrimaryLabel label={label} />{" "}
        <OrderInputSecondaryLabel
          label={secondaryLabel}
          labelValue={secondaryLabelValue}
        />
      </div>
      {/* Input field (left) + currency label (right) */}
      <div
        className={`min-h-[44px] w-full content-between bg-base-200 flex ${
          disabled
            ? "relative"
            : "rounded-lg hover:outline hover:outline-1 hover:outline-white/50 "
        }`}
      >
        <IMaskInput
          // scale={targetToken.decimals} // todo(dcts)
          // placeholder={"0.0"} // todo(dcts)
          // onFocus={onFocus} // todo(dcts)
          value={String(value)}
          disabled={disabled || false}
          min={0}
          mask={Number}
          unmask={"typed"}
          radix={decimalSeparator}
          className={`text-sm grow w-full text-right pr-2 bg-base-200 ${
            disabled
              ? "rounded-md border-[1.5px] border-dashed border-[#768089]"
              : "rounded-l-md"
          }`}
          onAccept={onAccept || (() => {})}
        ></IMaskInput>
        {/* If disabled, add "MARKET" text and dashed border and skip currency label */}
        {disabled && <FixedMarketPriceLabel />}
        {/* If not disabled, add a currency label next to the input */}
        {!disabled && <CurrencyLabel currency={currency} />}
      </div>
    </div>
  );
}

// Left Label: e.g. "Price", "Quantity", "Total"
function OrderInputPrimaryLabel({
  label,
}: OrderInputPrimaryLabelProps): JSX.Element | null {
  return (
    <p className="text-xs font-medium text-left opacity-50 pb-1 tracking-[0.5px] grow select-none">
      {label}:
    </p>
  );
}

// Right Label: e.g. "Best Buy/Sell Price" or "Available Balance". Can be empty as well
function OrderInputSecondaryLabel({
  label,
  labelValue,
  currency,
}: OrderInputSecondaryLabelProps): JSX.Element | null {
  return (
    <>
      {label && (
        <p className="text-xs font-medium text-white underline mr-1 cursor-pointer tracking-[0.1px]">
          {label}: {labelValue} {currency}
        </p>
      )}
    </>
  );
}

function FixedMarketPriceLabel() {
  return (
    <div className="text-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#768089] select-none">
      MARKET
    </div>
  );
}

function CurrencyLabel({ currency }: CurrencyLabelProps): JSX.Element | null {
  return (
    <div className="text-sm shrink-0 bg-base-200 content-center items-center flex pl-2 pr-4 rounded-r-md">
      {currency}
    </div>
  );
}

// TODO(dcts): implement percentage slider in future PR
function PercentageSlider() {
  return <></>;
}

function OrderTypeTabs() {
  return (
    <>
      <div className="min-h-[44px] flex justify-center">
        <div className="w-full">
          <div className="flex min-h-[44px]">
            {[OrderType.MARKET, OrderType.LIMIT].map((currentType, indx) => (
              <OrderTypeTab orderType={currentType} key={indx} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function OrderTypeTab({ orderType }: OrderTypeTabProps): JSX.Element | null {
  const type = useAppSelector((state) => state.orderInput.type);
  const dispatch = useAppDispatch();

  return (
    <div
      className={`w-[50%] cursor-pointer hover:opacity-100 flex justify-center items-center ${
        type === orderType.toString()
          ? " bg-base-100 text-white"
          : " bg-base-200 opacity-50"
      }`}
      onClick={() => {
        dispatch(orderInputSlice.actions.setOrderType(orderType));
      }}
    >
      <p className="uppercase font-medium text-sm tracking-[.1px] select-none">
        {orderType.toString()}
      </p>
    </div>
  );
}

function OrderSideTabs() {
  return (
    <div
      // OUTSIDE_CONTAINER_MAX_WIDTH
      className={`min-h-[44px] flex max-w-[450px] w-full`}
    >
      {[OrderSide.BUY, OrderSide.SELL].map((currentSide, indx) => (
        <OrderSideTab orderSide={currentSide} key={indx} />
      ))}
    </div>
  );
}

function OrderSideTab({ orderSide }: OrderSideTabProps): JSX.Element | null {
  const side = useAppSelector((state) => state.orderInput.side);
  const dispatch = useAppDispatch();

  return (
    <div
      className={`w-1/2 flex justify-center items-center cursor-pointer hover:opacity-100 ${
        side === "BUY" && orderSide === "BUY"
          ? "bg-dexter-green text-content-dark"
          : side === "SELL" && orderSide === "SELL"
          ? "bg-dexter-red text-white"
          : "opacity-50"
      }`}
      onClick={() => {
        dispatch(orderInputSlice.actions.setSide(orderSide));
      }}
    >
      <p className="font-bold text-sm tracking-[.1px] select-none">
        {orderSide}
      </p>
    </div>
  );
}
