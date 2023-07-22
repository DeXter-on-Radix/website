import { useContext } from "react";
import { OrderbookLine } from "alphadex-sdk-js";
import { AdexStateContext } from "./contexts";

interface OrderBookRowProps {
  barColor: string;
  order: OrderbookLine;
}

function OrderBookRow(props: OrderBookRowProps) {
  const { barColor: bgColor, order } = props;
  return (
    <tr>
      <th>{bgColor === "green" ? "Buy" : "Sell"}</th>
      <td>{order.price}</td>
      <td>{order.quantityRemaining}</td>
      <td>{order.valueRemaining}</td>
    </tr>
  );
}

export function OrderBook() {
  const adexState = useContext(AdexStateContext);
  const { buys, sells } = adexState.currentPairOrderbook;
  return (
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
        {buys.map((order: OrderbookLine, index: number) => (
          <OrderBookRow key={"buy-" + index} barColor="green" order={order} />
        ))}

        {sells.map((order: OrderbookLine, index: number) => (
          <OrderBookRow key={"sell-" + index} barColor="red" order={order} />
        ))}
      </tbody>
    </table>
  );
}
