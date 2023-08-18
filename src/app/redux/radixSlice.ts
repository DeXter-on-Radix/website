import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { pairSelectorSlice } from "./pairSelectorSlice";
import { Subscription } from "rxjs";
import {
  DataRequestBuilder,
  RadixDappToolkit,
  WalletDataState,
} from "@radixdlt/radix-dapp-toolkit";
import { store } from "./store";

export type WalletData = WalletDataState;
export type RDT = ReturnType<typeof RadixDappToolkit>;

let rdtInstance: null | RadixDappToolkit = null;
export function initilizeRdt(subs: Subscription[]): Subscription[] {
  rdtInstance = RadixDappToolkit({
    dAppDefinitionAddress:
      "account_tdx_d_12yhr42q497c46lr9vxkfsln9e9f3kjj8t5qexznpeq3ewxxqnhm527",
    networkId: 13,
  });
  rdtInstance.walletApi.setRequestData(
    DataRequestBuilder.accounts().exactly(1)
  );
  subs.push(
    rdtInstance.walletApi.walletData$.subscribe((walletData: WalletData) => {
      const data: WalletData = JSON.parse(JSON.stringify(walletData));
      store.dispatch(radixSlice.actions.setWalletData(data));

      // TODO: maybe we can subscribe to the token balances somewhere
      store.dispatch(fetchBalances());
    })
  );

  return subs;
}
export function getRdt() {
  return rdtInstance;
}

export interface RadixState {
  walletData: WalletData;
  isConnected: boolean;
}

const initialState: RadixState = {
  walletData: {
    accounts: [],
    personaData: [],
    proofs: [],
  },
  isConnected: false,
};

export const fetchBalances = createAsyncThunk<
  undefined, // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
  }
>("radix/fetchBalances", async (_arg, thunkAPI) => {
  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState();

  if (state.pairSelector.address === "") {
    return undefined;
  }

  const rdt = getRdt();
  if (rdt && state.radix.walletData.accounts.length > 0) {
    const tokens = [state.pairSelector.token1, state.pairSelector.token2];

    for (let token of tokens) {
      const response =
        await rdt.gatewayApi.state.innerClient.entityFungibleResourceVaultPage({
          stateEntityFungibleResourceVaultsPageRequest: {
            address: state.radix.walletData.accounts[0].address,
            // eslint-disable-next-line camelcase
            resource_address: token.address,
          },
        });
      const balance = parseFloat(response ? response.items[0].amount : "0");
      dispatch(pairSelectorSlice.actions.setBalance({ balance, token }));
    }
  }

  return undefined;
});

export const radixSlice = createSlice({
  name: "radix",
  initialState,

  // synchronous reducers
  reducers: {
    setWalletData: (state: RadixState, action: PayloadAction<WalletData>) => {
      state.walletData = action.payload;
    },
  },

  // asynchronous reducers
  extraReducers: (builder) => {
    builder.addCase(fetchBalances.rejected, (state, action) => {
      console.error("radix/fetchBalances rejected:", action.error.message);
    });
  },
});

export default radixSlice.reducer;
