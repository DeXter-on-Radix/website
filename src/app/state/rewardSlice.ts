import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { getRdt } from "../subscriptions";
import { NonFungibleResourcesCollectionItem } from "@radixdlt/radix-dapp-toolkit";
import {
  getOrdersRewardsApiData,
  getOrderRewardsFromApiData,
  AccountRewards,
  OrderRewards,
  createAccountNftId,
  getAccountRewards,
} from "./rewardUtils";
import { DexterToast } from "components/DexterToaster";
// import { loadOrderReceiptNftAddressDict } from "data/loadData";
import * as adex from "alphadex-sdk-js";

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

function findFieldValueByNameOrThrow(fieldName: string, fields: any[]): string {
  const targetValue = fields.find(
    (field) => field.field_name === fieldName
  )?.value;
  if (targetValue === undefined) {
    throw new Error("Could not get field value for " + fieldName);
  }
  return targetValue;
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
  string[], // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
  }
>("rewards/fetchReciepts", async () => {
  const rdt = getRdt();
  if (!rdt) {
    throw new Error("RDT initialization failed");
  }
  const walletData = rdt.walletApi.getWalletData();
  // Todo support multiple wallets ids
  const accountAddress = walletData.accounts[0].address;
  // get all NFTs from your wallet
  const { items } =
    await rdt.gatewayApi.state.innerClient.entityNonFungiblesPage({
      stateEntityNonFungiblesPageRequest: {
        address: accountAddress,
        // eslint-disable-next-line camelcase
        aggregation_level: "Vault",
        // eslint-disable-next-line camelcase
        opt_ins: { non_fungible_include_nfids: true },
      },
    });

  // init result
  let orderReceiptAddresses: Set<string> = new Set();
  adex.clientState.pairsList.forEach((pairInfo) =>
    orderReceiptAddresses.add(pairInfo.orderReceiptAddress)
  );
  const receipts: string[] = [];
  // loop through all nfts and extract the relevant ones
  // const orderReceiptNftAddressDict = loadOrderReceiptNftAddressDict(
  //   process.env.NEXT_PUBLIC_NETWORK
  // );
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
  const rdt = getRdt();
  if (!rdt) {
    throw new Error("RDT initialization failed");
  }
  const state = thunkAPI.getState();
  if (!state.rewardSlice.config.rewardNFTAddress) {
    throw new Error("Missing rewardNFTAddress");
  }
  const walletData = rdt.walletApi.getWalletData();
  //Todo support multiple wallets ids
  const accountAddress = walletData.accounts[0].address;
  return await getAccountRewards(
    [accountAddress],
    state.rewardSlice.config.rewardNFTAddress
  );
});

export const fetchOrderRewards = createAsyncThunk<
  OrderRewards[], // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
  }
