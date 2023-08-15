import { CSSProperties } from "react";
import "./orderbook.css";
import * as utils from "./utils";
import { OrderBookRowProps } from "./orderBookSlice";
import { useSelector } from "react-redux";
import { RootState } from "./store";

function OrderBookRow(props: OrderBookRowProps) {
  const maxDigitsToken1 = useSelector(
    (state: RootState) => state.pairInfo.token1Info.maxDigits
  );
  const maxDigitsToken2 = useSelector(
    (state: RootState) => state.pairInfo.token2Info.maxDigits
  );
  const { barColor, orderCount, price, size, total, maxTotal } = props;
  if (
    typeof barColor !== "undefined" &&
    typeof orderCount !== "undefined" &&
    typeof price !== "undefined" &&
    typeof size !== "undefined" &&
    typeof total !== "undefined" &&
    typeof maxTotal !== "undefined"
  ) {
    const priceString = utils.displayNumber(price, maxDigitsToken2);
    const sizeString = utils.displayNumber(size, maxDigitsToken1);
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
      <div className="relative col-span-4 sized-columns">
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

function MiddleRows() {
  const trades = useSelector((state: RootState) => state.pairInfo.trades);
  const orderBook = useSelector((state: RootState) => state.orderBook);
  const pairInfo = useSelector((state: RootState) => state.pairInfo);

  let spreadString = "";

  // checking for past trades here because adexState.currentPairInfo.lastPrice
  // is never null, and is = -1 if there were no trades
  let lastPrice = "";
  if (trades.length > 0) {
    lastPrice = pairInfo.lastPrice?.toLocaleString() || "";
  } else {
    lastPrice = "No trades have occurred yet";
  }
  const bestSell = orderBook.bestSell;
  const bestBuy = orderBook.bestBuy;

  if (bestBuy !== null && bestSell !== null) {
    if (orderBook.spreadPercent !== null && orderBook.spread !== null) {
      const maxDigits = Math.max(
        pairInfo.token1Info.maxDigits,
        pairInfo.token2Info.maxDigits
      );
      const spread = utils.displayNumber(orderBook.spread, maxDigits);
      const spreadPercent = utils.displayNumber(orderBook.spreadPercent, 2);

      spreadString = `${spread} (${spreadPercent}%)`;
    }

    return (
      <>
        <div className="text-2xl col-span-2 my-1 py-1 border-t border-b">
          {lastPrice}
        </div>

        <div className="flex justify-end col-span-2 text-xl my-1 py-1 border-t border-b whitespace-nowrap ">
          <span className="text-sm my-auto">Spread</span>{" "}
          <span className="my-auto pl-2">{spreadString}</span>
        </div>
      </>
    );
  } else {
    return (
      <div className="text-2xl col-span-4 border-t border-b">{lastPrice}</div>
    );
  }
}

export function OrderBook() {
  const token1Symbol = useSelector(
    (state: RootState) => state.pairInfo.token1Info.symbol
  );
  const token2Symbol = useSelector(
    (state: RootState) => state.pairInfo.token2Info.symbol
  );
  const sells = useSelector((state: RootState) => state.orderBook.sells);
  const buys = useSelector((state: RootState) => state.orderBook.buys);

  return (
    <div className="p-2 text-sx">
      <div className="sized-columns max-w-sm">
        <div className="">
          Order
          <br />
          Count
        </div>
        <div className="text-end">
          Price
          <br />({token2Symbol})
        </div>
        <div className="text-end">
          Size
          <br />({token1Symbol})
        </div>
        <div className="text-end">
          Total
          <br />({token1Symbol})
        </div>

        {sells.map((props, index) => (
          <OrderBookRow key={"sell-" + index} {...props} />
        ))}

        <MiddleRows />

        {buys.map((props, index) => (
          <OrderBookRow key={"buy-" + index} {...props} />
        ))}
      </div>
    </div>
  );
}
