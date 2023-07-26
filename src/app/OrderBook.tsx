import { useContext } from "react";
import { AdexStateContext } from "./page";
import { OrderbookLine } from "alphadex-sdk-js";
import * as utils from "./utils";

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
            <td>
              {utils.displayNumber(
                item.price,
                adexState.currentPairInfo.maxDigitsToken2,
                true
              )}
            </td>
            <td>
              {utils.displayNumber(
                item.quantityRemaining,
                adexState.currentPairInfo.maxDigitsToken1
              )}
            </td>
            <td>{item.valueRemaining}</td>
          </tr>
        )
      )}
    </>
  );
}
