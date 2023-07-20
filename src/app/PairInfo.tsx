import { useContext } from "react";
import { AdexStateContext } from "./page";
import { OrderBook } from "./OrderBook";
import { PriceChart } from "./PriceChart";
import { NewOrder } from "./NewOrder";

export function PairInfo() {
  //Returns some simple information about the currently selected pair, and the orderbook
  const adexState = useContext(AdexStateContext);
  const { buys, sells } = adexState.currentPairOrderbook;

  return (
    <div>
      <div className="text-sm">
        Pair Address: {adexState.currentPairInfo.address}
      </div>
      <div className="text-sm">
        Last Price: {adexState.currentPairInfo.lastPrice}
      </div>

      <NewOrder />
      <PriceChart />

      <h4>Orderbook:</h4>

      <table className="table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Price</th>
            <th>Quantity Remaining</th>
            <th>Value Remaining</th>
          </tr>
        </thead>
        <tbody>
          <OrderBook orders={buys} />
          <OrderBook orders={sells} />
        </tbody>
      </table>
    </div>
  );
}
