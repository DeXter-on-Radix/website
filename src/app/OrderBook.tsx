import { useContext } from "react";
import { OrderbookLine } from "alphadex-sdk-js";
import { AdexStateContext } from "./contexts";

interface OrderBookRowProps {
  barColor: string;
  order: OrderbookLine;
}

function OrderBookRow(props: OrderBookRowProps) {
  const { barColor, order } = props;

  return (
    <tr className="border-none">
      <td>{order.noOrders}</td>
      <td className={barColor === "green" ? "text-green-700" : "text-red-700"}>
        {order.price}
      </td>
      <td>{order.quantityRemaining}</td>
      <td>{order.valueRemaining}</td>
    </tr>
  );
}

export function OrderBook() {
  const adexState = useContext(AdexStateContext);
  const { buys, sells } = adexState.currentPairOrderbook;
  return (
    <div className="p-2">
      <table className="table-sm">
        <thead>
          <tr>
            <th>Order Count</th>
            <th>Price ({adexState.currentPairInfo.token1.symbol})</th>
            <th>Size ({adexState.currentPairInfo.token2.symbol})</th>
            <th>Size ({adexState.currentPairInfo.token1.symbol})</th>
          </tr>
        </thead>
        <tbody>
          {sells.map((order: OrderbookLine, index: number) => (
            <OrderBookRow key={"sell-" + index} barColor="red" order={order} />
          ))}

          <tr className="border-none">
            <td className="text-xl" colSpan={4}>
              {adexState.currentPairInfo.lastPrice}
            </td>
          </tr>

          {buys.map((order: OrderbookLine, index: number) => (
            <OrderBookRow key={"buy-" + index} barColor="green" order={order} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
