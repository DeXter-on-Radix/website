import { configureStore } from "@reduxjs/toolkit";
import orderInputReducer from "./orderInputSlice";
import pairInfoReducer from "./pairInfoSlice";
import orderBookReducer from "./orderBookSlice";
import priceChartReducer from "./priceChartSlice";

export const store = configureStore({
  reducer: {
    pairInfo: pairInfoReducer,
    orderInput: orderInputReducer,
    orderBook: orderBookReducer,
    priceChart: priceChartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
