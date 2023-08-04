import { useContext, CSSProperties } from "react";
import { OrderbookLine } from "alphadex-sdk-js";
import { AdexStateContext } from "./contexts";
import * as utils from "./utils";

// TODO: test the table updates automatically when orders get bought

export interface OrderBookRowProps {
  barColor?: string;
  orderCount?: number;
  price?: number;
  size?: number;
  total?: number;
  maxTotal?: number;
  absentOrders?: string;
}

function OrderBookRow(props: OrderBookRowProps) {
  const adexState = useContext(AdexStateContext);

  const { barColor, orderCount, price, size, total, maxTotal } = props;
  if (
    typeof barColor !== "undefined" &&
    typeof orderCount !== "undefined" &&
    typeof price !== "undefined" &&
    typeof size !== "undefined" &&
    typeof total !== "undefined" &&
    typeof maxTotal !== "undefined"
  ) {
    const { maxDigitsToken1, maxDigitsToken2 } = adexState.currentPairInfo;
    const priceString = utils.displayNumber(price, maxDigitsToken1);
    const sizeString = utils.displayNumber(size, maxDigitsToken2);
    const totalString = utils.displayNumber(total, maxDigitsToken1);
    const barWidth = `${(total / maxTotal) * 100}%`;

    const barStyle = {
      width: barWidth,
      backgroundColor: barColor,
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: -1,
    } as CSSProperties;

    return (
      <div className="relative col-span-4 grid grid-cols-4">
        <div style={barStyle}></div>
        <div className="order-cell">{orderCount}</div>
        <div className="order-cell text-end">{priceString}</div>
        <div className="order-cell text-end">{sizeString}</div>
        <div className="order-cell text-end">{totalString}</div>
      </div>
    );
  }

  // otherwise we don't have data to display
  return <div className="text-center col-span-4">{props.absentOrders}</div>;
}

interface MiddleRowsProps {
  bestSell: number | null;
  bestBuy: number | null;
}

function MiddleRows(props: MiddleRowsProps) {
  const { bestSell, bestBuy } = props;
  const adexState = useContext(AdexStateContext);

  let spreadString = "";

  // checking for past trades here because adexState.currentPairInfo.lastPrice
  // is never null, and is = -1 if there were no trades
  let lastPrice = "";
  if (adexState.currentPairTrades.length > 0) {
    lastPrice = adexState.currentPairInfo.lastPrice.toLocaleString();
  } else {
    lastPrice = "No trades have occurred yet";
  }

  if (bestBuy && bestSell) {
    if (bestBuy + bestSell !== 0) {
      const spread = bestSell - bestBuy;
      const spreadPercent = utils.displayNumber(
        (2 * spread) / (bestBuy + bestSell),
        2
      );

      const maxDigits = Math.max(
        adexState.currentPairInfo.maxDigitsToken1,
        adexState.currentPairInfo.maxDigitsToken2
      );

      spreadString = `${utils.displayNumber(
        spread,
        maxDigits
      )} (${spreadPercent}%)`;
    }

    return (
      <>
        <div className="text-2xl col-span-2 row-span-2 border-t border-b">
          {lastPrice}
        </div>
        <div className="text-sm text-end col-span-2 border-t">Spread</div>

        <div className="text-xl text-end col-span-2 border-b">
          {spreadString}
        </div>
      </>
    );
  } else {
    return (
      <div className="text-2xl col-span-4 border-t border-b">{lastPrice}</div>
    );
  }
}

export function toOrderBookRowProps(
  adexOrderbookLines: OrderbookLine[],
  side: "sell" | "buy"
): OrderBookRowProps[] {
  // this will drop the rows that do not fit into 8 buys/sells
  // TODO: implement pagination or scrolling

  const props: OrderBookRowProps[] = [];
  let adexRows = [...adexOrderbookLines]; // copy the array so we can mutate it

  // TODO: daisyui variable bar color
  let barColor = "green";
  if (side === "sell") {
    adexRows.reverse();
    barColor = "red";
  }
  adexRows = adexRows.slice(0, 8); // Limit to 8 rows

  let total = 0;
  let maxTotal = 0;
  for (let adexRow of adexRows) {
    total += adexRow.quantityRemaining;
    const currentProps = {
      barColor,
      orderCount: adexRow.noOrders,
      price: adexRow.price,
      size: adexRow.valueRemaining,
      total: total,
    };
    maxTotal = Math.max(maxTotal, total);

    props.push(currentProps);
  }
  // update maxTotal
  for (let i = 0; i < props.length; i++) {
    props[i].maxTotal = maxTotal;
  }

  // If there are fewer than 8 orders, fill the remaining rows with empty values
  while (props.length < 8) {
    props.push({ absentOrders: "\u00A0" });
  }

  if (adexOrderbookLines.length === 0) {
    props[2].absentOrders = `No open ${side} orders`;
  }

  if (side === "sell") {
    props.reverse();
  }

  return props;
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
      <div className="grid grid-cols-4 gap-0 max-w-md">
        <div>Order Count</div>
        <div className="text-end">
          Price ({adexState.currentPairInfo.token1.symbol})
        </div>
        <div className="text-end">
          Size ({adexState.currentPairInfo.token2.symbol})
        </div>
        <div className="text-end">
          Total ({adexState.currentPairInfo.token1.symbol})
        </div>

        {toOrderBookRowProps(sells, "sell").map((props, index) => (
          <OrderBookRow key={"sell-" + index} {...props} />
        ))}

        <MiddleRows bestSell={bestSell} bestBuy={bestBuy} />

        {toOrderBookRowProps(buys, "buy").map((props, index) => (
          <OrderBookRow key={"buy-" + index} {...props} />
        ))}
      </div>
    </div>
  );
}
