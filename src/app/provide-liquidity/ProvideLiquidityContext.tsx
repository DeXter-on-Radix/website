// Original Idea from this example (modified for typescript):
// => https://dev.to/nazmifeeroz/using-usecontext-and-usestate-hooks-as-a-store-mnm
import React, { useState, createContext, ReactNode, useContext } from "react";

// Define a type alias for the state updater function
type StateUpdater<T> = React.Dispatch<React.SetStateAction<T>>;

// Define the type for the context value
interface ProvideLiquidityContextType {
  pair: [string, StateUpdater<string>];
  buySideLiq: [number, StateUpdater<number>];
  sellSideLiq: [number, StateUpdater<number>];
  maintainLiqRatio: [boolean, StateUpdater<boolean>];
  distribution: [Distribution, StateUpdater<Distribution>];
  midPrice: [number, StateUpdater<number>];
  bins: [number, StateUpdater<number>];
  percSteps: [number, StateUpdater<number>];
  decimals: [number, StateUpdater<number>];
}

// Define the context
const ProvideLiquidityContext =
  createContext<ProvideLiquidityContextType | null>(null);

interface ProvideLiquidityProviderProps {
  children: ReactNode;
}

export enum Distribution {
  LINEAR = "LINEAR",
  MID_DISTRIBUTION = "MID_DISTRIBUTION",
  EXTREMES = "EXTREMES",
}

// Define the provider component
export const ProvideLiquidityProvider: React.FC<
  ProvideLiquidityProviderProps
> = ({ children }) => {
  // Define all states and initial values
  const [pair, setPair] = useState<string>("DEXTR/XRD");
  const [buySideLiq, setBuySideLiq] = useState<number>(100); // specified in token1
  const [sellSideLiq, setSellSideLiq] = useState<number>(100); // specified in token1
  const [maintainLiqRatio, setMaintainLiqRatio] = useState<boolean>(true); // equal liquidity by default
  const [distribution, setDistribution] = useState<Distribution>(
    Distribution.LINEAR
  );
  const [midPrice, setMidPrice] = useState<number>(-1);
  const [bins, setBins] = useState<number>(4);
  const [percStep, setPercStep] = useState<number>(0.02); // 2% default steps
  const [decimals, setDecimals] = useState<number>(8); // 8 decimals per default

  const store: ProvideLiquidityContextType = {
    pair: [pair, setPair],
    buySideLiq: [buySideLiq, setBuySideLiq],
    sellSideLiq: [sellSideLiq, setSellSideLiq],
    maintainLiqRatio: [maintainLiqRatio, setMaintainLiqRatio],
    distribution: [distribution, setDistribution],
    midPrice: [midPrice, setMidPrice],
    bins: [bins, setBins],
    percSteps: [percStep, setPercStep],
    decimals: [decimals, setDecimals],
  };

  return (
    <ProvideLiquidityContext.Provider value={store}>
      {children}
    </ProvideLiquidityContext.Provider>
  );
};

// Set the display name for the component (for debugging and better DX)
ProvideLiquidityProvider.displayName = "ProvideLiquidityProvider";

// Custom hook to use the ProvideLiquidity context
export const useProvideLiquidityContext = (): ProvideLiquidityContextType => {
  const context = useContext(ProvideLiquidityContext);
  if (!context) {
    throw new Error(
      "useProvideLiquidity must be used within a ProvideLiquidityProvider"
    );
  }
  return context;
};
