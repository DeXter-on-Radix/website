import { createContext } from "react";
import { StaticState, clientState } from "alphadex-sdk-js";
import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";
import { create } from "domain";

export type Rdt = ReturnType<typeof RadixDappToolkit>;

export const RdtContext = createContext<Rdt | undefined>(undefined);

export const GatewayContext = createContext<GatewayApiClient | undefined>(
  undefined
);

export const initialStaticState = new StaticState(clientState.internalState);

export const AdexStateContext = createContext<StaticState>(initialStaticState);
