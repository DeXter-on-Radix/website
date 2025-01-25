"use client";
import {
  useAppSelector,
  useAppDispatch,
  useTranslations,
  useHydrationErrorFix,
} from "hooks";
import { useState, useEffect, ChangeEvent } from "react";
import { StakeType, AssetToStake, stakeSlice } from "state/stakeSlice";
import {
  orderInputSlice,
  selectBalanceByAddress,
  SpecifiedToken,
  submitOrder,
  tokenIsSpecified,
  priceIsValid,
  fetchQuote,
  pairAddressIsSet,
} from "state/orderInputSlice";
import {
  getLocaleSeparators,
  formatNumericString,
  truncateWithPrecision,
  getPrecision,
} from "utils";
import { Calculator } from "services/Calculator";
import { DexterToast } from "components/DexterToaster";
import { fetchBalances } from "state/pairSelectorSlice";
import { AiOutlineInfoCircle } from "react-icons/ai";
import carotUp from "/public/carot-up.svg";
import Image from "next/image";
import { DexterButton } from "components/DexterButton";

interface AssetTabProps {
  asset: AssetToStake;
  //DEXTR or XRD;
}

interface StakeTypeTabProps {
  stakeType: StakeType;
  //Stake or Unstake
}

interface CurrencyInputProps {
  currency: string;
  value: number;
  updateValue: (value: number) => void;
  inputValidation: ValidationResult;
}

interface CurrencyInputGroupProps {
  disabled?: boolean; // for price input
  userAction: UserAction; // user can set price, token1, token2
}

interface CurrencyInputGroupConfig {
  label: string;
  currency: string;
  value: number;
  updateValue: (value: number) => void;
  inputValidation: ValidationResult;
  secondaryLabelProps: SecondaryLabelProps;
}

interface SecondaryLabelProps {
  disabled: boolean;
  label: string;
  currency: string;
  value: number;
  userAction: UserAction;
  updateValue?: (value: number) => void;
  setPercentageValue?: (percentage: number, isXRD: boolean) => void;
}

