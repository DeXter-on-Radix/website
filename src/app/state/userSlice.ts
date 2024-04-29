import { WalletDataStateAccount } from "@radixdlt/radix-dapp-toolkit";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { OrderSide, OrderStatus, OrderType } from "alphadex-sdk-js";
import {
  fetchSelectedAccountBalances,
  fetchSelectedAccountOrders,
} from "./userThunks";

// define all the types and interfaces unique to the slice
export type AccountData = WalletDataStateAccount;
export type LoadingStatus = "NOT_STARTED" | "LOADING" | "FINISHED";
export interface TokenBalance {
  tokenAddress: string;
  tokenAmount: number;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  iconUrl: string;
}

export interface OrderData {
  uniqueId: string;
  pairAddress: string;
  pairName: string;
  id: number;
  orderType: OrderType;
  specifiedSide: OrderSide;
  specifiedToken: string;
  side: OrderSide;
  amount: number;
  price: number;
  exchange_fee: number;
  platform_fee: number;
  liquidity_fee: number;
  status: OrderStatus;
  completedPerc: number;
  amountFilled: number;
  token1Filled: number;
  token2Filled: number;
  trades: number[];
  unclaimedToken: string;
  unclaimedTokenAmount: number;
  timeSubmitted: string;
  timeCompleted: string;
}

export interface OrderIdResult {
  uniqueId: string;
  orderIdString: string;
  receiptAddress: string;
}

export interface OrderVaultsAndIdsResult {
  vaultAddress: string;
  receiptAddress: string;
  orderIds: string[];
  cursor?: string;
  stateVersion?: number;
}

// define the state for the slice
export interface UserState {
  connectedAccounts: AccountData[];
  selectedAccount: AccountData | undefined;
  selectedAccountBalances: TokenBalance[];
  selectedAccountOrders: OrderData[];
  balancesLoadingStatus: LoadingStatus;
  ordersLoadingStatus: LoadingStatus;
}
// set the initial state values for the slice
const initialState: UserState = {
  connectedAccounts: [],
  selectedAccount: undefined,
  selectedAccountBalances: [],
  selectedAccountOrders: [],
  balancesLoadingStatus: "NOT_STARTED",
  ordersLoadingStatus: "NOT_STARTED",
};

// create the slice
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setConnectedAccounts: (state, action: PayloadAction<AccountData[]>) => {
      state.connectedAccounts = action.payload;
    },
    setSelectedAccount: (
      state,
      action: PayloadAction<AccountData | undefined>
    ) => {
      state.selectedAccount = action.payload;
      console.debug("Selected account changed: ", state.selectedAccount);
    },
    setSelectedAccountBalances: (
      state,
      action: PayloadAction<TokenBalance[]>
    ) => {
      state.selectedAccountBalances = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSelectedAccountBalances.pending, (state) => {
      state.balancesLoadingStatus = "LOADING";
    });
    builder.addCase(
      fetchSelectedAccountBalances.fulfilled,
      (state, action: PayloadAction<TokenBalance[]>) => {
        state.selectedAccountBalances = action.payload;
        state.balancesLoadingStatus = "FINISHED";
      }
    );
    builder.addCase(fetchSelectedAccountOrders.pending, (state) => {
      state.ordersLoadingStatus = "LOADING";
    });
    builder.addCase(
      fetchSelectedAccountOrders.fulfilled,
      (state, action: PayloadAction<OrderData[]>) => {
        state.selectedAccountOrders = [
          ...state.selectedAccountOrders,
          ...action.payload,
        ];
        state.ordersLoadingStatus = "FINISHED";
      }
    );
  },
});

// set commmon selectors for the slice
export const connectedAccounts = (state: RootState) =>
  state.user.connectedAccounts;
export const selectedAccount = (state: RootState) => state.user.selectedAccount;
