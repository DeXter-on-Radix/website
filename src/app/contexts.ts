import { createContext } from "react";
import { StaticState, clientState } from "alphadex-sdk-js";
import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";
export type Rdt = ReturnType<typeof RadixDappToolkit>;

export const RdtContext = createContext<Rdt | null>(null);

export const initialStaticState = new StaticState(clientState.internalState);

export const AdexStateContext = createContext<StaticState>(initialStaticState);