>("rewards/fetchOrderRewards", async (_, thunkAPI) => {
  const rdt = getRdt();
  if (!rdt) {
    throw new Error("RDT initialization failed");
  }
  const state = thunkAPI.getState();
  if (!state.rewardSlice.config.rewardOrderAddress) {
    throw new Error("Missing rewardOrderAddress");
  }
  let recieptIds = state.rewardSlice.recieptIds;
  let orderRewards: OrderRewards[] = [];
  if (recieptIds.length > 0) {
    const orderRewardsData = await getOrdersRewardsApiData(
      state.rewardSlice.config.rewardOrderAddress,
      recieptIds
    );
    orderRewards = await getOrderRewardsFromApiData(orderRewardsData);
  }
  // TODO(dcts): remove deep copying and test if still works
  const serialize = JSON.stringify(orderRewards);
  return JSON.parse(serialize);
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
  const rdt = getRdt();
  if (!rdt) {
    throw new Error("RDT initialization failed");
  }
  const state = thunkAPI.getState();
  if (!state.rewardSlice.config.rewardComponent) {
    throw new Error("Missing rewardComponent address");
  }
  // Get the state entity
  const component: any =
    await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(
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

export const rewardSlice = createSlice({
  name: "reward",
  initialState,

  // synchronous reducers
  reducers: {
    // TODO(dcts): refactor to asyncThunk
    claimRewards: (state) => {
      const rdt = getRdt();
      if (!rdt) return;

      const walletData = rdt.walletApi.getWalletData();
      const accountAddress = walletData.accounts[0].address;

      const rewardOrdersMap: Map<string, number[]> = new Map();
      state.rewardData.ordersRewards.forEach((orderRewardData) => {
        let existingOrderIds = rewardOrdersMap.get(
          orderRewardData.orderReceiptAddress
        );
        if (!existingOrderIds) {
          existingOrderIds = [];
        }
        existingOrderIds.push(orderRewardData.orderId);
        rewardOrdersMap.set(
          orderRewardData.orderReceiptAddress,
          existingOrderIds
        );
      });

      let claimRewardsManifest = "";
      // create a manifest to create a proof of all accountRewardNfts
      const createAccountRewardNftProofManifest = `
        CALL_METHOD 
        Address("${accountAddress}") 
        "create_proof_of_non_fungibles" 
        Address("${state.config.rewardNFTAddress}") 
        Array<NonFungibleLocalId>(NonFungibleLocalId("${createAccountNftId(
          accountAddress
        )}")); 
        POP_FROM_AUTH_ZONE 
          Proof("account_reward_nft_proof");
      `;
      claimRewardsManifest =
        claimRewardsManifest + createAccountRewardNftProofManifest;

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
          Array<Proof>(Proof("account_reward_nft_proof")) 
          Array<Proof>(${pairOrdersProofsNames.join()});
        CALL_METHOD 
          Address("${accountAddress}") 
          "deposit_batch" 
          Expression("ENTIRE_WORKTOP");
        `;
      console.log("Calling claim rewards tx manifest: ", claimRewardsManifest);
      rdt.walletApi.sendTransaction({
        transactionManifest: claimRewardsManifest,
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
      // fetchAddresses
      .addCase(fetchAddresses.pending, () => {
        console.log("fetchAddresses is pending...");
      })
      .addCase(
        fetchAddresses.fulfilled,
        (state, action: PayloadAction<FetchAddressesResult>) => {
          DexterToast.success("Component addresses fetched");
          state.config.rewardNFTAddress = action.payload.rewardNFTAddress;
          state.config.rewardOrderAddress = action.payload.rewardOrderAddress;
          state.config.rewardVaultAddress = action.payload.rewardVaultAddress;
        }
      )
      .addCase(fetchAddresses.rejected, (state, action) => {
        DexterToast.error("fetchAddresses rejected: " + action.error?.message);
        console.log("fetchAddresses was rejected...");
        console.log(action);
      })

      // fetchReciepts
      .addCase(fetchReciepts.pending, () => {
        console.log("fetchReciepts is pending...");
      })
      .addCase(fetchReciepts.fulfilled, (state, action) => {
        DexterToast.success("fetchReciepts fulfilled");
        state.recieptIds = action.payload;
        console.log("fetchReciepts was fulfilled!");
        console.log(action);
      })
      .addCase(fetchReciepts.rejected, (state, action) => {
        DexterToast.error("fetchReciepts rejected: " + action.error?.message);
        console.log("fetchReciepts was rejected...");
        console.log(action);
      })

      // fetchAccountRewards
      .addCase(fetchAccountRewards.pending, () => {
        console.log("fetchAccountRewards pending...");
      })
      .addCase(
        fetchAccountRewards.fulfilled,
        (state, action: PayloadAction<AccountRewards[]>) => {
          DexterToast.success("fetchAccountRewards fulfilled");
          console.log("fetchAccountRewards fulfilled");
          state.rewardData.accountsRewards = action.payload;
        }
      )
      .addCase(fetchAccountRewards.rejected, (state, action) => {
        DexterToast.error(
          "fetchAccountRewards rejected: " + action.error?.message
        );
        console.log("fetchAccountRewards rejected");
        console.log(action);
      })

      // fetchOrderRewards
      .addCase(fetchOrderRewards.pending, () => {
        console.log("fetchOrderRewards pending...");
      })
      .addCase(
        fetchOrderRewards.fulfilled,
        (state, action: PayloadAction<OrderRewards[]>) => {
          DexterToast.success("fetchOrderRewards fulfilled");
          console.log("fetchOrderRewards fulfilled");
          console.log(action);
          state.rewardData.ordersRewards = action.payload;
        }
      )
      .addCase(fetchOrderRewards.rejected, (state, action) => {
        DexterToast.error(
          "fetchOrderRewards rejected: " + action.error?.message
        );
        console.log("fetchOrderRewards rejected");
        console.log(action);
      });
    // You can add more cases here
  },
});
