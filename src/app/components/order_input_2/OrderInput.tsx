import { useEffect } from "react";

import { capitalizeFirstLetter } from "../../utils";

import { useAppDispatch, useAppSelector } from "hooks";

import { selectBalanceByAddress } from "state/orderInputSlice";

// import {
//   selectTargetToken,
//   submitOrder,
//   validatePriceInput,
//   validateSlippageInput,
// } from "state/orderInputSlice";
import { fetchBalances } from "state/pairSelectorSlice";
import { AiOutlineInfoCircle } from "react-icons/ai";

import { OrderSide, OrderTab, orderInputSlice } from "state/orderInputSlice";

const POST_ONLY_TOOLTIP =
  "Select 'POST ONLY' when you want your order to be added to the order book without matching existing orders. " +
  "If the order can be matched immediately, it will not be created. " +
  "This option helps ensure you receive the maker rebate.";

// function SubmitButton() {
//   const symbol = useAppSelector(selectTargetToken).symbol;
//   const tartgetToken = useAppSelector(selectTargetToken);

//   const {
//     tab,
//     side,
//     validationToken1,
//     validationToken2,
//     transactionInProgress,
//     transactionResult,
//   } = useAppSelector((state) => state.orderInput);

//   const dispatch = useAppDispatch();
//   const submitString = tab.toString() + " " + side.toString() + " " + symbol;

//   const isPriceValid = useAppSelector(validatePriceInput).valid;
//   const isSlippageValid = useAppSelector(validateSlippageInput).valid;
//   const isValidTransaction =
//     tartgetToken.amount !== "" &&
//     validationToken1.valid &&
//     validationToken2.valid &&
//     isPriceValid &&
//     isSlippageValid;

//   return (
//     <div className="flex flex-col w-full">
//       <button
//         className="flex-1 btn btn-accent"
//         disabled={!isValidTransaction || transactionInProgress}
//         onClick={() => dispatch(submitOrder())}
//       >
//         {transactionInProgress ? "Transaction in progress..." : submitString}
//       </button>
//       <div className="text-sm">{transactionResult}</div>
//     </div>
//   );
// }

interface OrderInputProps {
  label: string;
  currency?: string;
  secondaryLabel?: string;
  secondaryLabelValue?: number | string;
  available?: number;
  disabled?: boolean;
}

export function OrderInput() {
  const dispatch = useAppDispatch();
  const pairAddress = useAppSelector((state) => state.pairSelector.address);
  const type = useAppSelector((state) => state.orderInput.tab);

  useEffect(() => {
    dispatch(fetchBalances());
  }, [dispatch, pairAddress]);

  return (
    <div className="h-full flex flex-col text-base max-w-[400px] m-auto">
      <OrderSideTabs />
      <div className="p-[24px]">
        <OrderTypeTabs />
        <UserInputContainer />
        {type === "MARKET" && <EstimatedTotalOrQuantity />}
        <SubmitButton />
        {type === "MARKET" && <MarketOrderDisclaimer />}
        {type === "LIMIT" && <PostOnlyCheckbox />}
        <FeesTable />
        <FeesDisclaimer />
      </div>
    </div>
  );
}

