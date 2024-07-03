import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { getGatewayApiClientOrThrow, getRdtOrThrow } from "../subscriptions";
import {
  AccountRewards,
  OrderRewards,
  createAccountNftId,
  getAccountRewards,
  getOrderRewards,
} from "./rewardUtils";
import { DexterToast } from "../components/DexterToaster";
import * as adex from "alphadex-sdk-js";
import { NonFungibleResourcesCollectionItem } from "@radixdlt/babylon-gateway-api-sdk";

export interface RewardState {
  recieptIds: string[];
  rewardData: RewardData;
  tokensList: adex.TokenInfo[];
  pairsList: adex.PairInfo[];
  config: RewardConfig;
  showSuccessUi: boolean;
}

interface RewardConfig {
  rewardComponent: string;
  rewardNFTAddress: string;
  rewardOrderAddress: string;
  rewardVaultAddress: string;
}

function findFieldValueByNameOrThrow(fieldName: string, fields: any[]): string {
  const targetValue = fields.find(
    (field) => field.field_name === fieldName
  )?.value;
  if (targetValue === undefined) {
    throw new Error("Could not get field value for " + fieldName);
  }
  return targetValue;
}

// Helper function to determine whether the user has rewards to claim
export function getUserHasRewards(rewardData: RewardData): boolean {
  const hasAccountRewards = rewardData.accountsRewards.some(
    (accountRewards) => accountRewards.rewards.length > 0
  );
  const hasOrderRewards = rewardData.ordersRewards.length > 0;
  const userHasRewards = hasAccountRewards || hasOrderRewards;
  return userHasRewards;
}

export interface RewardData {
  accountsRewards: AccountRewards[];
  ordersRewards: OrderRewards[];
}

//State will default to stokenet values if not provided
const initialState: RewardState = {
  recieptIds: [],
  rewardData: {
    accountsRewards: [],
    ordersRewards: [],
  },
  tokensList: [],
  pairsList: [],
  config: {
    rewardComponent: process.env.NEXT_PUBLIC_CLAIM_COMPONENT!,
    rewardNFTAddress: "",
    rewardOrderAddress: "",
    rewardVaultAddress: "",
  },
  showSuccessUi: false,
};

type NonFungibleResource = NonFungibleResourcesCollectionItem & {
  vaults: {
    items: {
      vault_address: string;
      total_count: string;
      items: string;
    }[];
  };
};

export const rewardSlice = createSlice({
  name: "reward",
  initialState,

  // synchronous reducers
  reducers: {
    updateTokensList: (state, action: PayloadAction<adex.TokenInfo[]>) => {
      state.tokensList = action.payload;
    },
    updatePairsList: (state, action: PayloadAction<adex.PairInfo[]>) => {
      state.pairsList = action.payload;
    },
    resetRewardState: (state) => {
      state.recieptIds = [];
      state.rewardData = {
        accountsRewards: [],
        ordersRewards: [],
      };
      state.showSuccessUi = false;
    },
  },

  extraReducers: (builder) => {
    builder
      // fetchAddresses
      .addCase(fetchAddresses.pending, () => {})
      .addCase(
        fetchAddresses.fulfilled,
        (state, action: PayloadAction<FetchAddressesResult>) => {
          state.config.rewardNFTAddress = action.payload.rewardNFTAddress;
          state.config.rewardOrderAddress = action.payload.rewardOrderAddress;
          state.config.rewardVaultAddress = action.payload.rewardVaultAddress;
        }
      )
      .addCase(fetchAddresses.rejected, (state, action) => {
        DexterToast.error("Error fetching claim component addresses");
        console.error(action.error);
      })

      // fetchReciepts
      .addCase(fetchReciepts.pending, (state) => {
        state.recieptIds = [];
      })
      .addCase(fetchReciepts.fulfilled, (state, action) => {
        state.recieptIds = action.payload;
      })
      .addCase(fetchReciepts.rejected, (_, action) => {
        DexterToast.error("Error fetching order receipts");
        console.error(action.error);
      })

      // fetchAccountRewards
      .addCase(fetchAccountRewards.pending, () => {})
      .addCase(
        fetchAccountRewards.fulfilled,
        (state, action: PayloadAction<AccountRewards[]>) => {
          state.rewardData.accountsRewards = action.payload;
        }
      )
      .addCase(fetchAccountRewards.rejected, (_, action) => {
        DexterToast.error("Error fetching account rewards");
        console.error(action.error);
      })

      // fetchOrderRewards
      .addCase(fetchOrderRewards.pending, () => {})
      .addCase(
        fetchOrderRewards.fulfilled,
        (state, action: PayloadAction<OrderRewards[]>) => {
          state.rewardData.ordersRewards = action.payload;
        }
      )
      .addCase(fetchOrderRewards.rejected, (state, action) => {
        DexterToast.error("Error fetching order rewards ");
        console.error(action.error);
      })

      // claimRewards
      .addCase(claimRewards.pending, (state) => {
        state.showSuccessUi = false;
      })
      .addCase(claimRewards.fulfilled, (state, action) => {
        state.showSuccessUi = action.payload;
      })
      .addCase(claimRewards.rejected, (state) => {
        state.showSuccessUi = false;
      });
    // You can add more cases here
  },
});

