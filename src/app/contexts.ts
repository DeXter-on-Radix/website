import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";
import { createContext } from "react";
import { StaticState, clientState } from "alphadex-sdk-js";

// Radix Dapp Toolkit init and field contexts

export const rdt = RadixDappToolkit(
  {
    dAppDefinitionAddress:
      "account_tdx_c_1pyc6tpqu2uy7tzy82cgm5c289x7qy6xehtkqe0j2yycsr9ukkl",
    dAppName: "DeXter",
  },
  (requestData) => {
    requestData({
      accounts: { quantifier: "atLeast", quantity: 1 },
    });
  },
  {
    networkId: 12,
    onDisconnect: () => {
      // clear your application state
    },
    onInit: ({ accounts }) => {
      // set your initial application state
    },
  }
);

export const RdtAccountsContext = createContext<
  | {
      address: string;
      label: string;
      appearanceId: number;
    }[]
  | undefined
>(undefined);

// AlphaDEX State context

export const initialStaticState = new StaticState(clientState.internalState);

export const AdexStateContext = createContext(initialStaticState);
