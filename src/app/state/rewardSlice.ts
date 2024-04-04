import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { getRdt } from "../subscriptions";
import {
  NonFungibleResourcesCollectionItem,
  State,
  StateApi,
  StateNonFungibleDetailsResponseItem,
  ProgrammaticScryptoSborValueTupleAllOfFromJSONTyped,
  ProgrammaticScryptoSborValueMapAllOfFromJSON,
  StateNonFungibleDataRequestFromJSONTyped,
  instanceOfProgrammaticScryptoSborValueMapAllOf,
  ProgrammaticScryptoSborValueMapAllOfFromJSONTyped,
  ProgrammaticScryptoSborValueTupleFromJSONTyped,
  ProgrammaticScryptoSborValueMapFromJSONTyped,
  ProgrammaticScryptoSborV,
} from "@radixdlt/radix-dapp-toolkit";

export interface RewardState {
  recieptIds: string[];
}

const initialState: RewardState = {
  recieptIds: [],
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

export const fetchReciepts = createAsyncThunk<
  undefined, // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
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
        claimSlice.actions.updateReciepts(
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
  console.log("fetchRewards");
  const dispatch = thunkAPI.dispatch;
  const rdt = getRdt();
  if (!rdt) return;
  const claimComponentAddress = process.env.NEXT_PUBLIC_CLAIM_COMPONENT;
  const claimNFTAddress = process.env.NEXT_PUBLIC_CLAIM_NFT_ADDRESS;

  if (!claimComponentAddress) return;
  const walletData = rdt.walletApi.getWalletData();
  //Todo support multiple wallets ids
  const accountAddress = walletData.accounts[0].address;
  const resourcePrefix = process.env.NEXT_PUBLIC_RESOURCE_PREFIX;
  if (!resourcePrefix) return;
  const nonfungibleLocalId = accountAddress.replace(
    new RegExp(resourcePrefix, "g"),
    ""
  );

  try {
    console.log("non fun data");
    const response = await rdt.gatewayApi.state.getNonFungibleData(
      claimNFTAddress,
      `<${nonfungibleLocalId}>`
    );
    console.log(response);
    const name: { value: string; field_name: string } | undefined = (
      response.data?.programmatic_json as any
    ).fields.find((nfData: any) => nfData.field_name === "rewards");
    console.log(name.entries[0].value.entries[0].value.value);

    //console.log(response.data?.programmatic_json.fields[1].entries[0]);
    /*
    console.log("a");
    console.log(response);
    let c = [];
    const b = ProgrammaticScryptoSborValueTupleFromJSONTyped(
      response.data?.programmatic_json,
      false
    );
    console.log(b);
    console.log(getValueByFieldName(b, "AccountRewardsData"));
    console.log("-----");
    const d = ProgrammaticScryptoSborValueMapFromJSONTyped(b.fields[1], false);
    const e = ProgrammaticScryptoSborValueMapFromJSONTyped(d.fields[1], false);
    console.log(e);
    */
    //const d = ProgrammaticScryptoSborValueMapFromJSONTyped(b.fields[1]);
    //console.log(b);

    //StateNonFungibleDataRequestFromJSONTyped;

    /*
    ///console.log(instanceOfProgrammaticScryptoSborValueMapAllOf());
    const rewardsField = b.fields.find(
      (field) => field.field_name === "rewards"
    );
    const mapy = ProgrammaticScryptoSborValueMapAllOfFromJSON(rewardsField);
    console.log(mapy.entries);
    */
    //console.log(a.data?.programmatic_json);
    //const { items } = response;
    /*
    const accountReceiptVault =
      (items.find(
        // eslint-disable-next-line camelcase
        ({ resource_address }) => resource_address === resourceAddress
      ) as NonFungibleResource) || null;

    if (accountReceiptVault && accountReceiptVault?.vaults.items.length > 0) {
      dispatch(
        claimSlice.actions.updateReciepts(
          accountReceiptVault?.vaults.items[0].items as string[]
        )
      );
    }*/
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
    checkRewardNft: () => ({
      //Check if they have an nft in their wallet
    }),
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
      const claimComponentAddress = process.env.NEXT_PUBLIC_CLAIM_COMPONENT;
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
          Address("${resourceAddress}") 
          Array<NonFungibleLocalId>(${nftArray}); 
        CREATE_PROOF_FROM_AUTH_ZONE_OF_ALL 
          Address("${resourceAddress}")  
          Proof("proof_1");
        CALL_METHOD 
          Address("${claimComponentAddress}") 
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
      const resourceAddress =
        process.env.NEXT_PUBLIC_RESOURCE_ADDRESS_DEXTERXRD;
      const claimComponentAddress = process.env.NEXT_PUBLIC_CLAIM_COMPONENT;
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
          Address("${resourceAddress}") 
          Array<NonFungibleLocalId>(${nftArray}); 
        CREATE_PROOF_FROM_AUTH_ZONE_OF_ALL 
          Address("${resourceAddress}")  
          Proof("proof_1");
        CALL_METHOD 
          Address("${claimComponentAddress}") 
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
  },
});