// Fetches user's NFTs and uses all order receipt NFT addresses from the Adex API
// to filter out relevant NFTs, returning an array of receiptIdentifiers.
export const fetchReciepts = createAsyncThunk<
  string[], // array of receipt identifiers, e.g. "resource_tdx...ayahv#72#"
  adex.PairInfo[], // argument type
  {
    state: RootState;
  }
>("rewards/fetchReciepts", async (pairsList, thunkAPI) => {
  const gatewayApiClient = getGatewayApiClientOrThrow();
  // const walletData = rdt.walletApi.getWalletData();
  const state = thunkAPI.getState();
  const accounts = state.radix.walletData.accounts;
  // Todo support multiple wallets ids
  const accountAddress = accounts[0].address;
  // get all NFTs from your wallet
  const { items } =
    await gatewayApiClient.state.innerClient.entityNonFungiblesPage({
      stateEntityNonFungiblesPageRequest: {
        address: accountAddress,
        // eslint-disable-next-line camelcase
        aggregation_level: "Vault",
        // eslint-disable-next-line camelcase
        opt_ins: { non_fungible_include_nfids: true },
      },
    });
  // load set of orderreceiptAddresses from adex
  let orderReceiptAddresses: Set<string> = new Set();
  pairsList.forEach((pairInfo) =>
    orderReceiptAddresses.add(pairInfo.orderReceiptAddress)
  );
  // iterate through all receipts and extract receiptIdentifier
  const receipts: string[] = [];
  (items as NonFungibleResource[]).forEach((item) => {
    if (
      orderReceiptAddresses.has(item.resource_address) &&
      item.vaults &&
      item.vaults.items &&
      item.vaults.items.length > 0 &&
      item.vaults.items[0].items &&
      item.vaults.items[0].items.length > 0
    ) {
      for (let i = 0; i < item.vaults.items[0].items.length; i++) {
        const orderReceiptId = item.vaults.items[0].items[i];
        receipts.push(`${item.resource_address}${orderReceiptId}`);
      }
    }
  });
  return receipts;
});

export const fetchAccountRewards = createAsyncThunk<
  AccountRewards[], // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
  }
>("rewards/fetchAccountRewards", async (_, thunkAPI) => {
  // const rdt = getRdtOrThrow();
  const state = thunkAPI.getState();
  if (!state.rewardSlice.config.rewardNFTAddress) {
    throw new Error("Missing rewardNFTAddress");
  }
  // const walletData = rdt.walletApi.getWalletData();
  const accounts = state.radix.walletData.accounts;
  if (accounts.length == 0) {
    throw new Error("No accounts connected");
  }
  //Todo support multiple wallets ids
  const accountAddress = accounts[0].address;
  return await getAccountRewards(
    [accountAddress],
    state.rewardSlice.config.rewardNFTAddress
  );
});

export const fetchOrderRewards = createAsyncThunk<
  OrderRewards[], // Return type of the payload creator
  string[], // argument type
  {
    state: RootState;
  }
>("rewards/fetchOrderRewards", async (receiptIds, thunkAPI) => {
  const state = thunkAPI.getState();
  if (!state.rewardSlice.config.rewardOrderAddress) {
    throw new Error("Missing rewardOrderAddress");
  }
  // let recieptIds = state.rewardSlice.recieptIds;
  let orderRewards: OrderRewards[] = [];
  if (receiptIds.length > 0) {
    orderRewards = await getOrderRewards(
      state.rewardSlice.config.rewardOrderAddress,
      receiptIds
    );
  }
  // Deep copying is needed to prevent "A non-serializable value was detected" error
  return JSON.parse(JSON.stringify(orderRewards));
});

interface FetchAddressesResult {
  rewardNFTAddress: string;
  rewardOrderAddress: string;
  rewardVaultAddress: string;
}

export const fetchAddresses = createAsyncThunk<
  FetchAddressesResult, // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
  }
