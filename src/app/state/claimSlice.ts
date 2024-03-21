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
  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState();

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
          resource_address: resourceAddress,
          // eslint-disable-next-line camelcase
          opt_ins: { non_fungible_include_nfids: true },
        },
      });
    console.log(response);
    const accountReceiptVault =
      response.items.find(
        (field) => field.resource_address === resourceAddress
      ) || null;

    if (accountReceiptVault && accountReceiptVault.vaults.items.length > 0) {
      console.log("final");
      console.log(accountReceiptVault.vaults);
      return accountReceiptVault.vaults.items[0].items;
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
    getReciepts: async (state) => {
      const rdt = getRdt();

      //return list of stuff I got
      return null;
    },
    getClaimNFT: (state, action: PayloadAction<String>) => {
      console.log(action.payload);
      const rdt = getRdt();
      const walletData = rdt.walletApi.getWalletData();
      //Todo support multiple wallets ids
      const accountAddress = walletData.accounts[0].address;
      const resourceAddress =
        process.env.NEXT_PUBLIC_RESOURCE_ADDRESS_DEXTERXRD;
      const manifest = `
      CALL_FUNCTION 
        Address("package_tdx_2_1phllw36avtlkcehmkpvka7efxk54v652sd620lvmx5jrq7urt3g9an") 
        "DexterClaimComponent" 
        "new" 
        Address("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc") 
        Address("resource_tdx_2_1t5sd0xw7lmp4qtkhzznh3suh8ayp9yw4ccpar9fwxkhrcyhzf5zvyw"); 
      CALL_METHOD Address("account_tdx_2_128ntdeqsshu3a8xpmyrf6asur4dxykhar9ms936s840fagslm3hetq") 
        "deposit_batch" 
        Expression("ENTIRE_WORKTOP");
      `;
      const manfestTwo = `
      CALL_METHOD 
        Address("${accountAddress}") 
        "create_proof_of_non_fungibles" 
        Address("${resourceAddress}") 
        Array<NonFungibleLocalId>(NonFungibleLocalId("<2yrm23kzyhvcdk8nzqkmgqxf9ua4eevrvjkzx94zhgf5atgfmtjfx4>")); 
      POP_FROM_AUTH_ZONE 
        Proof("account_proof_1");
      CALL_METHOD 
        Address("${accountAddress}") 
        "create_proof_of_non_fungibles" 
        Address("${resourceAddress}") 
        Array<NonFungibleLocalId>(NonFungibleLocalId("#227#")); 
      CREATE_PROOF_FROM_AUTH_ZONE_OF_ALL 
        Address("${resourceAddress}")  
        Proof("proof_1");
      CALL_METHOD 
        Address("component_tdx_2_1crfhmlqxnjzmfqe88gmtd24yg26ua0nymq5zgvcrmcf5t72pqcg5hv") 
        "claim_rewards" 
        Array<Proof>(Proof("account_proof_1")) 
        Array<Proof>(Proof("proof_1"));
      CALL_METHOD 
        Address("${accountAddress}") 
        "deposit_batch" 
        Expression("ENTIRE_WORKTOP");
        `;
      rdt?.walletApi.getWalletData();
      const result = rdt.walletApi.sendTransaction({
        transactionManifest: manfestTwo,
      });
      console.log(result);
    },
    claimRewards: (state, action: PayloadAction<String[]>) => {
      const rdt = getRdt();
      const walletData = rdt.walletApi.getWalletData();
      const accountAddress = walletData.accounts[0].address;
      const resourceAddress =
        process.env.NEXT_PUBLIC_RESOURCE_ADDRESS_DEXTERXRD;
      const claimComponentAddress = process.env.NEXT_PUBLIC_CLAIM_COMPONENT;
      const claimNFTAddress = process.env.NEXT_PUBLIC_CLAIM_NFT_ADDRESS;
      const resourcePrefix = process.env.NEXT_PUBLIC_RESOURCE_PREFIX;
      const nonfungibleLocalId = accountAddress.replace(
        new RegExp(resourcePrefix, "g"),
        ""
      );

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
          Array<NonFungibleLocalId>(NonFungibleLocalId("#196#")); 
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

      const result = rdt.walletApi.sendTransaction({
        transactionManifest: claimManifest,
      });
    },
  },
});
