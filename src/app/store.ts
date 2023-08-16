import { configureStore } from "@reduxjs/toolkit";
import orderInputReducer from "./orderInputSlice";
import pairSelectorReducer from "./pairSelectorSlice";
import orderBookReducer from "./orderBookSlice";
import priceChartReducer from "./priceChartSlice";
import accountHistoryReducer from "./accountHistorySlice";

export const store = configureStore({
  reducer: {
    pairSelector: pairSelectorReducer,
    orderInput: orderInputReducer,
    orderBook: orderBookReducer,
    priceChart: priceChartReducer,
    accountHistory: accountHistoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
