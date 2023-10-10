import { useAppDispatch, useAppSelector } from "hooks";
import { SwapAmountInput } from "./AmountInput";
import { orderInputSlice, validateSlippageInput } from "redux/orderInputSlice";
import { Input } from "common/input";

function uiSlippageToSlippage(slippage: number) {
  return slippage / 100;
}

function slippageToUiSlippage(slippage: number) {
  return slippage * 100;
}

export function MarketOrderInput() {
  const slippage = useAppSelector((state) => state.orderInput.slippage);
  const validationResult = useAppSelector(validateSlippageInput);
  const dispatch = useAppDispatch();

  return (
    <>
      <div className="form-control w-full">
        <SwapAmountInput />
        <label className="label">
          <span className="label-text">Slippage</span>
        </label>
        <Input
          type="number"
          value={slippageToUiSlippage(slippage)}
          onChange={(event) => {
            dispatch(
              orderInputSlice.actions.setSlippage(
                uiSlippageToSlippage(event.target.valueAsNumber)
              )
            );
          }}
          endAdornment={<span className="font-bold">%</span>}
          validation={validationResult}
        />
      </div>
    </>
  );
}
