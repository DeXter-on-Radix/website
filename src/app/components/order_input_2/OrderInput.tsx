import { useEffect, useState, ChangeEvent } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";

import {
  capitalizeFirstLetter,
  getPrecision,
  getLocaleSeparators,
  formatNumericString,
} from "../../utils";

import { useAppDispatch, useAppSelector } from "hooks";
import { fetchBalances } from "state/pairSelectorSlice";
import {
  OrderSide,
  OrderType,
  selectBalanceByAddress,
  orderInputSlice,
  UserAction,
  // validatePriceInput,
  // fetchQuote,
  // submitOrder,
} from "state/orderInputSlice";

const POST_ONLY_TOOLTIP =
  "Select 'POST ONLY' when you want your order to be added to the order book without matching existing orders. " +
  "If the order can be matched immediately, it will not be created. " +
  "This option helps ensure you receive the maker rebate.";

interface OrderTypeTabProps {
  orderType: OrderType;
}

interface OrderSideTabProps {
  orderSide: OrderSide;
}

interface CurrencyInputGroupProps {
  disabled?: boolean; // for price input
  userAction: UserAction; // user can set price, token1, token2
}

// Config representing each user action, derived from CurrencyInputGroupProps
interface CurrencyInputGroupConfig {
  label: string;
  currency: string;
  value: number;
  updateValue: (value: number) => void;
  secondaryLabelProps: SecondaryLabelProps;
}

interface CustomNumericIMaskProps {
  value: number;
  separator: string;
  scale: number;
  className: string;
  onAccept: (value: number) => void;
}

interface CurrencyInputProps {
  currency: string;
  value: number;
  updateValue: (value: number) => void;
}

interface LabelProps {
  label: string;
}

interface SecondaryLabelProps {
  disabled: boolean;
  label: string;
  currency: string;
  value: number;
  updateValue: (value: number) => void;
}

interface DisabledInputFieldProps {
  label: string;
}

export function OrderInput() {
  const dispatch = useAppDispatch();
  const pairAddress = useAppSelector((state) => state.pairSelector.address);
  const { type, side, price, token1, token2 } = useAppSelector(
    (state) => state.orderInput
  );
  // const { lastPrice } = useAppSelector((state) => state.priceInfo);

  // for better readibility
  const isMarketOrder = type === "MARKET";
  const isLimitOrder = type === "LIMIT";
  // const priceIsNull = price === 0;

  useEffect(() => {
    dispatch(fetchBalances());
  }, [dispatch, pairAddress]);

  useEffect(() => {
    dispatch(orderInputSlice.actions.resetUserInput());
  }, [dispatch, side, type]);

  // // Couple price/quantity/total for limit orders
  // const token1amount = token1.amount;
  // const token2amount = token2.amount;
  // useEffect(() => {
  //   if (
  //     isLimitOrder &&
  //     priceIsNull &&
  //     (token1amount !== 0 || token2amount !== 0)
  //   ) {
  //     dispatch(orderInputSlice.actions.setPrice(lastPrice));
  //   }
  //   //   - set PRICE
  //   //   - set total:
  //   //     - if BUY: quantity should be set
  //   //     - if SELL: quantity should be set + WARN if not enough
  //   //   - set quantity:
  //   //     - if BUY: total should be set + WARN if not enough
  //   //     - if SELL: total should be set
  //   // - once all is set
  //   //   - set price:
  //   //     - if quantity (token1) was specified -> adapt total (token2)
  //   //     - if total (token2) was specified -> adapt quantity (token1)
  //   //   - set quantity (token1) -> same as "set PRICE -> set quantity"
  //   //   - set total (token2) -> same as "set PRICE -> set total"
  // }, [token1amount, token2amount]);

  return (
    <div className="h-full flex flex-col text-base justify-center items-center">
      <OrderSideTabs />
      {/* INNER_CONTAINER_MAX_WIDTH */}
      <div className={`p-[24px] max-w-[350px] m-auto`}>
        <OrderTypeTabs />
        <UserInputContainer />
        <SubmitButton />
        {isMarketOrder && (
          <>
            <EstimatedTotalOrQuantity />
            <MarketOrderDisclaimer />
          </>
        )}
        {isLimitOrder && <PostOnlyCheckbox />}
        <FeesTable />
        <FeesDisclaimer />
      </div>
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
        dispatch(orderInputSlice.actions.resetUserInput());
        dispatch(orderInputSlice.actions.setSide(orderSide));
      }}
    >
      <p className="font-bold text-sm tracking-[.1px] select-none">
        {orderSide}
      </p>
    </div>
  );
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
  const handleSubmit = () => {
    alert("TODO");
  };
  return (
    <button
      className={`w-full font-bold text-sm tracking-[.1px] min-h-[44px] p-3 my-6 ${
        side === "BUY"
          ? "bg-dexter-green  text-black "
          : "bg-dexter-red text-white "
      }`}
      onClick={handleSubmit}
    >{`${type} ${side} ${token2.symbol}`}</button>
  );
}

