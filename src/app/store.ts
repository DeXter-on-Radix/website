import { configureStore } from "@reduxjs/toolkit";
import orderInputReducer from "./orderInputSlice";
import pairInfoReducer from "./pairInfoSlice";

export const store = configureStore({
  reducer: {
    pairInfo: pairInfoReducer,
    orderInput: orderInputReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
