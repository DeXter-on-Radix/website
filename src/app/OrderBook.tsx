import { useContext } from "react";
import { OrderbookLine } from "alphadex-sdk-js";
import { AdexStateContext } from "./adex-state-context";

export function OrderBook({ orders }: { orders: OrderbookLine[] }) {
  //returns simple orderbook of buys/sells
  const adexState = useContext(AdexStateContext);
  const { buys, sells } = adexState.currentPairOrderbook;
  return (
    <>
      {orders.map(
        (
          item: {
            price: number;
            quantityRemaining: number;
            valueRemaining: number;
          },
          index: number
        ) => (
          <tr key={index}>
            <th>{orders === buys ? "Buy" : "Sell"}</th>
            <td>{item.price}</td>
            <td>{item.quantityRemaining}</td>
            <td>{item.valueRemaining}</td>
          </tr>
        )
      )}
    </>
  );
}
