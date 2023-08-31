import { PayloadAction, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./store";
import * as adex from "alphadex-sdk-js";
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";
import { getRdt, RDT } from "../subscriptions";

export interface AccountHistoryState {
  trades: adex.Trade[];
  orderHistory: adex.OrderReceipt[];
  loading: boolean;
  error: string | null;
}

// Async thunk definition
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

// Async thunk for cancelOrder
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

const initialState: AccountHistoryState = {
  trades: [],
  orderHistory: [],
  loading: false,
  error: null,
};

export const accountHistorySlice = createSlice({
  name: "accountHistory",
  initialState,
  reducers: {
    updateAdex: (state, action: PayloadAction<adex.StaticState>) => {
      const adexState = action.payload;
      state.trades = adexState.currentPairTrades;
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
