import { useAppDispatch, useAppSelector } from "hooks";
import { OrderSide, orderInputSlice } from "state/orderInputSlice";

export function OrderSideTabs() {
  const dispatch = useAppDispatch();

  function tabClass(isActive: boolean) {
    return (
      "flex-1 font-semibold py-2" +
      (isActive ? " text-primary-content bg-neutral" : "")
    );
  }
  return (
    <div className="flex flex-nowrap">
      <button
        className={tabClass(
          useAppSelector((state) => state.orderInput.side) === OrderSide.BUY
        )}
        onClick={() => {
          dispatch(orderInputSlice.actions.setSide(OrderSide.BUY));
        }}
      >
        BUY
      </button>
      <button
        className={tabClass(
          useAppSelector((state) => state.orderInput.side) === OrderSide.SELL
        )}
        onClick={() => {
          dispatch(orderInputSlice.actions.setSide(OrderSide.SELL));
        }}
      >
        SELL
      </button>
    </div>
  );
}
