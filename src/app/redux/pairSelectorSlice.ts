import * as adex from "alphadex-sdk-js";
import { PayloadAction, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { getRdt } from "../subscriptions";

export const AMOUNT_MAX_DECIMALS = adex.AMOUNT_MAX_DECIMALS;

export interface TokenInfo extends adex.TokenInfo {
  balance?: number;
}

export interface PairSelectorState {
  name: string;
  address: string;
  priceMaxDecimals: number;
  token1: TokenInfo;
  token2: TokenInfo;
  pairsList: adex.PairInfo[];
}

export const initalTokenInfo: TokenInfo = {
  address: "",
  symbol: "",
  name: "",
  iconUrl: "",
};

const initialState: PairSelectorState = {
  name: "",
  address: "",
  priceMaxDecimals: 0,
  token1: { ...initalTokenInfo },
  token2: { ...initalTokenInfo },
  pairsList: [],
};

export const fetchBalances = createAsyncThunk<
  undefined, // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
  }
>("pairSelector/fetchToken1Balance", async (_arg, thunkAPI) => {
  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState();

  if (state.pairSelector.address === "") {
    return undefined;
  }

  const rdt = getRdt();
  if (rdt && state.radix.walletData.accounts.length > 0) {
    const tokens = [state.pairSelector.token1, state.pairSelector.token2];

    for (let token of tokens) {
      // separate balance fetching try/catch for each token
      try {
        const response =
          await rdt.gatewayApi.state.innerClient.entityFungibleResourceVaultPage(
            {
              stateEntityFungibleResourceVaultsPageRequest: {
                address: state.radix.walletData.accounts[0].address,
                // eslint-disable-next-line camelcase
                resource_address: token.address,
              },
            }
          );
        // if there are no items in response, set the balance to 0
        const balance = parseFloat(response?.items[0]?.amount || "0");
        dispatch(pairSelectorSlice.actions.setBalance({ balance, token }));
      } catch (error) {
        console.error("pairSelector/fetchBalances:", error);
      }
    }
  }

  return undefined;
});

export const pairSelectorSlice = createSlice({
  name: "pairSelector",
  initialState,

  // synchronous reducers
  reducers: {
    updateAdex: (
      state: PairSelectorState,
      action: PayloadAction<adex.StaticState>
    ) => {
      const adexState = action.payload;

      state.priceMaxDecimals = adexState.currentPairInfo.priceMaxDecimals;

      // unpacking to avoid loosing balances info
      state.token1 = {
        ...state.token1,
        ...adexState.currentPairInfo.token1,
      };
      state.token2 = {
        ...state.token2,
        ...adexState.currentPairInfo.token2,
      };

      state.address = adexState.currentPairAddress;
      state.name = adexState.currentPairInfo.name;
      state.pairsList = adexState.pairsList;
    },

    selectPairAddress: (
      state: PairSelectorState,
      action: PayloadAction<string>
    ) => {
      const pairAddress = action.payload;
      adex.clientState.currentPairAddress = pairAddress;
    },

    setBalance: (
      state: PairSelectorState,
      action: PayloadAction<{ token: TokenInfo; balance: number }>
    ) => {
      const { token, balance } = action.payload;
      if (token.address === state.token1.address) {
        state.token1 = { ...state.token1, balance };
      } else if (token.address === state.token2.address) {
        state.token2 = { ...state.token2, balance };
      }
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchBalances.rejected, (state, action) => {
      state.token1.balance = undefined;
      state.token2.balance = undefined;
      console.error(
        "pairSelector/fetchBalances rejected:",
        action.error.message
      );
    });
  },
});

export const { updateAdex, selectPairAddress } = pairSelectorSlice.actions;