function UserInputContainer() {
  const { side, type } = useAppSelector((state) => state.orderInput);

  const isMarketOrder = type === "MARKET";
  const isLimitOrder = type === "LIMIT";
  const isBuyOrder = side === "BUY";
  const isSellOrder = side === "SELL";

  return (
    <div className="bg-base-100 px-5 pb-5">
      {isMarketOrder && (
        <>
          <CurrencyInputGroup
            userAction={UserAction.UPDATE_PRICE}
            disabled={true}
          />
          <PercentageSlider />
          {isSellOrder && ( // specify "Quantity"
            <CurrencyInputGroup userAction={UserAction.SET_TOKEN_1} />
          )}
          {isBuyOrder && ( // specify "Total"
            <CurrencyInputGroup userAction={UserAction.SET_TOKEN_2} />
          )}
        </>
      )}
      {isLimitOrder && (
        <>
          <CurrencyInputGroup userAction={UserAction.UPDATE_PRICE} />
          <CurrencyInputGroup userAction={UserAction.SET_TOKEN_1} />
          <PercentageSlider />
          <CurrencyInputGroup userAction={UserAction.SET_TOKEN_2} />
        </>
      )}
    </div>
  );
}

// Helper function that get config for each possible userAction
// (SET_TOKEN_1, SET_TOKEN_2, UPDATE_PRICE)
function CurrencyInputGroupSettings(
  userAction: UserAction,
  currencyInputGroupDisabled: boolean
): CurrencyInputGroupConfig {
  const dispatch = useAppDispatch();
  const { side, token1, token2, price } = useAppSelector(
    (state) => state.orderInput
  );
  const token1Balance =
    useAppSelector((state) => selectBalanceByAddress(state, token1.address)) ||
    0;
  const token2Balance =
    useAppSelector((state) => selectBalanceByAddress(state, token2.address)) ||
    0;
  const bestBuyPrice = useAppSelector((state) => state.orderBook.bestBuy) || 0;
  const bestSellPrice =
    useAppSelector((state) => state.orderBook.bestSell) || 0;

  const updateToken1 = (value: number) => {
    dispatch(orderInputSlice.actions.setAmountToken1(value));
  };

  const updateToken2 = (value: number) => {
    dispatch(orderInputSlice.actions.setAmountToken2(value));
  };

  const updatePrice = (value: number) => {
    dispatch(orderInputSlice.actions.setPrice(value));
  };

  const configMap: { [key in UserAction]: CurrencyInputGroupConfig } = {
    SET_TOKEN_1: {
      label: "Quantity",
      currency: token1.symbol,
      value: token1.amount,
      updateValue: updateToken1,
      secondaryLabelProps: {
        disabled: side === "BUY", // hide token1 balance for BUY
        label: "Available",
        currency: token1.symbol,
        value: token1Balance,
        updateValue: updateToken1,
      },
    },
    SET_TOKEN_2: {
      label: "Total",
      currency: token2.symbol,
      value: token2.amount,
      updateValue: updateToken2,
      secondaryLabelProps: {
        disabled: side === "SELL", // hide token2 balance for SELL
        label: "Available",
        currency: token2.symbol,
        value: token2Balance,
        updateValue: updateToken2,
      },
    },
    UPDATE_PRICE: {
      label: "Price",
      currency: token2.symbol,
      value: price,
      updateValue: updatePrice,
      secondaryLabelProps: {
        disabled: currencyInputGroupDisabled, // hide if currencyInput is disabled (e.g. for market price)
        label: `Best ${side.toLowerCase()}`,
        currency: token2.symbol,
        value: side === "BUY" ? bestBuyPrice : bestSellPrice,
        updateValue: updatePrice,
      },
    },
  };

  return configMap[userAction];
}

