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

export const MAX_ROWS = 11;

export function toOrderBookRowProps(
  adexOrderbookLines: adex.OrderbookLine[],
  side: "sell" | "buy",
  grouping: number
): OrderBookRowProps[] {
  const props: OrderBookRowProps[] = [];
  let adexRows = [...adexOrderbookLines]; // copy the array so we can mutate it

  let barColor = "hsl(var(--suc))";
  if (side === "sell") {
    adexRows.reverse();
    barColor = "hsl(var(--erc))";
  }
  let groupedArray;
  if (grouping > 0) {
    const roundToGroup = (num: number) => Math.round(num / grouping) * grouping;

    if (adexRows.length > 0) {
      groupedArray = adexRows.reduce((result: adex.OrderbookLine[], item) => {
        const key = roundToGroup(item.price);
        if (key > 0) {
          const foundItem = result.find(
            (x: adex.OrderbookLine) => x.price === key
          ); // note that we don't specify the type here
          let existingItem: adex.OrderbookLine; // declare the variable without assigning it
          if (foundItem !== undefined) {
            // if the foundItem is not undefined, we can assign it safely
            existingItem = foundItem;
            existingItem.token1Remaining += item.token1Remaining;
            existingItem.token2Remaining += item.token2Remaining;
            existingItem.noOrders += item.noOrders;
            existingItem.orders = existingItem.orders.concat(item.orders);
            existingItem.total += item.total;
          } else {
            // If it's a new price, add it to the result
            item.price = key;
            result.push({ ...item });
          }
        }
        return result;
      }, []);
    }
  }

  // Throw away any extra rows
  if (groupedArray != null) {
    adexRows = groupedArray.slice(0, MAX_ROWS);
  } else {
    adexRows = adexRows.slice(0, MAX_ROWS);
  }

  let total = 0;
  let maxTotal = 0;
  for (let adexRow of adexRows) {
    total += adexRow.token1Remaining;
    const currentProps = {
      barColor,
      orderCount: adexRow.noOrders,
      price: adexRow.price,
      size: adexRow.token1Remaining,
      total: total,
    };
    maxTotal = Math.max(maxTotal, total);

    props.push(currentProps);
  }
  // update maxTotal
  for (let i = 0; i < props.length; i++) {
    props[i].maxTotal = maxTotal;
  }

  // If there are fewer than MAX_ROWS orders, fill the remaining rows with empty values
  while (props.length < MAX_ROWS) {
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
      if (action.payload === null) {
        state.grouping = 0;
      } else if (action.payload < 0) {
        state.grouping = 0;
      } else {
        state.grouping = action.payload;
      }

      const sells = toOrderBookRowProps(
        adex.clientState.currentPairOrderbook.sells,
        "sell",
        state.grouping || 0
      );
      const buys = toOrderBookRowProps(
        adex.clientState.currentPairOrderbook.buys,
        "buy",
        state.grouping || 0
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
      state.lastPrice = adex.clientState.currentPairInfo.lastPrice;
      state.bestSell = bestSell;
      state.bestBuy = bestBuy;
    },
  },
});

export const selectBestBuy = (state: RootState) => state.orderBook.bestBuy;
export const selectBestSell = (state: RootState) => state.orderBook.bestSell;
