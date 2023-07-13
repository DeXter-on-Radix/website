import { useContext } from "react";
import { AdexStateContext } from "./page";
import { OrderBook } from "./OrderBook";
import { NewOrder } from "./NewOrder";

export function PairInfo() {
  //Returns some simple information about the currently selected pair, and the orderbook
  const adexState = useContext(AdexStateContext);
  const { buys, sells } = adexState.currentPairOrderbook;

  return (
    <div>
      <h4>Current pair {adexState.currentPairInfo.name}</h4>
      <p>Address: {adexState.currentPairInfo.address}</p>
      <p>Last Price: {adexState.currentPairInfo.lastPrice}</p>
      <NewOrder />
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
