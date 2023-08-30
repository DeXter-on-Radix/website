import { PayloadAction, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./store";
import * as adex from "alphadex-sdk-js";
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";

export interface AccountHistoryState {
  trades: adex.Trade[];
  orderHistory: adex.OrderReceipt[];
}

// Async thunk definition
export const fetchAccountHistory = createAsyncThunk<
  SdkResult, // This is the type of the returned response, modify as needed
  undefined, // This means we're not expecting any arguments when dispatching this action
  { state: RootState } // This is the type for thunkAPI
>("accountHistory/fetchAccountHistory", async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const pairAddress = state.pairSelector.address;
  const account = state.radix?.walletData.accounts[0]?.address || "";

  console.log(pairAddress);
  console.log(account);
  if (!account || !pairAddress) {
    return thunkAPI.rejectWithValue("Account or pairAddress missing");
  }

  const apiResponse = await adex.getAccountOrders(account, pairAddress, 0);
  const plainApiResponse = JSON.parse(JSON.stringify(apiResponse));
  //console.log(apiResponse.data.orders);
  console.log(plainApiResponse);
  return plainApiResponse;
});

const initialState: AccountHistoryState = {
  trades: [],
  orderHistory: [],
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
    builder.addCase(fetchAccountHistory.fulfilled, (state, action) => {
      // Assuming that the apiResponse contains the order history data directly
      state.orderHistory = action.payload.data.orders;
    });
  },
});
