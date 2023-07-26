import { useContext } from "react";
import { OrderbookLine } from "alphadex-sdk-js";
import { AdexStateContext } from "./contexts";
import "./orderbook.css";

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
  lastPrice: string;
  bestSell: number | null;
  bestBuy: number | null;
}

function MiddleRows(props: MiddleRowsProps) {
  const { lastPrice, bestSell, bestBuy } = props;

  const tdStyle = {
    padding: "0",
  };

  if (bestBuy && bestSell && bestBuy !== 0) {
    const spread = bestSell - bestBuy;
    const spreadPercent = (spread / bestBuy) * 100;

    return (
      <>
        <tr className="border-none orderbook-middle-row-top">
          <td className="text-2xl" colSpan={2} style={tdStyle}>
            {lastPrice}
          </td>
          <td className="text-sm text-end" colSpan={2}>
            Spread
          </td>
        </tr>

        <tr className="border-none orderbook-middle-row-bottom">
          <td className="text-sm" colSpan={2}>
            TODO: should we use USD value?
          </td>
          <td className="text-xl text-end" colSpan={2}>
            {spread}({spreadPercent}%)
          </td>
        </tr>
      </>
    );
  } else {
    return (
      <>
        <tr className="border-none orderbook-middle-row-top">
          <td className="text-2xl" colSpan={4} style={tdStyle}>
            {lastPrice}
          </td>
        </tr>
        <tr className="border-none orderbook-middle-row-bottom">
          <td className="text-sm" colSpan={4}>
            TODO: should we use USD estimate?
          </td>
        </tr>
      </>
    );
  }
}

export function OrderBook() {
  const adexState = useContext(AdexStateContext);
  const { buys, sells } = adexState.currentPairOrderbook;

  let lastPrice = "";
  // checking for past trades here because adexState.currentPairInfo.lastPrice
  // is never null, and is = -1 if there were no trades
  if (adexState.currentPairTrades.length > 0) {
    lastPrice = adexState.currentPairInfo.lastPrice.toLocaleString();
  }
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
            lastPrice={lastPrice}
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
