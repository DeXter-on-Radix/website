import { useContext } from "react";
import { AdexStateContext } from "./page";

export function OrderBook({ orders }) {
  //returns simple orderbook of buys/sells
  const adexState = useContext(AdexStateContext);
  const { buys, sells } = adexState.currentPairOrderbook;
  return (
    <>
      {orders.map((item, index) => (
        <tr key={index}>
          <th>{orders === buys ? "Buy" : "Sell"}</th>
          <td>{item.price}</td>
          <td>{item.quantityRemaining}</td>
          <td>{item.valueRemaining}</td>
        </tr>
      ))}
    </>
  );
}