>("rewards/fetchAddresses", async (_, thunkAPI) => {
  const gatewayApiClient = getGatewayApiClientOrThrow();
  const state = thunkAPI.getState();
  if (!state.rewardSlice.config.rewardComponent) {
    throw new Error("Missing rewardComponent address");
  }
  // Get the state entity
  const component: any =
    await gatewayApiClient.state.getEntityDetailsVaultAggregated(
      state.rewardSlice.config.rewardComponent
    );

  // Find relevant fields. Throws an error if field was not found
  return {
    rewardNFTAddress: findFieldValueByNameOrThrow(
      "account_rewards_nft_manager",
      component.details.state.fields
    ),
    rewardOrderAddress: findFieldValueByNameOrThrow(
      "order_rewards",
      component.details.state.fields
    ),
    rewardVaultAddress: findFieldValueByNameOrThrow(
      "claim_vaults",
      component.details.state.fields
    ),
  };
});

export const claimRewards = createAsyncThunk<
  boolean, // returns true if successfull, throws on error, should never return false
  undefined, // argument type
  {
    state: RootState;
  }
>("rewards/claimRewards", async (_, thunkAPI) => {
  const rdt = getRdtOrThrow();
  const state = thunkAPI.getState().rewardSlice;

  const rewardOrdersMap: Map<string, number[]> = new Map();
  state.rewardData.ordersRewards.forEach((orderRewardData) => {
    let existingOrderIds = rewardOrdersMap.get(
      orderRewardData.orderReceiptAddress
    );
    if (!existingOrderIds) {
      existingOrderIds = [];
    }
    existingOrderIds.push(orderRewardData.orderId);
    rewardOrdersMap.set(orderRewardData.orderReceiptAddress, existingOrderIds);
  });

  let claimRewardsManifest = "";
  // create a manifest to create a proof of all accountRewardNfts in the current account
  const walletData = rdt.walletApi.getWalletData();
  const accountAddress = walletData.accounts[0].address;
  let accountNftIds = state.rewardData.accountsRewards.map(
    (accountRewards) =>
      `NonFungibleLocalId("${createAccountNftId(
        accountRewards.accountAddress
      )}")`
  );
  let accountsNftProofString = "";
  if (accountNftIds.length > 0) {
    accountsNftProofString = 'Proof("account_reward_nft_proof")';
    const createAccountRewardNftProofManifest = `
          CALL_METHOD 
          Address("${accountAddress}") 
          "create_proof_of_non_fungibles" 
          Address("${state.config.rewardNFTAddress}") 
          Array<NonFungibleLocalId>(${accountNftIds.join()}); 
          POP_FROM_AUTH_ZONE ${accountsNftProofString};
        `;
    claimRewardsManifest =
      claimRewardsManifest + createAccountRewardNftProofManifest;
  }

  // create a manifest to create a proof for all orderReceipts (that have claimable rewards)
  let pairOrdersProofsNames: string[] = [];
  let index = 0;
  rewardOrdersMap.forEach((pairOrderIds, pairOrderReceiptAddress) => {
    index++;
    const pairOrdersProofName = "pair_orders_proof_" + index;
    pairOrdersProofsNames.push('Proof("' + pairOrdersProofName + '")');
    const pairOrderIdsString = pairOrderIds
      .map((orderId) => 'NonFungibleLocalId("#' + orderId + '#")')
      .join();
    const createPairOrderRewardsProofManifest = `
          CALL_METHOD Address("${accountAddress}") 
          "create_proof_of_non_fungibles" 
          Address("${pairOrderReceiptAddress}") 
          Array<NonFungibleLocalId>(${pairOrderIdsString});
          POP_FROM_AUTH_ZONE 
            Proof("${pairOrdersProofName}");
        `;
    claimRewardsManifest =
      claimRewardsManifest + createPairOrderRewardsProofManifest;
  });

  claimRewardsManifest =
    claimRewardsManifest +
    `
        CALL_METHOD 
          Address("${state.config.rewardComponent}") 
          "claim_rewards" 
          Array<Proof>(${accountsNftProofString}) 
          Array<Proof>(${pairOrdersProofsNames.join()});
        CALL_METHOD 
          Address("${accountAddress}") 
          "deposit_batch" 
          Expression("ENTIRE_WORKTOP");
        `;
  const transactionResult = await rdt.walletApi.sendTransaction({
    transactionManifest: claimRewardsManifest,
  });
  if (!transactionResult.isOk()) {
    throw new Error("Transaction failed");
  }
  return true;
});
