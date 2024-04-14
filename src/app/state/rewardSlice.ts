import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { getRdt } from "../subscriptions";
import { NonFungibleResourcesCollectionItem } from "@radixdlt/radix-dapp-toolkit";
import {
  getAccountsRewardsApiData,
  getAccountsRewardsFromApiData,
  getOrdersRewardsApiData,
  getOrderRewardsFromApiData,
  AccountRewards,
  OrderRewards,
  createAccountNftId,
} from "./rewardUtils";

export interface RewardState {
  recieptIds: string[];
  rewardsTotal: number;
  rewardData: RewardData;
  config: RewardConfig;
}

interface RewardConfig {
  resourcePrefix: string;
  rewardComponent: string;
  rewardNFTAddress: string;
  rewardOrderAddress: string;
  rewardVaultAddress: string;
  resourceAddresses: {
    [key: string]: {
      resourceAddress: string;
    };
  };
}

function findFieldByName(fieldName: string, fields: any[]) {
  return fields.find((field) => field.field_name === fieldName);
}

export interface RewardData {
  accountsRewards: AccountRewards[];
  ordersRewards: OrderRewards[];
}

//State will default to stokenet values if not provided
const initialState: RewardState = {
  recieptIds: [],
  rewardsTotal: 0,
  rewardData: {
    accountsRewards: [],
    ordersRewards: [],
  },
  config: {
    resourcePrefix:
      process.env.NEXT_PUBLIC_RESOURCE_PREFIX || "account_tdx_2_1",

    // this is the only address that will be specified in the .env file. All the other variables should be read from the component state variables
    rewardComponent:
      process.env.NEXT_PUBLIC_CLAIM_COMPONENT ||
      "component_tdx_2_1czzn503fzras55wyrs9zczxrtvf8fpytmm52rc5g3hsyx9y5dv9zzs",
    rewardNFTAddress: "",
    rewardOrderAddress: "",
    rewardVaultAddress: "",
    resourceAddresses: {
      DEXTERXRD: {
        resourceAddress:
          process.env.NEXT_PUBLIC_RESOURCE_ADDRESS_DEXTERXRD ||
          "resource_tdx_2_1ng6vf9g4d30dw8h6h4t2t6e3mfxrhpw8d0n5dkpzh4xaqzqha57cd2",
      },
    },
  },
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

// when fetching receipts for rewards, you need to fetch receipts for all pairs (not just the DEXTER/XRD pair).
// You can use the existing alphadex api endpoint: /account/orders to get the orders for each pair.
export const fetchReciepts = createAsyncThunk<
  undefined, // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
  }
>("rewards/fetchReciepts", async (_, thunkAPI) => {
  const dispatch = thunkAPI.dispatch;
  const rdt = getRdt();
  if (!rdt) return;
  const claimComponentAddress = process.env.NEXT_PUBLIC_CLAIM_COMPONENT;
  const resourceAddress = process.env.NEXT_PUBLIC_RESOURCE_ADDRESS_DEXTERXRD;
  if (!claimComponentAddress) return;
  const walletData = rdt.walletApi.getWalletData();
  //Todo support multiple wallets ids
  const accountAddress = walletData.accounts[0].address;

  try {
    const response =
      await rdt.gatewayApi.state.innerClient.entityNonFungiblesPage({
        stateEntityNonFungiblesPageRequest: {
          address: accountAddress,
          // eslint-disable-next-line camelcase
          aggregation_level: "Vault",
          // eslint-disable-next-line camelcase
          opt_ins: { non_fungible_include_nfids: true },
        },
      });
    const { items } = response;

    const accountReceiptVault =
      (items.find(
        // eslint-disable-next-line camelcase
        ({ resource_address }) => resource_address === resourceAddress
      ) as NonFungibleResource) || null;

    if (accountReceiptVault && accountReceiptVault?.vaults.items.length > 0) {
      dispatch(
        rewardSlice.actions.updateReciepts(
          accountReceiptVault?.vaults.items[0].items as string[]
        )
      );
    }
  } catch (error) {
    return undefined;
  }

  return undefined;
});

