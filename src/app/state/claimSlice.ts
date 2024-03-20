import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  ManifestBuilder,
  RadixDappToolkit,
  RadixNetwork,
  DataRequestBuilder,
} from "@radixdlt/radix-dapp-toolkit";
import { getRdt, RDT } from "../subscriptions";

export interface ClaimState {
  lastPrice: number | null;
}

const initialState: ClaimState = {
  lastPrice: null,
};

export const claimSlice = createSlice({
  name: "claim",
  initialState,

  // synchronous reducers
  reducers: {
    getReciepts: (state) => {
      const rdt = getRdt();
      const claimComponentAddress = process.env.NEXT_PUBLIC_CLAIM_COMPONENT;
      const resourceAddress =
        process.env.NEXT_PUBLIC_RESOURCE_ADDRESS_DEXTERXRD;
      if (!claimComponentAddress) return;
      const walletData = rdt.walletApi.getWalletData();
      //Todo support multiple wallets ids
      const accountAddress = walletData.accounts[0].address;
      console.log(accountAddress);
      const stuff3 = rdt.gatewayApi.state.innerClient
        .stateEntityDetails({
          stateEntityDetailsRequest: {
            addresses: [claimComponentAddress],
          },
        })
        .then((response) => {
          //console.log(response.items[0].details.state);
          const nftManagerAddress =
            response.items[0].details.state.fields.find(
              (field) => field.field_name === "account_rewards_nft_manager"
            )?.value || null;
          //console.log("NFMan " + nftManagerAddress);
          // console.log(response);
          const stuff = rdt.gatewayApi.state.innerClient
            .entityNonFungiblesPage({
              stateEntityNonFungiblesPageRequest: {
                address: nftManagerAddress,
              },
            })
            .then((response) => {
              //console.log("respouince man:");
              //console.log(response);
            });
        });
      const recieptNFTAddress =
        "resource_tdx_2_1ng6vf9g4d30dw8h6h4t2t6e3mfxrhpw8d0n5dkpzh4xaqzqha57cd2";
      const stuff4 = rdt.gatewayApi.state.innerClient
        .entityNonFungiblesPage({
          stateEntityNonFungiblesPageRequest: {
            address: accountAddress,
            aggregation_level: "Vault",
            resource_address: recieptNFTAddress,
            opt_ins: { non_fungible_include_nfids: true },
          },
        })
        .then((response) => {
          console.log("NonFunglible account:");
          console.log(response);
          const accountRecieptVault =
            response.items.find(
              (field) => field.resource_address === resourceAddress
            ) || null;
          console.log(accountRecieptVault.vaults);
        });
      /*
      const stuff5 = rdt.gatewayApi.state.innerClient
        .entityNonFungibleResourceVaultPage({
          stateEntityNonFungiblesPageRequest: {
            address: accountAddress,
            resource_address: recieptNFTAddress,
            opt_ins: { non_fungible_include_nfids: true },
          },
        })
        .then((response) => {
          console.log("NonFunglible account:");
          console.log(response);
        });
*/
      //Figure out what I own

      /*
        const stuff2 = rdt.gatewayApi.state.innerClient
        .({
          stateEntityNonFungibleResourceVaultsPageRequest: {
            address: accountAddress,
            // eslint-disable-next-line camelcase
            resource_address:
              "resource_tdx_2_1ng6vf9g4d30dw8h6h4t2t6e3mfxrhpw8d0n5dkpzh4xaqzqha57cd2",
          },
        })
        .then((response) => {
          console.log(response.items[0].vault_address);
        });*/

      //return list of stuff I got
    },
    getClaimNFT: (state, action: PayloadAction<String>) => {
      console.log(action.payload);
      const rdt = getRdt();
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
        Address("account_tdx_2_12yrm23kzyhvcdk8nzqkmgqxf9ua4eevrvjkzx94zhgf5atgfmtjfx4") 
        "create_proof_of_non_fungibles" 
        Address("resource_tdx_2_1ngazemt8yqrysa7lyax9vrwtvhcetsehvrdw933ftx6p60twjg0wt8") 
        Array<NonFungibleLocalId>(NonFungibleLocalId("<2yrm23kzyhvcdk8nzqkmgqxf9ua4eevrvjkzx94zhgf5atgfmtjfx4>")); 
      POP_FROM_AUTH_ZONE 
        Proof("account_proof_1");
      CALL_METHOD 
        Address("account_tdx_2_12yrm23kzyhvcdk8nzqkmgqxf9ua4eevrvjkzx94zhgf5atgfmtjfx4") 
        "create_proof_of_non_fungibles" 
        Address("resource_tdx_2_1ng6vf9g4d30dw8h6h4t2t6e3mfxrhpw8d0n5dkpzh4xaqzqha57cd2") 
        Array<NonFungibleLocalId>(NonFungibleLocalId("#227#")); 
      CREATE_PROOF_FROM_AUTH_ZONE_OF_ALL 
        Address("resource_tdx_2_1ng6vf9g4d30dw8h6h4t2t6e3mfxrhpw8d0n5dkpzh4xaqzqha57cd2")  
        Proof("proof_1");
      CALL_METHOD 
        Address("component_tdx_2_1crfhmlqxnjzmfqe88gmtd24yg26ua0nymq5zgvcrmcf5t72pqcg5hv") 
        "claim_rewards" 
        Array<Proof>(Proof("account_proof_1")) 
        Array<Proof>(Proof("proof_1"));
      CALL_METHOD 
        Address("account_tdx_2_128ntdeqsshu3a8xpmyrf6asur4dxykhar9ms936s840fagslm3hetq") 
        "deposit_batch" 
        Expression("ENTIRE_WORKTOP");
        `;
      rdt?.walletApi.getWalletData();
      const result = rdt.walletApi.sendTransaction({
        transactionManifest: manfestTwo,
      });
      console.log(result);
    },
    claimRewards: (state) => {
      let claimComponent = process.env.NEXT_PUBLIC_CLAIM_COMPONENT;
      const claimManifest = `
      CALL_METHOD
        Address("${claimComponent}")
        "create_proof_of_non_fungibles"
        "instantiate_gumball_machine"
        Decimal("5")
        "${flavor}";
      CALL_METHOD
        Address("${accountAddress}")
        "deposit_batch"
        Expression("ENTIRE_WORKTOP");
        `;
      const example = `
        CALL_METHOD 
          Address("account_tdx_2_12yrm23kzyhvcdk8nzqkmgqxf9ua4eevrvjkzx94zhgf5atgfmtjfx4") 
          "create_proof_of_non_fungibles" 
          Address("resource_tdx_2_1ngazemt8yqrysa7lyax9vrwtvhcetsehvrdw933ftx6p60twjg0wt8") 
          Array<NonFungibleLocalId>(NonFungibleLocalId("<2yrm23kzyhvcdk8nzqkmgqxf9ua4eevrvjkzx94zhgf5atgfmtjfx4>")); 
        POP_FROM_AUTH_ZONE 
          Proof("account_proof_1");
          CALL_METHOD Address("account_tdx_2_12yrm23kzyhvcdk8nzqkmgqxf9ua4eevrvjkzx94zhgf5atgfmtjfx4") 
          "create_proof_of_non_fungibles" 
          Address("resource_tdx_2_1ng6vf9g4d30dw8h6h4t2t6e3mfxrhpw8d0n5dkpzh4xaqzqha57cd2") 
          Array<NonFungibleLocalId>(NonFungibleLocalId("#227#")); 
        CREATE_PROOF_FROM_AUTH_ZONE_OF_ALL 
          Address("resource_tdx_2_1ng6vf9g4d30dw8h6h4t2t6e3mfxrhpw8d0n5dkpzh4xaqzqha57cd2")  
          Proof("proof_1");
        CALL_METHOD 
          Address("component_tdx_2_1crfhmlqxnjzmfqe88gmtd24yg26ua0nymq5zgvcrmcf5t72pqcg5hv") 
          "claim_rewards" 
          Array<Proof>(Proof("account_proof_1")) 
          Array<Proof>(Proof("proof_1"));
        CALL_METHOD 
          Address("account_tdx_2_128ntdeqsshu3a8xpmyrf6asur4dxykhar9ms936s840fagslm3hetq") 
          "deposit_batch" 
          Expression("ENTIRE_WORKTOP");
        `;
      console.log("claim reward slice");

      getRdt()
        .sendTransaction(claimManifest)
        .then((response) => {
          // Handle the response from the wallet
          console.log("Transaction response:", response);
        })
        .catch((error) => {
          // Handle any errors
          console.error("Transaction error:", error);
        });
    },
  },
});
