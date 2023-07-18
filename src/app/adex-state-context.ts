import { StaticState, clientState } from "alphadex-sdk-js";
import { createContext } from "react";

export const initialStaticState = new StaticState(clientState.internalState);

export const AdexStateContext = createContext(initialStaticState);
