import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import * as adex from "alphadex-sdk-js";
import { RootState } from "./store";

export interface OrderBookRowProps {
  barColor?: string;
  orderCount?: number;
  price?: number;
  size?: number;
  total?: number;
  maxTotal?: number;
  absentOrders?: string;
}

export interface OrderBookState {
  buys: OrderBookRowProps[];
  sells: OrderBookRowProps[];
  lastPrice: number | null;
  bestSell: number | null;
  bestBuy: number | null;
  spread: number | null;
  spreadPercent: number | null;
  grouping: number | null;
}

const initialState: OrderBookState = {
  buys: [],
  sells: [],
  lastPrice: null,
  bestSell: null,
  bestBuy: null,
  spread: null,
  spreadPercent: null,
  grouping: 0,
};

export function toOrderBookRowProps(
  adexOrderbookLines: adex.OrderbookLine[],
  side: "sell" | "buy",
  grouping: number
): OrderBookRowProps[] {
  // this will drop the rows that do not fit into 8 buys/sells
  // TODO: implement pagination or scrolling

  const props: OrderBookRowProps[] = [];
  let adexRows = [...adexOrderbookLines]; // copy the array so we can mutate it

  let barColor = "hsl(var(--suc))";
  if (side === "sell") {
    adexRows.reverse();
    barColor = "hsl(var(--erc))";
  }
  //console.log(adexRows);
  //group the by the grouping amount
  //console.log(grouping);

  const groupedArray = adexRows.reduce((result, item) => {
    const existingItem: adex.OrderbookLine = result.find(
      (x: adex.OrderbookLine) => x.price === item.price
    );
    //if (existingItem === undefined) return result;
    if (existingItem) {
      // If an item with the same price exists, aggregate the values
      existingItem.quantityRemaining += item.quantityRemaining;
      existingItem.valueRemaining += item.valueRemaining;
      existingItem.noOrders += item.noOrders;
      existingItem.orders = existingItem.orders.concat(item.orders);
      existingItem.total += item.total;
    } else {
      // If it's a new price, add it to the result
      result.push({ ...item });
    }

    return result;
  }, []);
  console.log(groupedArray);

  adexRows = adexRows.slice(0, 11); // Limit to 8 rows

  let total = 0;
  let maxTotal = 0;
  for (let adexRow of adexRows) {
    total += adexRow.quantityRemaining;
    const currentProps = {
      barColor,
      orderCount: adexRow.noOrders,
      price: adexRow.price,
      size: adexRow.quantityRemaining,
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
  while (props.length < 11) {
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

export const orderBookSlice = createSlice({
  name: "orderBook",
  initialState,

  // synchronous reducers
  reducers: {
    updateAdex(state: OrderBookState, action: PayloadAction<adex.StaticState>) {
      const adexState = action.payload;
      const grouping = state.grouping;

      const sells = toOrderBookRowProps(
        adexState.currentPairOrderbook.sells,
        "sell",
        grouping || 0
      );
      const buys = toOrderBookRowProps(
        adexState.currentPairOrderbook.buys,
        "buy",
        grouping || 0
      );
      let bestSell = sells[sells.length - 1]?.price || null;
      let bestBuy = buys[0]?.price || null;

      if (bestBuy !== null && bestSell !== null) {
        const spread = bestSell - bestBuy;
        if (bestBuy + bestSell !== 0) {
          const spreadPercent = ((2 * spread) / (bestBuy + bestSell)) * 100;
          state.spreadPercent = spreadPercent;
        }
        state.spread = spread;
      }

      state.sells = sells;
      state.buys = buys;
      state.lastPrice = adexState.currentPairInfo.lastPrice;
      state.bestSell = bestSell;
      state.bestBuy = bestBuy;
    },
    setGrouping(state, action: PayloadAction<number>) {
      state.grouping = action.payload;
      setFromGrouping(state);
    },
  },
});

function setFromGrouping(state: OrderBookState) {
  if (state.grouping === null) {
    state.grouping = 0;
  } else if (state.grouping < 0) {
    state.grouping = 0;
  }
}

export const selectBestBuy = (state: RootState) => state.orderBook.bestBuy;
export const selectBestSell = (state: RootState) => state.orderBook.bestSell;
