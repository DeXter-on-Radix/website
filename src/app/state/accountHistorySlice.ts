import {
  PayloadAction,
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "./store";
import * as adex from "alphadex-sdk-js";
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";
import { getRdt, getRdtOrThrow, RDT } from "../subscriptions";
import {
  getBatchCancelManifest,
  getOrderIdentifier,
} from "../components/AccountHistoryUtils";

// TYPES AND INTERFACES
export enum Tables {
  OPEN_ORDERS = "OPEN_ORDERS",
  ORDER_HISTORY = "ORDER_HISTORY",
}

export interface Order {
  pairAddress: string;
  orderReceiptId: string;
  orderReceiptAddress: string;
}

export interface AccountHistoryState {
  trades: adex.Trade[];
  orderHistory: adex.OrderReceipt[];
  selectedTable: Tables;
  tables: Tables[];
  selectedOrdersToCancel: Record<string, Order>; // the key is `${orderRecieptAddress}_${nftRecieptId}`
}

// INITIAL STATE
const initialState: AccountHistoryState = {
  trades: [],
  orderHistory: [],
  selectedTable: Tables.OPEN_ORDERS,
  tables: Object.values(Tables),
  selectedOrdersToCancel: {},
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

export const batchCancel = createAsyncThunk<
  Order[], // return value
  Order[], // input
  { state: RootState }
>("accountHistory/batchCancel", async (payload, thunkAPI) => {
  const state = thunkAPI.getState();
  const orders: Order[] = payload;
  const account = state.radix?.walletData.accounts[0]?.address || "";
  if (!account) {
    return thunkAPI.rejectWithValue("Account missing");
  }
  const rdt = getRdtOrThrow();
  const result = await rdt.walletApi.sendTransaction({
    transactionManifest: getBatchCancelManifest({
      userAccount: account,
      orders: orders,
    }),
    version: 1,
  });
  if (result.isErr()) {
    throw new Error(`Problem with submitting tx. ${result.error.message}`);
  }
  thunkAPI.dispatch(fetchAccountHistory());
  return orders;
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
    resetAccountHistory: () => {
      return initialState;
    },
    setSelectedTable: (state, action: PayloadAction<Tables>) => {
      state.selectedTable = action.payload;
    },
    selectOrderToCancel: (state, action: PayloadAction<Order>) => {
      const order = action.payload;
      const orderIdentifier = getOrderIdentifier(order);
      state.selectedOrdersToCancel[orderIdentifier] = order;
    },
    deselectOrderToCancel: (state, action: PayloadAction<Order>) => {
      const order = action.payload;
      const orderIdentifier = getOrderIdentifier(order);
      delete state.selectedOrdersToCancel[orderIdentifier];
    },
    resetSelectedOrdersToCancel: (state) => {
      state.selectedOrdersToCancel = {};
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchAccountHistory.fulfilled, (state, action) => {
      state.orderHistory = action.payload.data.orders;
    });
    builder.addCase(batchCancel.fulfilled, (state) => {
      state.selectedOrdersToCancel = {};
    });
  },
});

// SELECTORS
export const { setSelectedTable, selectOrderToCancel, deselectOrderToCancel } =
  accountHistorySlice.actions;

// TODO: possibly remove, as this selector seems to not be used anywhere in the code
export const selectFilteredData = createSelector(
  (state: RootState) => state.accountHistory.orderHistory,
  (state: RootState) => state.accountHistory.selectedTable,
  (orderHistory, selectedTable) => {
    switch (selectedTable) {
      case Tables.OPEN_ORDERS:
        return orderHistory.filter((order) => order.status === "PENDING");
      case Tables.ORDER_HISTORY:
        return orderHistory;
      default:
        return orderHistory;
    }
  }
);

export const selectOpenOrders = createSelector(
  (state: RootState) => state.accountHistory.orderHistory,
  (orderHistory) => orderHistory.filter((order) => order.status === "PENDING")
);

export const selectOrderHistory = createSelector(
  (state: RootState) => state.accountHistory.orderHistory,
  (orderHistory) => orderHistory.filter((order) => order.status !== "PENDING")
);

export const selectTables = (state: RootState) => state.accountHistory.tables;
