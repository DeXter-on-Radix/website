import { useEffect, useState, ChangeEvent } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";

import {
  capitalizeFirstLetter,
  getPrecision,
  getLocaleSeparators,
  formatNumericString,
  truncateWithPrecision,
} from "../../utils";

import { useAppDispatch, useAppSelector, useTranslations } from "hooks";
import { fetchBalances } from "state/pairSelectorSlice";
import {
  OrderSide,
  OrderType,
  selectBalanceByAddress,
  orderInputSlice,
  UserAction,
  SpecifiedToken,
  ValidationResult,
  fetchQuote,
  noValidationErrors,
  // submitOrder,
} from "state/orderInputSlice";
import { Calculator } from "services/Calculator";

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
  inputValidation: ValidationResult;
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
  inputValidation: ValidationResult;
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
  const {
    type,
    side,
    token1,
    token2,
    price,
    specifiedToken,
    postOnly,
    validationPrice,
    validationToken1,
    validationToken2,
  } = useAppSelector((state) => state.orderInput);
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

  useEffect(() => {
    dispatch(fetchQuote());
  }, [dispatch, specifiedToken, token1, token2, price, side, type]);

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
            {[OrderType.MARKET, OrderType.LIMIT].map((type, indx) => (
              <OrderTypeTab orderType={type} key={indx} />
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
        type === orderType
          ? " bg-base-100 text-white"
          : " bg-base-200 opacity-50"
      } ${type === "MARKET" ? "rounded-tl" : "rounded-tr"}`}
      onClick={() => {
        dispatch(orderInputSlice.actions.setType(orderType));
      }}
    >
      <p className="uppercase font-medium text-sm tracking-[.1px] select-none">
        {orderType}
      </p>
    </div>
  );
}

function EstimatedTotalOrQuantity() {
  const { quote } = useAppSelector((state) => state.orderInput);
  const amount = quote?.toAmount;
  const symbol = quote?.toToken?.symbol;
  return (
    <div className="flex content-between w-full text-white pb-3 px-2">
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
  const { side, type, token1 } = useAppSelector((state) => state.orderInput);
  const handleSubmit = () => {
    alert("TODO");
  };
  return (
    <button
      className={`w-full font-bold text-sm tracking-[.1px] min-h-[44px] p-3 my-6 rounded ${
        side === "BUY"
          ? "bg-dexter-green text-black "
          : "bg-dexter-red text-white "
      }`}
      onClick={handleSubmit}
    >{`${type} ${side} ${token1.symbol}`}</button>
  );
}

function UserInputContainer() {
  const { side, type } = useAppSelector((state) => state.orderInput);

  const isMarketOrder = type === "MARKET";
  const isLimitOrder = type === "LIMIT";
  const isBuyOrder = side === "BUY";
  const isSellOrder = side === "SELL";

  return (
    <div className="bg-base-100 px-5 pb-5 rounded-b">
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
  const {
    side,
    type,
    token1,
    token2,
    price,
    specifiedToken,
    validationPrice,
    validationToken1,
    validationToken2,
  } = useAppSelector((state) => state.orderInput);
  const balanceToken1 =
    useAppSelector((state) => selectBalanceByAddress(state, token1.address)) ||
    0;
  const balanceToken2 =
    useAppSelector((state) => selectBalanceByAddress(state, token2.address)) ||
    0;
  const bestBuy = useAppSelector((state) => state.orderBook.bestBuy) || 0;
  const bestSell = useAppSelector((state) => state.orderBook.bestSell) || 0;

  const updateToken1 = (value: number) => {
    dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: value,
        bestBuy,
        bestSell,
        balanceToken1: balanceToken1,
        balanceToken2: balanceToken2,
        specifiedToken: SpecifiedToken.TOKEN_1,
      })
    );
  };

  const updateToken2 = (value: number) => {
    dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: value,
        bestBuy,
        bestSell,
        balanceToken1: balanceToken1,
        balanceToken2: balanceToken2,
        specifiedToken: SpecifiedToken.TOKEN_2,
      })
    );
  };

  const updatePrice = (value: number) => {
    dispatch(
      orderInputSlice.actions.setPrice({
        price: value,
        balanceToken1: balanceToken1,
        balanceToken2: balanceToken2,
      })
    );
  };

  let token1amount = token1.amount;
  let token2amount = token2.amount;
  // For limit orders, tokens that are not specified are derived using price
  // Note: this is only done for display, the state of these tokens will not be set.
  if (type === "LIMIT") {
    if (specifiedToken === SpecifiedToken.TOKEN_1 && token1amount >= 0) {
      token2amount = Calculator.multiply(token1.amount, price);
    }
    if (specifiedToken === SpecifiedToken.TOKEN_2) {
      token1amount = price <= 0 ? 0 : Calculator.divide(token2.amount, price);
    }
  }

  const configMap: { [key in UserAction]: CurrencyInputGroupConfig } = {
    SET_TOKEN_1: {
      label: "Quantity",
      currency: token1.symbol,
      value: token1amount,
      updateValue: updateToken1,
      inputValidation: validationToken1,
      secondaryLabelProps: {
        disabled: side === "BUY", // hide token1 balance for BUY
        label: "Available",
        currency: token1.symbol,
        value: truncateWithPrecision(balanceToken1, 8), // TODO(dcts): use coin-decimals
        updateValue: updateToken1,
      },
    },
    SET_TOKEN_2: {
      label: "Total",
      currency: token2.symbol,
      value: token2amount,
      updateValue: updateToken2,
      inputValidation: validationToken2,
      secondaryLabelProps: {
        disabled: side === "SELL", // hide token2 balance for SELL
        label: "Available",
        currency: token2.symbol,
        value: truncateWithPrecision(balanceToken2, 8), // TODO(dcts): use coin-decimals
        updateValue: updateToken2,
      },
    },
    UPDATE_PRICE: {
      label: "Price",
      currency: token2.symbol,
      value: price,
      updateValue: updatePrice,
      inputValidation: validationPrice,
      secondaryLabelProps: {
        disabled: currencyInputGroupDisabled, // hide if currencyInput is disabled (e.g. for market price)
        label: `Best ${side.toLowerCase()}`,
        currency: token2.symbol,
        value: truncateWithPrecision(side === "BUY" ? bestBuy : bestSell, 8), // TODO(dcts): use coin-decimals
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
  const {
    label,
    currency,
    value,
    updateValue,
    inputValidation,
    secondaryLabelProps,
  } = CurrencyInputGroupSettings(userAction, disabled);

  const isMarketOrder = type === "MARKET";
  const isUserActionUpdatePrice = userAction === "UPDATE_PRICE";
  return (
    <div className="pt-5 relative">
      {!inputValidation.valid && (
        <InputTooltip message={inputValidation.message} />
      )}
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
          inputValidation={inputValidation}
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
  inputValidation,
}: CurrencyInputProps): JSX.Element | null {
  const { decimalSeparator } = getLocaleSeparators();
  const scale = 8; // TODO(dcts): use token specific decimals
  return (
    <>
      <div
        className={`min-h-[44px] w-full content-between bg-base-200 flex rounded-lg ${
          inputValidation.valid
            ? "hover:outline hover:outline-1 hover:outline-white/50"
            : "border-2 border-red-500"
        }`}
      >
        {/* UserInput */}
        <CustomNumericIMask
          value={value}
          separator={decimalSeparator}
          scale={scale}
          onAccept={updateValue}
          className="text-sm grow w-full text-right pr-2 bg-base-200 rounded-lg"
        />
        {/* CurrencyLabel */}
        <div className="text-sm shrink-0 bg-base-200 content-center items-center flex pl-2 pr-4 rounded-r-md">
          {currency}
        </div>
      </div>
    </>
  );
}

function InputTooltip({ message }: { message: string }) {
  const t = useTranslations();
  return (
    <div className="absolute bottom-[-20px] z-10 right-0 p-1">
      <p className="text-xs tracking-[0.5px] truncate text-red-500 text-center">
        {t(message)}
      </p>
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
  const [inputValue, setInputValue] = useState(value.toString());

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    // Automatically convert "," to "."
    value = value.replace(/,/g, separator).replace(/-/g, "");
    if (value.startsWith(".") || value.startsWith(",")) {
      value = value.substring(1, value.length);
    }
    if (value === "") {
      // If the input is cleared, set the internal state to an empty string
      // and reset token amount state to 0
      setInputValue("");
      onAccept(-1);
      return; // Exit early as there's no further processing needed
    }
    const formattedValue = formatNumericString(value, separator, scale);
    setInputValue(formattedValue);
    // Regex that limits precision to defined "scale" and allows a single
    // dot between digits or at the very end
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
      value={inputValue === "-1" ? "" : inputValue}
      onChange={handleChange}
      className={className} // Add TailwindCSS classes here
    />
  );
}