export const fetchAccountRewards = createAsyncThunk<
  AccountRewards[], // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
  }
>("rewards/fetchAccountRewards", async (_, thunkAPI) => {
  const rdt = getRdt();
  if (!rdt) return;

  const state = thunkAPI.getState();

  const walletData = rdt.walletApi.getWalletData();
  //Todo support multiple wallets ids
  const accountAddress = walletData.accounts[0].address;
  const accountRewardData = await getAccountsRewardsApiData(
    [accountAddress],
    state.rewardSlice.config.rewardNFTAddress
  );
  const accountsRewards = await getAccountsRewardsFromApiData(
    accountRewardData
  );
  const serialize = JSON.stringify(accountsRewards);
  return JSON.parse(serialize);
});

export const fetchOrderRewards = createAsyncThunk<
  OrderRewards[], // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
  }
>("rewards/fetchOrderRewards", async (_, thunkAPI) => {
  const rdt = getRdt();
  if (!rdt) return;

  const state = thunkAPI.getState();

  let recieptIds = state.rewardSlice.recieptIds;
  let orderRewards: OrderRewards[] = [];
  if (recieptIds.length > 0) {
    const prefixedReceiptIds = recieptIds.map(
      (id) =>
        `${state.rewardSlice.config.resourceAddresses.DEXTERXRD.resourceAddress}${id}`
    );
    const orderRewardsData = await getOrdersRewardsApiData(
      state.rewardSlice.config.rewardOrderAddress,
      prefixedReceiptIds
    );
    orderRewards = await getOrderRewardsFromApiData(orderRewardsData);
  }
  const serialize = JSON.stringify(orderRewards);
  return JSON.parse(serialize);
});

export const fetchAddresses = createAsyncThunk<
  RewardConfig, // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
  }
>("rewards/fetchAddresses", async (_, thunkAPI) => {
  const rdt = getRdt();
  if (!rdt) return;
  const state = thunkAPI.getState();
  const newConfig = JSON.parse(JSON.stringify(state.rewardSlice.config));

  //Get the state entity
  const component: any =
    await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(
      state.rewardSlice.config.rewardComponent
    );

  newConfig.rewardNFTAddress = findFieldByName(
    "account_rewards_nft_manager",
    component.details?.state.fields
  ).value;

  newConfig.rewardOrderAddress = findFieldByName(
    "order_rewards",
    component.details?.state.fields
  ).value;

  newConfig.rewardVaultAddress = findFieldByName(
    "claim_vaults",
    component.details?.state.fields
  ).value;

  const serialize = JSON.stringify(newConfig);
  return JSON.parse(serialize);
});

