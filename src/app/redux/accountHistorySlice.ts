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
  OPEN_ORDERS = "Open Orders",
  ORDER_HISTORY = "Order History",
  TRADE_HISTORY = "Trade History",
}
export interface AccountHistoryState {
  trades: adex.Trade[];
  orderHistory: adex.OrderReceipt[];
  loading: boolean;
  error: string | null;
  selectedTable: Tables;
  tables: Tables[];
}

// INITIAL STATE
const initialState: AccountHistoryState = {
  trades: [],
  orderHistory: [],
  loading: false,
  error: null,
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
  const plainApiResponse = JSON.parse(JSON.stringify(apiResponse)); //TODO -> need to find a better way to handle serialization
  return plainApiResponse;
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
    builder
      .addCase(fetchAccountHistory.fulfilled, (state, action) => {
        state.orderHistory = action.payload.data.orders;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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

export const selectOpenOrders = (state: RootState) => {
  return state.accountHistory.orderHistory.filter(
    (order) => order.status === "PENDING"
  );
};

export const selectOrderHistory = (state: RootState) => {
  return state.accountHistory.orderHistory;
};

export const selectTradeHistory = (state: RootState) => {
  return state.accountHistory.orderHistory;
};

export const selectTables = (state: RootState) => state.accountHistory.tables;
