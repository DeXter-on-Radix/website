import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { getRdt } from "../subscriptions";
import { NonFungibleResourcesCollectionItem } from "@radixdlt/radix-dapp-toolkit";
import {
  getAccountsRewardsApiData,
  getAccountsRewardsFromApiData,
  getOrdersRewardsApiData,
  getOrderRewardsFromApiData,
  OrderRewards,
} from "./rewardUtils";

import * as adex from "alphadex-sdk-js";

export interface RewardState {
  recieptIds: string[];
  rewardsTotal: number;
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

//State will default to stokenet values if not provided
const initialState: RewardState = {
  recieptIds: [],
  config: {
    resourcePrefix:
      process.env.NEXT_PUBLIC_RESOURCE_PREFIX || "account_tdx_2_1",
    rewardComponent:
      process.env.NEXT_PUBLIC_CLAIM_COMPONENT ||
      "component_tdx_2_1cplmpwere04zemtjdryuaf5km5epmu4ek2vcgactekcf9r8255y6l9",
    rewardNFTAddress:
      process.env.NEXT_PUBLIC_CLAIM_NFT_ADDRESS ||
      "resource_tdx_2_1n27yfyf74vfftp96035f2t7f6usaljkc33mja5jhya4mjk334xp7ns",
    rewardOrderAddress:
      process.env.NEXT_PUBLIC_CLAIM_ORDER_ADDRESS ||
      "internal_keyvaluestore_tdx_2_1kqm23mcrv2g9ml4u4d0jm9v5l8dhuwznuufc4gvzvstw2cu05xsnmn",
    rewardVaultAddress:
      process.env.NEXT_PUBLIC_CLAIM_VAULT_ADDRESS ||
      "internal_keyvaluestore_tdx_2_1kqy9qv7nr7mc42fm7nlhald7g4lyzazrwyjsu8zwxsqmzjv6j7wcnn",
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

//claim_orders key pair data
//internal_keyvaluestore_tdx_2_1kqm23mcrv2g9ml4u4d0jm9v5l8dhuwznuufc4gvzvstw2cu05xsnmn

//Look at the entity details
// at component_tdx_2_1cplmpwere04zemtjdryuaf5km5epmu4ek2vcgactekcf9r8255y6l9

//claim_vaults holds tokens
//internal_keyvaluestore_tdx_2_1kqy9qv7nr7mc42fm7nlhald7g4lyzazrwyjsu8zwxsqmzjv6j7wcnn

//ORder reciept
//resource manager of order reciept#NFTORDERID#
/*
{
  "key_value_store_address": "internal_keyvaluestore_tdx_2_1krtvlqrgffvdkd9r53avj74fnvm4rxvjyk70c59ytd63y0ecrgjqeu",
  "keys": [
    {
      "key_json": {
        "kind": "Tuple",
        "fields": [
          {
             "kind": "String",
              "value": "resource_tdx_2_1ng6vf9g4d30dw8h6h4t2t6e3mfxrhpw8d0n5dkpzh4xaqzqha57cd2:#272#"
          }
        ]
      }
    }
  ]
}
*/

export const fetchReciepts = createAsyncThunk<
  undefined, // Return type of the payload creator
  undefined, // argument type
  {
    state: RewardState;
  }
>("claims/fetchReciepts", async (_, thunkAPI) => {
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

export const fetchRewards = createAsyncThunk<
  undefined, // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
  }
>("claims/fetchRewards", async (_, thunkAPI) => {
  console.log("Fetching rewards");
  const state = thunkAPI.getState();
  const dispatch = thunkAPI.dispatch;

  //console.log(state.config);
  const rdt = getRdt();
  if (!rdt) return;
  const claimComponentAddress = process.env.NEXT_PUBLIC_CLAIM_COMPONENT;
  if (!claimComponentAddress) return;

  const claimNFTAddress = process.env.NEXT_PUBLIC_CLAIM_NFT_ADDRESS;
  if (!claimNFTAddress) return;

  const walletData = rdt.walletApi.getWalletData();
  //Todo support multiple wallets ids
  const accountAddress = walletData.accounts[0].address;
  const resourcePrefix = process.env.NEXT_PUBLIC_RESOURCE_PREFIX;
  if (!resourcePrefix) return;
  console.log("Starting logic");
  try {
    let recieptIds = state.rewardSlice.recieptIds;
    if (recieptIds.length <= 0) return;
    const accountRewardData = await getAccountsRewardsApiData([accountAddress]);
    const accountRewards = (
      await getAccountsRewardsFromApiData(accountRewardData)
    )[0].rewards[0].tokenRewards[0].amount;
    const prefixedReceiptIds = recieptIds.map(
      (id) =>
        `${state.rewardSlice.config.resourceAddresses.DEXTERXRD.resourceAddress}${id}`
    );

    const eligibleAddresses = [
      state.rewardSlice.config.resourceAddresses.DEXTERXRD.resourceAddress,
    ];
    //console.log(apiResponse);
    const c = await getOrdersRewardsApiData(
      "internal_keyvaluestore_tdx_2_1kzd9du9jmjlxdfcthgwtwlsug6z05hw0r864mwhhtgay3yxvuqdvds",
      prefixedReceiptIds
    );
    const d = await getOrderRewardsFromApiData(c);
    const sumTokenRewards = (orders: OrderRewards[]): number => {
      return orders.reduce((total, order) => {
        const orderTotal = order.rewards.reduce((rewardTotal, reward) => {
          const tokenTotal = reward.tokenRewards.reduce(
            (tokenSum, tokenReward) => {
              return tokenSum + parseFloat(tokenReward.amount);
            },
            0
          );
          return rewardTotal + tokenTotal;
        }, 0);
        return total + orderTotal;
      }, 0);
    };
    const total = parseFloat(sumTokenRewards(d)) + parseFloat(accountRewards);
    console.log(total);
    //Get any rewards attached to the account
    /*
    const response = await rdt.gatewayApi.state.getNonFungibleData(
      claimNFTAddress,
      `<${nonfungibleLocalId}>`
    );
    console.log(response);
    const name: { value: string; field_name: string } | undefined = (
      response.data?.programmatic_json as any
    ).fields.find((nfData: any) => nfData.field_name === "rewards");
    return name?.entries[0].value.entries[0].value.value;
    */
    dispatch(rewardSlice.actions.updateRewardsTotal(total));

    return total;
  } catch (error) {
    console.log(error);
    return undefined;
  }

  return undefined;
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

      const nonfungibleLocalId = accountAddress.replace(
        new RegExp(state.config.resourcePrefix, "g"),
        ""
      );

      const nftArray = recieptIds
        .map((id) => `NonFungibleLocalId("${id}")`)
        .join(",");

      const claimManifest = `
        CALL_METHOD 
          Address("${accountAddress}") 
          "create_proof_of_non_fungibles" 
          Address("${state.config.rewardNFTAddress}") 
          Array<NonFungibleLocalId>(NonFungibleLocalId("<${nonfungibleLocalId}>")); 
        POP_FROM_AUTH_ZONE 
          Proof("account_proof_1");
          CALL_METHOD Address("${accountAddress}") 
          "create_proof_of_non_fungibles" 
          Address("${resourceAddress}") 
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
  },
});
