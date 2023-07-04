import { useContext, useEffect, useState } from "react";
import { AdexStateContext } from "./page";
import * as adex from "alphadex-sdk-js";

export function PairsList() {
    const adexState = useContext(AdexStateContext);
    const selectPair = (pairAddress) => {
        adex.clientState.currentPairAddress = pairAddress;
    }
    return (
        <div>
            <h4>AlphaDEX Pairs</h4>
            <ul>
                {adexState.pairsList
                .map((pair, index) => 
                    <li key={index}>
                    <button onClick={() => selectPair(pair.address)}>
                        {pair.name}
                    </button>
                    </li>)
                }
            </ul>
        </div>
    )
}