import {
  PayloadAction,
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "./store";
import * as adex from "alphadex-sdk-js";
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";
import { getRdt, RDT } from "../subscriptions";

// TYPES AND INTERFACES
export enum Tables {
  OPEN_ORDERS = "OPEN_ORDERS",
  ORDER_HISTORY = "ORDER_HISTORY",
  TRADE_HISTORY = "TRADE_HISTORY",
}
export interface AccountHistoryState {
  trades: adex.Trade[];
  orderHistory: adex.OrderReceipt[];
  selectedTable: Tables;
  tables: Tables[];
}

// INITIAL STATE
const initialState: AccountHistoryState = {
  trades: [],
  orderHistory: [],
  // these tables are component specific and should not be in app state
  selectedTable: Tables.OPEN_ORDERS,
  tables: Object.values(Tables),
};

// ASYNC THUNKS
export const fetchAccountHistory = createAsyncThunk<
  SdkResult,
  undefined,
  { state: RootState }
>("accountHistory/fetchAccountHistory", async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const pairAddress = state.pairSelector.address;
  const account = state.radix?.walletData.accounts[0]?.address || "";

  if (!account || !pairAddress) {
    return thunkAPI.rejectWithValue("Account or pairAddress missing");
  }

  const apiResponse = await adex.getAccountOrders(account, pairAddress, 0);
  const plainApiResponse: SdkResult = JSON.parse(JSON.stringify(apiResponse));
  if (plainApiResponse.status === "SUCCESS") {
    return plainApiResponse;
  } else {
    throw new Error(plainApiResponse.message);
  }
});

export const cancelOrder = createAsyncThunk<
  SdkResult,
  { orderId: number; pairAddress: string },
  { state: RootState }
>("accountHistory/cancelOrder", async (payload, thunkAPI) => {
  const state = thunkAPI.getState();
  const rdt = getRdt();

  if (!rdt) {
    throw new Error("RDT is not initialized yet.");
  }

  const txdata = await createCancelTx(
    state,
    payload.orderId,
    payload.pairAddress,
    rdt
  );

  const response = JSON.parse(JSON.stringify(txdata));
  thunkAPI.dispatch(fetchAccountHistory());
  return response;
});

export const requestCancelOrder =
  (orderId: number, pairAddress: string) => async (dispatch: AppDispatch) => {
    dispatch(cancelOrder({ orderId, pairAddress }));
  };

async function createCancelTx(
  state: RootState,
  orderId: number,
  pairAddress: string,
  rdt: RDT
) {
  const account = state.radix?.walletData.accounts[0]?.address || "";

  const createCancelOrderResponse = await adex.createCancelOrderTx(
    pairAddress,
    orderId,
    account
  );

  const submitTransactionResponse = await adex.submitTransaction(
    createCancelOrderResponse.data,
    rdt
  );

  return submitTransactionResponse;
}

// SLICE
// the slice creation function should follow directly after the initialState definition
export const accountHistorySlice = createSlice({
  name: "accountHistory",
  initialState,
  reducers: {
    updateAdex: (state, action: PayloadAction<adex.StaticState>) => {
      const adexState = action.payload;
      state.trades = adexState.currentPairTrades;
    },
    setSelectedTable: (state, action: PayloadAction<Tables>) => {
      state.selectedTable = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchAccountHistory.fulfilled, (state, action) => {
      state.orderHistory = action.payload.data.orders;
    });
  },
});

// SELECTORS
export const { setSelectedTable } = accountHistorySlice.actions;

export const selectFilteredData = createSelector(
  (state: RootState) => state.accountHistory.orderHistory,
  (state: RootState) => state.accountHistory.selectedTable,
  (orderHistory, selectedTable) => {
    switch (selectedTable) {
      case Tables.OPEN_ORDERS:
        return orderHistory.filter((order) => order.status === "PENDING");
      case Tables.ORDER_HISTORY:
        return orderHistory;
      case Tables.TRADE_HISTORY:
        return orderHistory.filter((order) => order.status === "COMPLETED");
      default:
        return orderHistory;
    }
  }
);

export const selectOpenOrders = createSelector(
  (state: RootState) => state.accountHistory.orderHistory,
  (orderHistory) => orderHistory.filter((order) => order.status === "PENDING")
);

export const selectTradeHistory = createSelector(
  (state: RootState) => state.accountHistory.orderHistory,
  (orderHistory) => orderHistory.filter((order) => order.status === "COMPLETED")
);

export const selectTables = (state: RootState) => state.accountHistory.tables;
