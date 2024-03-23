import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { getRdt } from "../subscriptions";

export interface ClaimState {
  lastPrice: number | null;
}

const initialState: ClaimState = {
  lastPrice: null,
};

export const fetchReciepts = createAsyncThunk<
  undefined, // Return type of the payload creator
  undefined, // argument type
  {
    state: RootState;
  }
>("claims/fetchReciepts", async (_arg, thunkAPI) => {
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
          //resource_address: resourceAddress,
          // eslint-disable-next-line camelcase
          opt_ins: { non_fungible_include_nfids: true },
        },
      });
    console.log(response);
    const { items } = response;
    const accountReceiptVault =
      items.find(
        // eslint-disable-next-line camelcase
        ({ resource_address }) => resource_address === resourceAddress
      ) || null;
    console.log(accountReceiptVault);
    if (accountReceiptVault && accountReceiptVault?.vaults.items.length > 0) {
      return accountReceiptVault?.vaults.items[0].items;
    }
  } catch (error) {
    console.error("Error fetching receipts:", error);
  }

  return undefined;
});

export const claimSlice = createSlice({
  name: "claim",
  initialState,

  // synchronous reducers
  reducers: {
    claimRewards: (state, action: PayloadAction<String[]>) => {
      const rdt = getRdt();
      if (!rdt) return;
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
      const nftArray = action.payload
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
      console.log("claim reward slice");

      rdt.walletApi.sendTransaction({
        transactionManifest: claimManifest,
      });
    },
  },
});
