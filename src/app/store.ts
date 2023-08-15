import { configureStore } from "@reduxjs/toolkit";
import orderInputReducer from "./orderInputSlice";
import pairInfoReducer from "./pairInfoSlice";
import orderBookReducer from "./orderBookSlice";

export const store = configureStore({
  reducer: {
    pairInfo: pairInfoReducer,
    orderInput: orderInputReducer,
    orderBook: orderBookReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
