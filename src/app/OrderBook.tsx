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
      <td
        className={
          (barColor === "green" ? "text-green-700" : "text-red-700") +
          " text-end"
        }
      >
        {order.price}
      </td>
      <td className="text-end">{order.quantityRemaining}</td>
      <td className="text-end">{order.valueRemaining}</td>
    </tr>
  );
}

interface MiddleRowsProps {
  // TODO: how to determin if there were no trades to make this field nulllable?
  // adexState.currentPairInfo.lastPrice returns -1 if there were no trades
  lastPrice: number;
  bestSell: number | null;
  bestBuy: number | null;
}

function MiddleRows(props: MiddleRowsProps) {
  const { lastPrice, bestSell, bestBuy } = props;

  if (bestBuy && bestSell && bestBuy !== 0) {
    const spread = bestSell - bestBuy;
    const spreadPercent = (spread / bestBuy) * 100;

    return (
      <>
        <tr className="border-none">
          <td className="text-2xl m-0 p-0" colSpan={2}>
            {lastPrice}
          </td>
          <td className="text-sm m-0 p-0 text-end" colSpan={2}>
            Spread
          </td>
        </tr>

        <tr className="border-none">
          <td className="text-sm m-0 p-0" colSpan={2}>
            TODO: should we use USD value?
          </td>
          <td className="text-xl m-0 p-0 text-end" colSpan={2}>
            {spread}({spreadPercent}%)
          </td>
        </tr>
      </>
    );
  } else {
    return (
      <>
        <tr className="border-none">
          <td className="text-2xl m-0 p-0" colSpan={4}>
            {lastPrice}
          </td>
        </tr>
        <tr className="border-none">
          <td className="text-sm m-0 p-0" colSpan={4}>
            TODO: should we use USD value?
          </td>
        </tr>
      </>
    );
  }
}

export function OrderBook() {
  const adexState = useContext(AdexStateContext);
  const { buys, sells } = adexState.currentPairOrderbook;

  let bestSell = null;
  let bestBuy = null;

  if (sells.length > 0 && buys.length > 0) {
    bestSell = sells[sells.length - 1]?.price;
    bestBuy = buys[0]?.price;
  }

  return (
    <div className="p-2">
      <table className="table-sm">
        <thead>
          <tr>
            <th>Order Count</th>
            <th className="text-end">
              Price ({adexState.currentPairInfo.token1.symbol})
            </th>
            <th className="text-end">
              Size ({adexState.currentPairInfo.token2.symbol})
            </th>
            <th className="text-end">
              Size ({adexState.currentPairInfo.token1.symbol})
            </th>
          </tr>
        </thead>
        <tbody>
          {sells.map((order: OrderbookLine, index: number) => (
            <OrderBookRow key={"sell-" + index} barColor="red" order={order} />
          ))}

          <MiddleRows
            lastPrice={adexState.currentPairInfo.lastPrice}
            bestSell={bestSell}
            bestBuy={bestBuy}
          />

          {buys.map((order: OrderbookLine, index: number) => (
            <OrderBookRow key={"buy-" + index} barColor="green" order={order} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
