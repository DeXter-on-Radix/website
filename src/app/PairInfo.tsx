import { useContext } from "react";
import { AdexStateContext } from "./contexts";
import { OrderBook } from "./OrderBook";
import { PriceChart } from "./PriceChart";

export function PairInfo() {
  //Returns some simple information about the currently selected pair, and the orderbook
  const adexState = useContext(AdexStateContext);

  return (
    <div>
      <h4>Current pair {adexState.currentPairInfo.name}</h4>
      <p>Address: {adexState.currentPairInfo.address}</p>
      <p>Last Price: {adexState.currentPairInfo.lastPrice}</p>

      <PriceChart />

      <OrderBook />
    </div>
  );
}
