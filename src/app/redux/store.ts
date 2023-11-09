import { configureStore } from "@reduxjs/toolkit";
import { orderInputSlice } from "./orderInputSlice";
import { pairSelectorSlice } from "./pairSelectorSlice";
import { orderBookSlice } from "./orderBookSlice";
import { priceChartSlice } from "./priceChartSlice";
import { accountHistorySlice } from "./accountHistorySlice";
import { radixSlice } from "./radixSlice";
import { priceInfoSlice } from "./priceInfoSlice";
import { marketSlice } from "./marketSlice";

export const store = configureStore({
  reducer: {
    radix: radixSlice.reducer,
    pairSelector: pairSelectorSlice.reducer,
    orderInput: orderInputSlice.reducer,
    orderBook: orderBookSlice.reducer,
    priceChart: priceChartSlice.reducer,
    accountHistory: accountHistorySlice.reducer,
    priceInfo: priceInfoSlice.reducer,
    marketInfo: marketSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
