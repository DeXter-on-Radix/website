import { useAppDispatch, useAppSelector } from "hooks";
import { useEffect } from "react";

import {
  OrderSide,
  fetchQuote,
  orderInputSlice,
  selectBalanceByAddress,
  selectTargetToken,
  validateSlippageInput,
} from "redux/orderInputSlice";
import { numberOrEmptyInput, getLocaleSeparators } from "utils";
import {
  AmountInput,
  PayReceive,
  SwitchTokenPlacesButton,
} from "./AmountInput";
import { BottomRightErrorLabel } from "components/BottomRightErrorLabel";

function uiSlippageToSlippage(slippage: number | "") {
  if (slippage === "") {
    return "";
  }
  return slippage / 100;
}

function slippageToUiSlippage(slippage: number | "") {
  if (slippage === "") {
    return "";
  }
  return slippage * 100;
}

export function MarketOrderInput() {
  const {
    token1,
    token2,
    validationToken1,
    validationToken2,
    side,
    slippage,
    tab,
  } = useAppSelector((state) => state.orderInput);
  const balanceToken1 = useAppSelector((state) =>
    selectBalanceByAddress(state, token1.address)
  );
  const tartgetToken = useAppSelector(selectTargetToken);
  const pairAddress = useAppSelector((state) => state.pairSelector.address);

  const slippageValidationResult = useAppSelector(validateSlippageInput);
  const dispatch = useAppDispatch();

  // create a regex to match a trailing decimal
  var regex = new RegExp(
    "^\\d+\\" + getLocaleSeparators().decimalSeparator + "$"
  );

  useEffect(() => {
    if (
      tartgetToken.amount !== "" &&
      validationToken1.valid &&
      validationToken2.valid
    ) {
      dispatch(fetchQuote());
    }
  }, [
    dispatch,
    pairAddress,
    token1,
    token2,
    side,
    slippage,
    tab,
    tartgetToken,
    validationToken1.valid,
    validationToken2.valid,
  ]);

  useEffect(() => {
    dispatch(
      orderInputSlice.actions.validateAmountWithBalance({
        address: token1.address,
        amount: token1.amount,
        balance: balanceToken1 || 0,
      })
    );
  }, [token1, balanceToken1, side, dispatch]);

  useEffect(() => {
    dispatch(
      orderInputSlice.actions.validateAmount({
        address: token2.address,
        amount: token2.amount,
      })
    );
  }, [token2, dispatch]);

  return (
    <div className="form-control w-full">
      <div className="mt-4">
        <AmountInput
          {...token1}
          payReceive={PayReceive.PAY}
          onFocus={() => {
            dispatch(orderInputSlice.actions.setSide(OrderSide.SELL));
          }}
          onAccept={(event) => {
            if (!regex.test(event)) {
              dispatch(
                orderInputSlice.actions.setAmountToken1(
                  numberOrEmptyInput(event)
                )
              );
            }
          }}
        />
        <SwitchTokenPlacesButton />
        <AmountInput
          {...token2}
          payReceive={PayReceive.RECEIVE}
          onFocus={() => {
            dispatch(orderInputSlice.actions.setSide(OrderSide.BUY));
          }}
          onAccept={(event) => {
            if (!regex.test(event))
              dispatch(
                orderInputSlice.actions.setAmountToken2(
                  numberOrEmptyInput(event)
                )
              );
          }}
        />
      </div>

      {/* slippage */}
      <div className="flex flex-row flex-nowrap">
        <div className="flex-auto"></div>
        <div className="flex-none form-control">
          <label className="label justify-center">
            <span className="label-text-alt text-secondary-content">
              SLIPPAGE LIMIT
            </span>
          </label>
          <div
            className={
              "bg-base-200 w-full space-x-2 py-1 px-2 border-2 border-base-200" +
              (!slippageValidationResult.valid ? " !border-error" : "")
            }
          >
            <input
              className="!bg-base-200 w-12 text-end"
              type="number"
              min="0"
              lang="en"
              step={0.5}
              max="100"
              formNoValidate
              value={slippageToUiSlippage(slippage)}
              onChange={(event) => {
                dispatch(
                  orderInputSlice.actions.setSlippage(
                    uiSlippageToSlippage(numberOrEmptyInput(event.target.value))
                  )
                );
              }}
            />
            <span>%</span>
          </div>
        </div>
      </div>

      <BottomRightErrorLabel message={slippageValidationResult.message} />
    </div>
  );
}