export enum UserAction {
  UPDATE_PRICE = "UPDATE_PRICE",
  SET_TOKEN_1 = "SET_TOKEN_1",
  // SET_TOKEN_2 = "SET_TOKEN_2",
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

interface CustomNumericIMaskProps {
  value: number;
  separator: string;
  scale: number;
  className: string;
  onAccept: (value: number) => void;
}

// interface DisabledInputFieldProps {
//   label: string;
// }

export default function Stake() {
  const pairAddress = useAppSelector((state) => state.pairSelector.address);
  const { walletData } = useAppSelector((state) => state.radix);
  const { type, token1, token2, price, specifiedToken } = useAppSelector(
    (state) => state.orderInput
  );
  const { asset } = useAppSelector((state) => state.stakeSlice);
  const dispatch = useAppDispatch();

  // const isDexter = asset === "DEXTR";

  useEffect(() => {
    dispatch(fetchBalances());
  }, [dispatch, pairAddress]);

  useEffect(() => {
    dispatch(orderInputSlice.actions.resetUserInput());
  }, [dispatch, asset, type]);

  useEffect(() => {
    dispatch(fetchBalances());
    dispatch(orderInputSlice.actions.resetUserInput());
  }, [dispatch, walletData]);

  useEffect(() => {
    if (
      pairAddressIsSet(pairAddress) &&
      priceIsValid(price, type) &&
      tokenIsSpecified(specifiedToken)
    ) {
      dispatch(fetchQuote());
    }
  }, [
    dispatch,
    specifiedToken,
    token1,
    token2,
    price,
    asset,
    type,
    pairAddress,
  ]);

  const stakingPosition = [
    { label: "APY", value: "1000 XRD" },
    { label: "Total value locked", value: "2025-01-01" },
    { label: "Your position", value: "2025-01-31" },
  ];

  return (
    <div className="bg-dexter-grey-dark">
      <div className="max-w-screen-md mx-auto py-10">
        <div className="flex flex-row mb-8 justify-between">
          <div className="flex flex-col my-auto">
            <h1
              className="!m-0 !mb-8 text-5xl text-md bg-gradient-to-r
      from-dexter-gradient-blue to-dexter-gradient-green to-45% bg-clip-text
      text-transparent font-normal text-left justify-left"
            >
              Stake
            </h1>
            <p className="text-sm flex-wrap">
              Delegate your XRD to our Validator to earn
              <span className="block"></span>DEXTR Stake DEXTR tokens to earn
              trading fees.
            </p>
          </div>
          <img
            src="/landing/sections/staking-safe.png"
            alt="staking safe"
            className="w-[300px] h-[300px] transform"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
        <div className="h-full w-full flex flex-col text-base">
          <div className="bg-dexter-grey-dark">
            <AssetToStakeTabs />
            <div className="border-[1px] border-dexter-grey-light">
              <div className="flex flex-row justify-between mx-14 mt-10 items-center">
                {stakingPosition.map((key) => (
                  <div className="key={index}">
                    {key.label === "Your position" ? (
                      <div className="bg-dexter-grey-light px-4 py-1">
                        <p className="text-xxs text-[#768089]">{key.label}</p>
                        <p className="text-lg">{key.value}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xxs text-[#768089]">{key.label}</p>
                        <p className="text-lg">{key.value}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-dexter-grey-light mx-12 my-8">
                <StakeTypeTabs />
                <UserInputContainer />
                <SubmitButton />
                <p className="flex justify-center text-xxs text-white items-center pt-3 pb-6 underline cursor-pointer">
                  <a href="https://stokenet-dashboard.radixdlt.com/">
                    Or delegate to our node using Radix Dashboard
                  </a>
                </p>
              </div>
              <Unstaking />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssetToStakeTabs() {
  const [currentAsset, setCurrentAsset] = useState(AssetToStake.DEXTR);

  return (
    <div className="w-full">
      <div className="flex flex-row border-[1px] border-dexter-grey-light rounded-sm">
        {[AssetToStake.DEXTR, AssetToStake.XRD].map((assetToStake, indx) => {
          const isActive = assetToStake === currentAsset;
          return (
            <div
              key={indx}
              className={`text-base py-3 w-[500px] flex justify-center mx-auto ${
                isActive ? "text-base-content bg-dexter-grey-light" : ""
              } cursor-pointer`}
              // onClick={() => setCurrentAsset(assetToStake)}
            >
              <AssetToStakeTab asset={assetToStake} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssetToStakeTab({ asset }: AssetTabProps): JSX.Element | null {
  const dispatch = useAppDispatch();

  return (
    <div
      className="flex justify-center items-center cursor-pointer uppercase font-light"
      onClick={() => {
        dispatch(stakeSlice.actions.setAsset(asset));

        if (asset === "XRD") {
          window.open(
            "https://dashboard.radixdlt.com/network-staking/validator_rdx1s0sr7xsr286jwffkkcwz8ffnkjlhc7h594xk5gvamtr8xqxr23a99a"
          );
        }
      }}
    >
      <p className="text-xl tracking-[.1px] select-none uppercase">
        {asset} Staking
      </p>
    </div>
  );
}

function StakeTypeTabs() {
  const [currentType, setCurrentType] = useState(StakeType.STAKE);

  return (
    <>
      <div className="flex flex-row justify-evenly">
        {[StakeType.STAKE, StakeType.UNSTAKE].map((stakeType, indx) => {
          const isActive = stakeType === currentType;
          return (
            <div
              key={indx}
              className={`text-base py-3 w-[500px] flex justify-center mx-auto ${
                isActive
                  ? "text-base-content"
                  : "text-dexter-grey-inactive bg-[#17181a]"
              } cursor-pointer`}
              onClick={() => setCurrentType(stakeType)}
            >
              <StakeTypeTab stakeType={stakeType} />
            </div>
          );
        })}
      </div>
    </>
  );
}

function StakeTypeTab({ stakeType }: StakeTypeTabProps): JSX.Element | null {
  // const type = useAppSelector((state) => state.orderInput.type);
  const type = useAppSelector((state) => state.stakeSlice.type);
  const dispatch = useAppDispatch();

  return (
    <div
      className="w-[50%] cursor-pointer hover:opacity-100 flex justify-center items-center"
      // onClick={() => {
      //   dispatch(orderInputSlice.actions.setType(orderType));
      // }}
      onClick={() => {
        dispatch(stakeSlice.actions.setType(type));
      }}
    >
      <p className="uppercase font-bold text-sm tracking-[.1px] select-none">
        {stakeType}
      </p>
    </div>
  );
}

function UserInputContainer() {
  const { asset, type } = useAppSelector((state) => state.stakeSlice);
  const dispatch = useAppDispatch();
  const { isConnected } = useAppSelector((state) => state.radix);

  useEffect(() => {
    if (isConnected) {
      dispatch(fetchBalances());
    }
  }, [isConnected, dispatch]);

  const isDextrStaking = asset === AssetToStake.DEXTR;
  const isStake = type === StakeType.STAKE;
  const isUnstake = type === StakeType.UNSTAKE;

  return (
    <div className="bg-dexter-grey-light px-5 pb-5 rounded-b">
      {isStake && (
        <>
          {/* <PercentageSlider /> */}
          {isDextrStaking && ( // specify "Quantity"
            <CurrencyInputGroup userAction={UserAction.SET_TOKEN_1} />
          )}
          {/* {isXrdStaking && ( // specify "Total"
            <CurrencyInputGroup userAction={UserAction.SET_TOKEN_2} />
          )} */}
        </>
      )}
      {isUnstake && (
        <>
          <CurrencyInputGroup userAction={UserAction.UPDATE_PRICE} />
          <CurrencyInputGroup userAction={UserAction.SET_TOKEN_1} />
          {/* <CurrencyInputGroup userAction={UserAction.SET_TOKEN_2} /> */}
          {/* {isLimitOrder && <PostOnlyCheckbox />} */}
        </>
      )}
    </div>
  );
}

function CurrencyInputGroup({
  disabled = false,
  userAction,
}: CurrencyInputGroupProps): JSX.Element | null {
  const t = useTranslations();
  const { type } = useAppSelector((state) => state.stakeSlice);
  const {
    label,
    currency,
    value,
    updateValue,
    inputValidation,
    secondaryLabelProps,
  } = CurrencyInputGroupSettings(userAction, disabled);

  const isStake = type === "STAKE";
  const isUserActionUpdatePrice = userAction === "UPDATE_PRICE";
  return (
    <div className="pt-5 relative">
      {/* {!inputValidation.valid && (
        <InputTooltip message={inputValidation.message} />
      )} */}
      <div className="w-full flex content-between">
        <Label label={label} />
        <SecondaryLabel {...secondaryLabelProps} />
      </div>
      <CurrencyInput
        currency={currency}
        value={value}
        updateValue={updateValue}
        inputValidation={inputValidation}
      />
    </div>
  );
}

function CurrencyInputGroupSettings(
  userAction: UserAction,
  currencyInputGroupDisabled: boolean
): CurrencyInputGroupConfig {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const {
    side,
    token1,
    // token2,
    price,
    // specifiedToken,
    validationPrice,
    validationToken1,
    // validationToken2,
  } = useAppSelector((state) => state.orderInput);

  const { asset } = useAppSelector((state) => state.stakeSlice);

  const balanceToken1 =
    useAppSelector((state) => selectBalanceByAddress(state, token1.address)) ||
    0;

  console.log(balanceToken1);

  // const balanceToken2 =
  //   useAppSelector((state) => selectBalanceByAddress(state, token2.address)) ||
  //   0;
  const bestBuy = useAppSelector((state) => state.orderBook.bestBuy) || 0;
  const bestSell = useAppSelector((state) => state.orderBook.bestSell) || 0;

  const updateToken1 = (value: number) => {
    dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: value,
        bestBuy,
        bestSell,
        balanceToken1: balanceToken1,
        // balanceToken2: balanceToken2,
        specifiedToken: SpecifiedToken.TOKEN_1,
      })
    );
  };

  // const updateToken2 = (value: number) => {
  //   dispatch(
  //     orderInputSlice.actions.setTokenAmount({
  //       amount: value,
  //       bestBuy,
  //       bestSell,
  //       balanceToken1: balanceToken1,
  //       // balanceToken2: balanceToken2,
  //       specifiedToken: SpecifiedToken.TOKEN_2,
  //     })
  //   );
  // };

  // Specifies the amount in % of available balance; If the token to specify is
  // XRD we substract a fee allowance to ensure the user has enough XRD left
  // to pay for transaction fees.
  const setPercentageAmountToken1 = (percentage: number, isXRD: boolean) => {
    if (balanceToken1 <= 0 || percentage < 0 || percentage > 100) {
      return;
    }
    const targetAmount = Math.min(
      balanceToken1,
      Calculator.divide(Calculator.multiply(balanceToken1, percentage), 100)
    );
    // TODO: revert truncating to 8th decimal once adex has fixed adex.createExchangeOrderTx bug
    const targetAmountTruncated = truncateWithPrecision(targetAmount, 8);
    dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: targetAmountTruncated,
        bestBuy,
        bestSell,
        balanceToken1: balanceToken1,
        // balanceToken2: balanceToken2,
        specifiedToken: SpecifiedToken.TOKEN_1,
      })
    );
  };

  // Specifies the amount in % of available balance; If the token to specify is
  // XRD we substract a fee allowance to ensure the user has enough XRD left
  // to pay for transaction fees.
  // const setPercentageAmountToken2 = (percentage: number, isXRD: boolean) => {
  //   if (balanceToken2 <= 0 || percentage < 0 || percentage > 100) {
  //     return;
  //   }
  //   const targetAmount = Math.min(
  //     isXRD ? balanceToken2 - XRD_FEE_ALLOWANCE : balanceToken2,
  //     Calculator.divide(Calculator.multiply(balanceToken2, percentage), 100)
  //   );
  //   // TODO: revert truncating to 8th decimal once adex has fixed adex.createExchangeOrderTx bug
  //   const targetAmountTruncated = truncateWithPrecision(targetAmount, 8);
  //   dispatch(
  //     orderInputSlice.actions.setTokenAmount({
  //       amount: targetAmountTruncated,
  //       bestBuy,
  //       bestSell,
  //       balanceToken1: balanceToken1,
  //       // balanceToken2: balanceToken2,
  //       specifiedToken: SpecifiedToken.TOKEN_2,
  //     })
  //   );
  // };

  const updatePrice = (value: number) => {
    dispatch(
      orderInputSlice.actions.setPrice({
        price: value,
        balanceToken1: balanceToken1,
        // balanceToken2: balanceToken2,
      })
    );
  };

  let token1amount = token1.amount;
  // // let token2amount = token2.amount;
  // // For limit orders, tokens that are not specified are derived using price
  // // Note: this is only done for display, the state of these tokens will not be set.
  // if (type === "UNSTAKE") {
  //   if (specifiedToken === SpecifiedToken.TOKEN_1 && token1amount >= 0) {
  //     // token2amount = Calculator.multiply(token1.amount, price);
  //   }
  //   // if (specifiedToken === SpecifiedToken.TOKEN_2) {
  //   //   token1amount = price <= 0 ? 0 : Calculator.divide(token2.amount, price);
  //   // }
  // }

  const configMap: { [key in UserAction]: CurrencyInputGroupConfig } = {
    SET_TOKEN_1: {
      label: t("quantity"),
      currency: token1.symbol,
      value: token1amount,
      updateValue: updateToken1,
      inputValidation: validationToken1,
      secondaryLabelProps: {
        disabled: asset === AssetToStake.XRD,
        label: t("available"),
        currency: token1.symbol,
        value: truncateWithPrecision(balanceToken1, 8),
        setPercentageValue: setPercentageAmountToken1,
        userAction: UserAction.SET_TOKEN_1,
      },
    },
    // SET_TOKEN_2: {
    //   label: t("total"),
    //   currency: token2.symbol,
    //   value: token2amount,
    //   updateValue: updateToken2,
    //   inputValidation: validationToken2,
    //   secondaryLabelProps: {
    //     disabled: side === "SELL", // hide token2 balance for SELL
    //     label: t("available"),
    //     currency: token2.symbol,
    //     value: truncateWithPrecision(balanceToken2, 8), // TODO(dcts): use coin-decimals
    //     setPercentageValue: setPercentageAmountToken2,
    //     userAction: UserAction.SET_TOKEN_2,
    //   },
    // },

    UPDATE_PRICE: {
      label: t("price"),
      currency: "",
      value: price,
      updateValue: updatePrice,
      inputValidation: validationPrice,
      secondaryLabelProps: {
        disabled: currencyInputGroupDisabled, // hide if currencyInput is disabled (e.g. for market price)
        label: side === "BUY" ? t("best_buy") : t("best_sell"),
        currency: "",
        value: truncateWithPrecision(side === "BUY" ? bestBuy : bestSell, 8),
        updateValue: updatePrice,
        userAction: UserAction.UPDATE_PRICE,
      },
    },
  };

  return configMap[userAction];
}

function CurrencyInput({
  currency,
  value,
  updateValue,
  inputValidation,
}: CurrencyInputProps): JSX.Element | null {
  const { decimalSeparator } = getLocaleSeparators();
  const scale = 8;
  return (
    <>
      <div
        className={`h-[50px] w-full content-between border-[#141414] border-2 flex rounded-lg [background-color:#141414] ${
          inputValidation.valid
            ? "hover:outline hover:outline-1 hover:outline-white/50"
            : "border-2 border-red-500"
        }`}
        style={{ backgroundColor: "#141414" }}
      >
        <CustomNumericIMask
          value={value}
          separator={decimalSeparator}
          scale={scale}
          onAccept={updateValue}
          className="text-sm grow w-full [background-color:#141414] text-right pr-2 rounded-lg focus:outline-none"
        />
        <div className="text-sm shrink-0 [background-color:#141414] content-center items-center flex pl-2 pr-4 rounded-r-md">
          {currency}
        </div>
      </div>
    </>
  );
}

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
      className={`${className} [background-color:#141414] [background:transparent] focus:bg-[#141414] active:bg-[#141414]`}
      style={{
        backgroundColor: "#141414",
        WebkitAppearance: "none",
        appearance: "none",
      }}
    />
  );
}

// function DisabledInputField({
//   label,
// }: DisabledInputFieldProps): JSX.Element | null {
//   return (
//     <div className="h-[40px] w-full content-between bg-base-200 flex relative rounded-lg border-[1.5px] border-dashed border-[#768089]">
//       <div className="uppercase text-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#768089] select-none">
//         {label}
//       </div>
//     </div>
//   );
// }

function SecondaryLabel({
  disabled,
  label,
  currency,
  value,
  updateValue,
  setPercentageValue,
  userAction,
}: SecondaryLabelProps): JSX.Element | null {
  return disabled ? (
    <></>
  ) : (
    <p
      className="text-xs font-medium text-white underline mr-1 cursor-pointer tracking-[0.1px] text-right"
      onClick={
        userAction === UserAction.UPDATE_PRICE && updateValue
          ? () => updateValue(value)
          : setPercentageValue
          ? () => setPercentageValue(100, currency === "XRD")
          : () => {}
      }
    >
      {label}:{" "}
      {value === 0 ? 0 : truncateWithPrecision(value, getPrecision(currency))}{" "}
      {currency}
    </p>
  );
}

interface LabelProps {
  label: string;
}

function Label({ label }: LabelProps): JSX.Element | null {
  return (
    <p className="text-xs font-medium text-left opacity-50 pb-1 tracking-[0.5px] grow select-none">
      {label}:
    </p>
  );
}

function SubmitButton() {
  const isClient = useHydrationErrorFix(); // to fix HydrationError
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const { validationToken1 } = useAppSelector((state) => state.orderInput);
  const { asset, type } = useAppSelector((state) => state.stakeSlice);
  const { isConnected } = useAppSelector((state) => state.radix);

  const isUnstake = type === StakeType.UNSTAKE;
  const isDextr = asset === AssetToStake.DEXTR;

  const disabled = !isConnected || validationToken1.valid;

  const buttonText = !isConnected
    ? t("connect_wallet_to_trade")
    : t("stake_action_token")
        .replaceAll("<$STAKE_TYPE>", t(type))
        .replaceAll("<$ASSET_TO_STAKE>", t(asset));

  // Fix HydrationError
  if (!isClient) return <></>;

  return (
    <div className="px-6">
      <button
        className={`w-full h-[40px] rounded ${
          disabled
            ? "bg-[#232629] text-[#474D52] opacity-50"
            : isDextr
            ? "bg-dexter-green text-black opacity-100"
            : "bg-dexter-red text-white opacity-100"
        }`}
        onClick={async (e) => {
          if (!isConnected) {
            alert(t("connect_wallet_to_trade"));
            return;
          }
          if (disabled) {
            return;
          }
          e.stopPropagation();
          DexterToast.promise(
            // Function input, with following state-to-toast mapping
            // -> pending: loading toast
            // -> rejceted: error toast
            // -> resolved: success toast
            async () => {
              const action = await dispatch(submitOrder());
              if (!action.type.endsWith("fulfilled")) {
                // Transaction was not fulfilled (e.g. userRejected or userCanceled)
                throw new Error("Transaction failed due to user action.");
              } else if ((action.payload as any)?.status === "ERROR") {
                // Transaction was fulfilled but failed (e.g. submitted onchain failure)
                throw new Error("Transaction failed onledger");
              }
              dispatch(orderInputSlice.actions.resetUserInput());
              dispatch(fetchBalances());
            },
            t("submitting_order"), // Loading message
            t("order_submitted"), // success message
            t("failed_to_submit_order") // error message
          );
        }}
      >
        <div className="flex justify-center items-center">
          <div className="font-bold text-sm tracking-[.1px] uppercase">
            {buttonText}
          </div>
          {isUnstake && isConnected && (
            <InfoTooltip
              iconColor={isDextr ? "text-black" : "text-white"}
              content={undefined}
            />
          )}
        </div>
      </button>
    </div>
  );
}

function InfoTooltip({
  content,
  iconColor = "text-white",
}: {
  iconColor?: string;
  content?: string;
}) {
  if (!content) {
    return <></>;
  }
  return (
    <div
      className="my-auto ml-2 tooltip text-3xl before:bg-base-300 z-10 font-normal normal-case"
      data-tip={content}
    >
      <AiOutlineInfoCircle className={`${iconColor} text-sm`} />
    </div>
  );
}

const Unstaking = () => {
  const unstakeHeaders = {
    Quantity: ["1000 XRD"],
    "Unstake start": ["2025-01-01"],
    "Unstake end": ["2025-01-31"],
  };

  return (
    <>
      <div className="flex flex-col mx-14 justify-center my-8">
        <div className="flex flex-row border-b-2 border-dexter-grey-light w-full">
          <Image src={carotUp} alt="carot-up" width={10} height={10} />{" "}
          <p className="flex items-center uppercase font-bold pl-2 pb-2">
            {AssetToStake.DEXTR} Unstaking
          </p>
        </div>

        <div className="w-full flex flex-col">
          {/* Headers */}
          <div className="flex flex-row justify-start items-center border-b-2 border-dexter-grey-light w-full pt-6 pb-2">
            {Object.keys(unstakeHeaders).map((header) => (
              <div
                key={header}
                className="w-1/4 text-xs border-b-1 border-dexter-grey-light"
              >
                {header}
              </div>
            ))}
          </div>

          {/* Rows */}
          {unstakeHeaders.Quantity.map((_, index) => (
            <div
              key={index}
              className="flex flex-row justify-between items-center border-b-2 border-dexter-grey-light w-full cursor-pointer"
            >
              {Object.values(unstakeHeaders).map((values, colIndex) => (
                <div key={colIndex} className="w-1/4">
                  {values[index]}
                </div>
              ))}
              <div className="w-1/4 text-right">
                <DexterButton
                  title="Claim funds"
                  targetUrl=""
                  maxWidth="w-[150px]"
                  minHeight="h-[44px]"
                  buttonClassName="my-2"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
