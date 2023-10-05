import { AmountInput } from "./AmountInput";

export function MarketOrderInput() {
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
      <AmountInput />
    </>
  );
}
