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
  hideOtherPairs: boolean;
  orderHistoryAllPairs: adex.OrderReceipt[];
}

// INITIAL STATE
const initialState: AccountHistoryState = {
  trades: [],
  orderHistory: [],
  selectedTable: Tables.OPEN_ORDERS,
  tables: Object.values(Tables),
  selectedOrdersToCancel: {},
  hideOtherPairs: true,
  orderHistoryAllPairs: [],
};

// ASYNC THUNKS
export const fetchAccountHistory = createAsyncThunk<
  SdkResult,
  undefined,
  { state: RootState }
>("accountHistory/fetchAccountHistory", async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const pairAddress = state.pairSelector.address;
  const account = state.radix?.selectedAccount?.address || "";

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

export const fetchAccountHistoryAllPairs = createAsyncThunk<
  adex.OrderReceipt[],
  undefined,
  { state: RootState }
>("accountHistory/fetchAccountHistoryAllPairs", async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const pairAddresses = state.pairSelector.pairsList.map(
    (pairInfo) => pairInfo.address
  );
  // .filter((pairAddress) => pairAddress !== state.pairSelector.address);

  const account = state.radix?.walletData.accounts[0]?.address || "";

  const orderHistoryPromises = pairAddresses.map((pairAddress) =>
    adex.getAccountOrders(account, pairAddress, 0)
  );

  const apiResponses = await Promise.all(orderHistoryPromises);
  const allOrders: adex.OrderReceipt[] = [];

  apiResponses.forEach((apiResponse) => {
    const plainApiResponse: SdkResult = JSON.parse(JSON.stringify(apiResponse));

    if (plainApiResponse.status === "SUCCESS") {
      allOrders.push(...plainApiResponse.data.orders);
    } else {
      console.error(
        `Error fetching orders for pair: ${plainApiResponse.message}`
      );
    }
  });

  return allOrders;
});

export const batchCancel = createAsyncThunk<
  Order[], // return value
  Order[], // input
  { state: RootState }
>("accountHistory/batchCancel", async (payload, thunkAPI) => {
  const state = thunkAPI.getState();
  const orders: Order[] = payload;
  const account = state.radix?.selectedAccount?.address || "";
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
  const account = state.radix?.selectedAccount?.address || "";

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
    setHideOtherPairs: (state, action: PayloadAction<boolean>) => {
      state.hideOtherPairs = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountHistory.fulfilled, (state, action) => {
        state.orderHistory = action.payload.data.orders;
      })
      .addCase(batchCancel.fulfilled, (state) => {
        state.selectedOrdersToCancel = {};
      })
      .addCase(fetchAccountHistoryAllPairs.fulfilled, (state, action) => {
        state.orderHistoryAllPairs = action.payload;
      })
      .addCase(fetchAccountHistoryAllPairs.rejected, (state, action) => {
        console.error("Failed to fetch account history:", action.error.message);
      });
  },
});

// SELECTORS
export const {
  setSelectedTable,
  selectOrderToCancel,
  deselectOrderToCancel,
  resetAccountHistory,
} = accountHistorySlice.actions;

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

// A function that checks an order against a filter condition and returns TRUE if it matches, FALSE otherwise
type FilterFunction = (order: adex.OrderReceipt) => boolean;

let selectCombinedOrders = (filterFunction: FilterFunction) =>
  createSelector(
    (state: RootState) => state.accountHistory.orderHistory,
    (state: RootState) => state.accountHistory.orderHistoryAllPairs,
    (orderHistory, orderHistoryAllPairs) => {
      // Create a Map to handle duplicates
      const orderMap = new Map<number, adex.OrderReceipt>();

      // Add orders from orderHistory
      orderHistory.forEach((order) => {
        orderMap.set(order.id, order);
      });

      // Add orders from orderHistoryAllPairs, will overwrite any duplicates from orderHistory
      orderHistoryAllPairs.forEach((order) => {
        orderMap.set(order.id, order);
      });

      return Array.from(orderMap.values())
        .filter(filterFunction)
        .sort((a, b) => {
          const timeDifference =
            new Date(b.timeSubmitted).getTime() -
            new Date(a.timeSubmitted).getTime();
          if (timeDifference !== 0) {
            return timeDifference;
          } else {
            return b.id - a.id;
          }
        });
    }
  );

// create aliases for calling the selector with different filtering functions
export const selectCombinedOrderHistory = selectCombinedOrders(
  (order) => order.status !== "PENDING"
);
export const selectCombinedOpenOrders = selectCombinedOrders(
  (order) => order.status === "PENDING"
);

// export const selectCombinedOrderHistory = createSelector(
//   (state: RootState) => state.accountHistory.orderHistory,
//   (state: RootState) => state.accountHistory.orderHistoryAllPairs,
//   (orderHistory, orderHistoryAllPairs) => {
//     const combinedOrderHistory = [
//       ...orderHistory.filter((order) => order.status !== "PENDING"),
//       ...orderHistoryAllPairs.filter((order) => order.status !== "PENDING"),
//     ];

//     return combinedOrderHistory.sort((a, b) => {
//       const timeDifference =
//         new Date(b.timeSubmitted).getTime() -
//         new Date(a.timeSubmitted).getTime();
//       if (timeDifference !== 0) {
//         return timeDifference;
//       } else {
//         return b.id - a.id;
//       }
//     });
//   }
// );

// export const selectCombinedOpenOrders = createSelector(
//   (state: RootState) => state.accountHistory.orderHistory,
//   (state: RootState) => state.accountHistory.orderHistoryAllPairs,
//   (orderHistory, orderHistoryAllPairs) => {
//     const combinedOpenOrders = [
//       ...orderHistory.filter((order) => order.status === "PENDING"),
//       ...orderHistoryAllPairs.filter((order) => order.status === "PENDING"),
//     ];

//     return combinedOpenOrders.sort((a, b) => {
//       const timeDifference =
//         new Date(b.timeSubmitted).getTime() -
//         new Date(a.timeSubmitted).getTime();
//       if (timeDifference !== 0) {
//         return timeDifference;
//       } else {
//         return b.id - a.id;
//       }
//     });
//   }
// );

export const selectTables = (state: RootState) => state.accountHistory.tables;

export const { setHideOtherPairs } = accountHistorySlice.actions;
export const { actions, reducer } = accountHistorySlice;