export const rewardSlice = createSlice({
  name: "reward",
  initialState,

  // synchronous reducers
  reducers: {
    claimRewards: (state) => {
      const rdt = getRdt();
      if (!rdt) return;

      const recieptIds = state.recieptIds;
      if (recieptIds === null) return;
      if (recieptIds.length === 0) return;

      const walletData = rdt.walletApi.getWalletData();
      const accountAddress = walletData.accounts[0].address;
      const resourceAddress =
        process.env.NEXT_PUBLIC_RESOURCE_ADDRESS_DEXTERXRD;

      //   const nonfungibleLocalId = accountAddress.replace(
      //   new RegExp(state.config.resourcePrefix, "g"),
      //   ""
      // );

      const nftArray = recieptIds
        .map((id) => `NonFungibleLocalId("${id}")`)
        .join(",");

      const claimManifest = `
        CALL_METHOD 
          Address("${accountAddress}") 
          "create_proof_of_non_fungibles" 
          Address("${state.config.rewardNFTAddress}") 
          Array<NonFungibleLocalId>(NonFungibleLocalId("${createAccountNftId(
            accountAddress
          )}")); 
        POP_FROM_AUTH_ZONE 
          Proof("account_proof_1");
          CALL_METHOD Address("${accountAddress}") 
          "create_proof_of_non_fungibles" 
          Address("${resourceAddress}") 
          Array<NonFungibleLocalId>(${nftArray}); 
        CREATE_PROOF_FROM_AUTH_ZONE_OF_ALL 
          Address("${
            state.config.resourceAddresses.DEXTERXRD.resourceAddress
          }")   
          Proof("proof_1");
        CALL_METHOD 
          Address("${state.config.rewardComponent}") 
          "claim_rewards" 
          Array<Proof>(Proof("account_proof_1")) 
          Array<Proof>(Proof("proof_1"));
        CALL_METHOD 
          Address("${accountAddress}") 
          "deposit_batch" 
          Expression("ENTIRE_WORKTOP");
        `;

      rdt.walletApi.sendTransaction({
        transactionManifest: claimManifest,
      });
    },
    getEarnedRewards: (state) => {
      const rdt = getRdt();
      if (!rdt) return;

      const recieptIds = state.recieptIds;
      if (recieptIds === null) return;
      if (recieptIds.length === 0) return;

      const walletData = rdt.walletApi.getWalletData();
      const accountAddress = walletData.accounts[0].address;
      const claimNFTAddress = process.env.NEXT_PUBLIC_CLAIM_NFT_ADDRESS;
      const resourcePrefix = process.env.NEXT_PUBLIC_RESOURCE_PREFIX;
      if (!resourcePrefix) return;
      const nonfungibleLocalId = accountAddress.replace(
        new RegExp(resourcePrefix, "g"),
        ""
      );
      const nftArray = recieptIds
        .map((id) => `NonFungibleLocalId("${id}")`)
        .join(",");

      const claimManifest = `
        CALL_METHOD 
          Address("${accountAddress}") 
          "create_proof_of_non_fungibles" 
          Address("${claimNFTAddress}") 
          Array<NonFungibleLocalId>(NonFungibleLocalId("<${nonfungibleLocalId}>")); 
        POP_FROM_AUTH_ZONE 
          Proof("account_proof_1");
          CALL_METHOD Address("${accountAddress}") 
          "create_proof_of_non_fungibles" 
          Address("${state.config.resourceAddresses.DEXTERXRD.resourceAddress}") 
          Array<NonFungibleLocalId>(${nftArray}); 
        CREATE_PROOF_FROM_AUTH_ZONE_OF_ALL 
          Address("${state.config.resourceAddresses.DEXTERXRD.resourceAddress}")  
          Proof("proof_1");
        CALL_METHOD 
          Address("${state.config.rewardComponent}") 
          "claim_rewards" 
          Array<Proof>(Proof("account_proof_1")) 
          Array<Proof>(Proof("proof_1"));
        CALL_METHOD 
          Address("${accountAddress}") 
          "deposit_batch" 
          Expression("ENTIRE_WORKTOP");
        `;

      rdt.walletApi.sendTransaction({
        transactionManifest: claimManifest,
      });
    },
    updateReciepts: (state, action: PayloadAction<string[]>) => {
      state.recieptIds = action.payload;
    },
    updateRewardsTotal: (state, action: PayloadAction<number>) => {
      state.rewardsTotal = action.payload;
    },
    updateAccountRewards: (state, action: PayloadAction<AccountRewards[]>) => {
      state.rewardData.accountsRewards = action.payload;
    },
    updateConfigNFTAddress: (state, action: PayloadAction<string>) => {
      state.config.rewardNFTAddress = action.payload;
    },
    updateConfigOrderAddress: (state, action: PayloadAction<string>) => {
      state.config.rewardOrderAddress = action.payload;
    },
    updateConfigVaultAddress: (state, action: PayloadAction<string>) => {
      state.config.rewardVaultAddress = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(
        fetchAccountRewards.fulfilled,
        (state, action: PayloadAction<AccountRewards[]>) => {
          state.rewardData.accountsRewards = action.payload;
        }
      )
      .addCase(
        fetchOrderRewards.fulfilled,
        (state, action: PayloadAction<OrderRewards[]>) => {
          state.rewardData.ordersRewards = action.payload;
        }
      )
      .addCase(
        fetchAddresses.fulfilled,
        (state, action: PayloadAction<RewardConfig>) => {
          state.config = action.payload;
        }
      );
    // You can add more cases here
  },
});
