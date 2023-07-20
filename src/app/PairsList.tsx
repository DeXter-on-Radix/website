import { useContext, useEffect, useState } from "react";
import { AdexStateContext } from "./page";
import * as adex from "alphadex-sdk-js";

export function PairsList() {
  const adexState = useContext(AdexStateContext);
  const selectPair = (pairAddress: string) => {
    adex.clientState.currentPairAddress = pairAddress;
  };
  return (
    <div className="dropdown">
      <label tabIndex={0} className="btn m-1">
        {adexState.currentPairInfo.name}
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
      >
        {adexState.pairsList.map((pair, index) => (
          <li key={index}>
            <button onClick={() => selectPair(pair.address)}>
              {pair.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
