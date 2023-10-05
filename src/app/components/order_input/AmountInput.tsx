import React, { useMemo, useRef } from "react";
import { RxChevronDown } from "react-icons/rx";

import { Input } from "common/input";
import { TokenAvatar } from "common/tokenAvatar";
import { TokenWithSymbol } from "common/tokenWithSymbol";
import { useAppDispatch, useAppSelector } from "hooks";
import {
  OrderSide,
  getSelectedToken,
  getUnselectedToken,
  orderInputSlice,
  validatePositionSize,
} from "redux/orderInputSlice";

export function AmountInput() {
  const { size, quote, side, token1Selected } = useAppSelector(
    (state) => state.orderInput
  );
  // const {
  //   token1: { balance: balance1 },
  //   token2: { balance: balance2 },
  // } = useAppSelector((state) => state.pairSelector);
  const validationResult = useAppSelector(validatePositionSize);
  const selectedToken = useAppSelector(getSelectedToken);
  const unSelectedToken = useAppSelector(getUnselectedToken);
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

  const handleTokenSwitch = () => {
    dispatch(orderInputSlice.actions.setToken1Selected(!token1Selected));
  };

  return (
    <div className="form-control w-full">
      <div className="flex flex-row items-center justify-between !mb-2">
        <p className="text-left text-sm font-medium">
          {side === OrderSide.BUY ? "Buy" : "Sell"} Amount:
        </p>
        {/* {isSell && (
            <p className="text-left text-sm font-medium cursor-pointer">
              Balance: <span className="text-white">{balance1}</span>
            </p>
          )} */}
      </div>
      <Input
        type="number"
        value={size}
        onChange={handleOnChange}
        isError={isSell && !validationResult.valid}
        endAdornmentClasses="flex"
        endAdornment={
          <div className="dropdown dropdown-end h-full cursor-pointer">
            <div className="flex items-center" tabIndex={0}>
              <TokenWithSymbol
                logoUrl={selectedToken.iconUrl}
                symbol={selectedToken.symbol}
              />
              <RxChevronDown className="w-6" />
            </div>
            <ul className="dropdown-content z-[1] menu  shadow bg-base-100 min-w-[7rem] rounded-box !mt-2 !p-0">
              <li
                className="!pl-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTokenSwitch();
                }}
              >
                <button onClick={handleTokenSwitch}>
                  <TokenWithSymbol
                    logoUrl={unSelectedToken.iconUrl}
                    symbol={unSelectedToken.symbol}
                  />
                </button>
              </li>
            </ul>
          </div>
          // <div
          //   className="flex items-center space-x-2"
          //   onClick={handleTokenSwitch}
          // >
          //   <TokenAvatar url={selectedToken.iconUrl} />
          //   <span className="font-bold text-base">{selectedToken.symbol}</span>
          // </div>
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
          {isBuy ? "You pay" : "You receive:"}
        </p>
        {/* {isBuy && (
            <p className="text-left text-sm font-medium cursor-pointer">
              Balance: <span className="text-white">{balance2}</span>
            </p>
          )} */}
      </div>
      <Input
        type="number"
        value={quote?.fromAmount ?? 0}
        disabled
        isError={isBuy && !validationResult.valid}
        endAdornment={
          <div className="flex items-center space-x-2">
            <TokenAvatar url={unSelectedToken.iconUrl} />
            <span className="font-bold text-base">
              {unSelectedToken.symbol}
            </span>
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
          Total fee: {quote?.totalFees ?? 0} {quote?.toToken.symbol}
        </div>
        <div className="collapse-content text-sm pl-0">
          <div className="flex items-center justify-between">
            <div>Exchange Fee: </div>
            <div>
              {quote?.exchangeFees} {quote?.toToken.symbol}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>Platform Fee: </div>
            <div>
              {quote?.platformFees} {quote?.toToken.symbol}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>Liquidity Fee: </div>
            <div>
              {quote?.liquidityFees} {quote?.toToken.symbol}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