function EstimatedTotalOrQuantity() {
  // TODO(dcts): calculate estimate
  return (
    <div className="flex content-between w-full text-white">
      <p className="grow text-left">Total:</p>
      <p className="">~ 1&apos;000&apos;000 XRD</p>
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
  const { side, token1, token2 } = useAppSelector((state) => state.orderInput);
  const currency = side === "BUY" ? token1.symbol : token2.symbol;

  // TODO(dcts): Get calculated fees from state
  const fees = {
    total: 0.0589 + 0.2 + 0.3,
    exchange: 0.0589,
    platform: 0.2,
    liquidity: 0.3,
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
            {value.toFixed(4)} {currency}{" "}
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
      <span className="my-auto text-white text-xs ">POST ONLY</span>
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
  const { side, tab, token2 } = useAppSelector((state) => state.orderInput);

  return (
    <button
      className={`w-full font-bold text-sm tracking-[.1px] min-h-[44px] p-3 my-6 ${
        side === "BUY"
          ? "bg-dexter-green  text-black "
          : "bg-dexter-red text-white "
      }`}
    >{`${tab} ${side} ${token2.symbol}`}</button>
  );
}

function UserInputContainer() {
  const { side, tab, token1, token2 } = useAppSelector(
    (state) => state.orderInput
  );
  const { bestBuy, bestSell } = useAppSelector((state) => state.orderBook);
  const [token1Balance, token2Balance] = useAppSelector((state) => {
    return [
      selectBalanceByAddress(state, token1.address),
      selectBalanceByAddress(state, token2.address),
    ];
  });

  if (tab === "MARKET") {
    // TODO(dcts): replace with actual data from wallet
    return (
      <div className="bg-base-100 px-5 pb-5 mb-6">
        <OrderInputElement label={"Price"} disabled={true} /> {/*market price*/}
        <OrderInputElement
          label={side === "BUY" ? "Total" : "Quantity"}
          secondaryLabel={"Available"}
          secondaryLabelValue={
            side === "BUY" ? token2Balance || 0 : token1Balance || 0
          }
          currency={side === "BUY" ? token2.symbol : token1.symbol}
        />
        <PercentageSlider />
      </div>
    );
  }
  if (tab === "LIMIT") {
    return (
      <div className="bg-base-100 px-5 pb-5 ">
        <OrderInputElement
          label={"Price"}
          currency={token2.symbol}
          secondaryLabel={`Best ${side.toLowerCase()}`}
          secondaryLabelValue={side === "BUY" ? bestBuy || 0 : bestSell || 0}
        />
        <OrderInputElement
          label={"Quantity"}
          currency={token1.symbol}
          secondaryLabel={`${side === "BUY" ? "" : "Available"}`}
          secondaryLabelValue={token1Balance || 0}
        />
        <PercentageSlider />
        <OrderInputElement
          label={"Total"}
          currency={token2.symbol}
          secondaryLabel={`${side === "SELL" ? "" : "Available"}`}
          secondaryLabelValue={token2Balance || 0}
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
}: OrderInputProps): JSX.Element | null {
  return (
    <>
      <div className="pt-5">
        <div className="w-full flex content-between">
          <p className="text-xs font-medium text-left opacity-50 pb-1 tracking-[0.5px] grow">
            {label}:
          </p>
          {secondaryLabel && (
            <p className="text-xs font-medium text-white underline mr-1 cursor-pointer tracking-[0.1px]">
              {secondaryLabel}: {secondaryLabelValue} {currency}
            </p>
          )}
        </div>
        <div
          className={`min-h-[44px] w-full content-between bg-base-200 flex ${
            disabled
              ? "relative"
              : "rounded-lg hover:outline hover:outline-1 hover:outline-white/50 "
          }`}
        >
          <input
            className={`text-sm grow w-full text-right pr-2 bg-base-200 ${
              disabled
                ? "rounded-md border-[1.5px] border-dashed border-[#768089]"
                : "rounded-l-md"
            }`}
            disabled={disabled}
            type="number"
          />
          {disabled ? (
            <div className="text-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#768089]">
              MARKET
            </div>
          ) : (
            <>
              <div className="text-sm shrink-0 bg-base-200 content-center items-center flex pl-2 pr-4 rounded-r-md">
                {currency}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function PercentageSlider() {
  return <></>;
}

function OrderTypeTabs() {
  const type = useAppSelector((state) => state.orderInput.tab);
  const dispatch = useAppDispatch();

  // TODO(dcts): make single component (DRYify code) and create 2 instances to reduce duplicate code
  return (
    <>
      <div className="min-h-[44px] flex justify-center">
        <div className="w-full">
          <div className="flex min-h-[44px]">
            <div
              className={`w-[50%] cursor-pointer hover:opacity-100 flex justify-center items-center ${
                type === "MARKET"
                  ? " bg-base-100 text-white"
                  : " bg-base-200 opacity-50"
              }`}
              onClick={() => {
                dispatch(
                  orderInputSlice.actions.setActiveTab(OrderTab["MARKET"])
                );
              }}
            >
              <p className="uppercase font-medium text-sm tracking-[.1px] select-none">
                Market
              </p>
            </div>
            <div
              className={`w-[50%] cursor-pointer hover:opacity-100 flex justify-center items-center ${
                type === "LIMIT"
                  ? " bg-base-100 text-white"
                  : " bg-base-200 opacity-50"
              }`}
              onClick={() => {
                dispatch(
                  orderInputSlice.actions.setActiveTab(OrderTab["LIMIT"])
                );
              }}
            >
              <p className="uppercase font-medium text-sm tracking-[.1px] select-none">
                Limit
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function OrderSideTabs() {
  const side = useAppSelector((state) => state.orderInput.side);
  const dispatch = useAppDispatch();

  // TODO(dcts): make single component (DRYify code) and create 2 instances to reduce duplicate code
  return (
    <>
      <div className="min-h-[44px] flex">
        <div
          className={`w-1/2 flex justify-center items-center cursor-pointer hover:opacity-100 ${
            side === "BUY" ? "bg-dexter-green text-content-dark" : "opacity-50"
          }`}
          onClick={() => {
            dispatch(orderInputSlice.actions.setSide(OrderSide["BUY"]));
          }}
        >
          <p className="font-bold text-sm tracking-[.1px] select-none">BUY</p>
        </div>
        <div
          className={`w-1/2 flex justify-center items-center cursor-pointer hover:opacity-100 ${
            side === "SELL" ? "bg-flashy-red-2 text-white" : "opacity-50"
          }`}
          onClick={() => {
            dispatch(orderInputSlice.actions.setSide(OrderSide["SELL"]));
          }}
        >
          <p className="font-bold text-sm tracking-[.1px] select-none">SELL</p>
        </div>
      </div>
    </>
  );
}
