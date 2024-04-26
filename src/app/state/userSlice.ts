import {
  StateEntityFungiblesPageRequest,
  WalletDataStateAccount,
} from "@radixdlt/radix-dapp-toolkit";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { rdt } from "../subscriptions";

// define all the types and interfaces unique to the slice
export type AccountData = WalletDataStateAccount;
export interface TokenBalance {
  tokenAddress: string;
  tokenAmount: number;
}
// define the state for the slice
export interface UserState {
  connectedAccounts: AccountData[];
  selectedAccount: AccountData | undefined;
  selectedAccountBalances: TokenBalance[];
}
// set the initial state values for the slice
const initialState: UserState = {
  connectedAccounts: [],
  selectedAccount: undefined,
  selectedAccountBalances: [],
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
    builder.addCase(fetchSelectedAccountBalances.fulfilled, (state, action) => {
      state.selectedAccountBalances = action.payload;
    });
  },
});

// set commmon selectors for the slice
export const connectedAccounts = (state: RootState) =>
  state.user.connectedAccounts;
export const selectedAccount = (state: RootState) => state.user.selectedAccount;

// any async thunks for the slice
export const fetchSelectedAccountBalances = createAsyncThunk<
  TokenBalance[], // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
  }
>("user/fetchSelectedAccountBalances", async (_, thunkAPI) => {
  const dispatch = thunkAPI.dispatch;
  const state: RootState = thunkAPI.getState();

  if (!state.user.selectedAccount || !state.user.selectedAccount.address) {
    dispatch(userSlice.actions.setSelectedAccountBalances([]));
    throw new Error(
      "Error fetching selected account balances. No account selected."
    );
  }
  console.debug(
    "Starting to fetch account balances for account: ",
    state.user.selectedAccount
  );
  let tokenBalances = await fetchAccountBalances(
    state.user.selectedAccount.address
  );
  console.debug("Token balances fetched: ", tokenBalances);
  return tokenBalances;
});

// utility functions
export async function fetchAccountBalances(
  accountAddress: string
): Promise<TokenBalance[]> {
  let result: TokenBalance[] = [];
  let cursor = "";
  let stateVersion = 0;
  try {
    do {
      let requestObject: StateEntityFungiblesPageRequest = {
        address: accountAddress,
        // eslint-disable-next-line camelcase
        aggregation_level: "Global",
      };
      if (cursor) {
        // eslint-disable-next-line camelcase
        requestObject.at_ledger_state = {
          // eslint-disable-next-line camelcase
          state_version: stateVersion,
        };
        requestObject.cursor = cursor;
      }
      let apiResult =
        await rdt.gatewayApi.state.innerClient.entityFungiblesPage({
          stateEntityFungiblesPageRequest: requestObject,
        });
      if (apiResult.next_cursor) {
        cursor = apiResult.next_cursor;
        stateVersion = apiResult.ledger_state.state_version;
      }
      if (apiResult.items && apiResult.items.length > 0) {
        apiResult.items.forEach((tokenBalanceItem) => {
          let newTokenBalance: TokenBalance = {
            tokenAddress: tokenBalanceItem.resource_address,
            // @ts-ignore
            tokenAmount: tokenBalanceItem.amount,
          };
          result.push(newTokenBalance);
        });
      }
    } while (cursor);
  } catch (error) {
    throw new Error(
      "Error fetching account balances for account: " + accountAddress
    );
  }
  return result;
}
