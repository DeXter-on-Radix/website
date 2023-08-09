import { useContext } from "react";
import { AdexStateContext } from "./contexts";
import { OrderBook } from "./OrderBook";
import { PriceChart } from "./PriceChart";
import { OrderButton } from "./OrderButton";

export function PairInfo() {
  //Returns some simple information about the currently selected pair, and the orderbook
  const adexState = useContext(AdexStateContext);

  return (
    <div>
      <div className="text-sm">
        Pair Address: {adexState.currentPairInfo.address}
      </div>

      <OrderButton />
      <PriceChart />

      <OrderBook />
    </div>
  );
}