// Container with labels (left + right) and input field
function CurrencyInputGroup({
  disabled = false,
  userAction,
}: CurrencyInputGroupProps): JSX.Element | null {
  const { type } = useAppSelector((state) => state.orderInput);
  const { label, currency, value, updateValue, secondaryLabelProps } =
    CurrencyInputGroupSettings(userAction, disabled);

  const isMarketOrder = type === "MARKET";
  const isUserActionUpdatePrice = userAction === "UPDATE_PRICE";
  return (
    <div className="pt-5">
      <div className="w-full flex content-between">
        <Label label={label} />
        <SecondaryLabel {...secondaryLabelProps} />
      </div>
      {/* conditionally show disabled MARKET price label */}
      {isMarketOrder && isUserActionUpdatePrice ? (
        <DisabledInputField label="MARKET" />
      ) : (
        <CurrencyInput
          currency={currency}
          value={value}
          updateValue={updateValue}
        />
      )}
    </div>
  );
}

function Label({ label }: LabelProps): JSX.Element | null {
  return (
    <p className="text-xs font-medium text-left opacity-50 pb-1 tracking-[0.5px] grow select-none">
      {label}:
    </p>
  );
}

// Right Label: e.g. "Best Buy/Sell Price" or "Available Balance".
// Can be empty/disabled (e.g. Market Price)
function SecondaryLabel({
  disabled,
  label,
  currency,
  value,
  updateValue,
}: SecondaryLabelProps): JSX.Element | null {
  return disabled ? (
    <></>
  ) : (
    <p
      className="text-xs font-medium text-white underline mr-1 cursor-pointer tracking-[0.1px]"
      onClick={() => updateValue(value)}
    >
      {label}: {value === 0 ? 0 : value.toFixed(getPrecision(currency))}{" "}
      {currency}
    </p>
  );
}

function DisabledInputField({
  label,
}: DisabledInputFieldProps): JSX.Element | null {
  return (
    <div className="min-h-[44px] w-full content-between bg-base-200 flex relative rounded-lg border-[1.5px] border-dashed border-[#768089]">
      <div className="text-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#768089] select-none">
        {label}
      </div>
    </div>
  );
}

function CurrencyInput({
  currency,
  value,
  updateValue,
}: CurrencyInputProps): JSX.Element | null {
  const { decimalSeparator } = getLocaleSeparators();
  return (
    <div className="min-h-[44px] w-full content-between bg-base-200 flex rounded-lg hover:outline hover:outline-1 hover:outline-white/50 ">
      {/* UserInput */}
      <CustomNumericIMask
        value={value}
        separator={decimalSeparator}
        scale={8}
        onAccept={updateValue}
        className="text-sm grow w-full text-right pr-2 bg-base-200 rounded-lg"
      />
      {/* CurrencyLabel */}
      <div className="text-sm shrink-0 bg-base-200 content-center items-center flex pl-2 pr-4 rounded-r-md">
        {currency}
      </div>
    </div>
  );
}

// TODO(dcts): implement percentage slider in future PR
function PercentageSlider() {
  return <></>;
}

// Mimics IMask with improved onAccept, triggered only by user input to avoid rerender bugs.
function CustomNumericIMask({
  value,
  separator,
  scale,
  onAccept,
  className,
}: CustomNumericIMaskProps): JSX.Element | null {
  // Format the input value according to the separator and scale props
  const cutoffValue = formatNumericString(value.toString(), separator, scale);
  if (cutoffValue !== value.toString()) {
    onAccept(Number(cutoffValue)); // cutoff the actual value as well
  }
  const [inputValue, setInputValue] = useState(cutoffValue);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    // Automatically convert "," to "." for internal processing
    value = value.replace(/,/g, ".");
    if (value === "") {
      // If the input is cleared, set the internal state to an empty string and call onAccept with null or 0
      setInputValue("");
      onAccept(0); // or onAccept(0), depending on the expected behavior
      return; // Exit early as there's no further processing needed
    }
    const formattedValue = formatNumericString(value, separator, scale);
    setInputValue(formattedValue);
    // Use the updated regex checks as before
    const regexForAccept = new RegExp(`^\\d+(\\.\\d{1,${scale}})?$`);
    if (regexForAccept.test(formattedValue)) {
      onAccept(parseFloat(formattedValue));
    }
  };

  // Update local state when the prop value changes
  useEffect(() => {
    setInputValue(formatNumericString(value.toString(), separator, scale));
  }, [value, separator, scale]);

  return (
    <input
      type="text"
      value={inputValue === "0" ? "" : inputValue}
      onChange={handleChange}
      className={className} // Add TailwindCSS classes here
    />
  );
}