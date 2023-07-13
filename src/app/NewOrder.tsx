import { useContext } from "react";
import { AdexStateContext } from "./page";
import * as adex from "alphadex-sdk-js";
import { useAccounts } from "./hooks/useAccounts";
import { useRequestData } from "./hooks/useRequestData";
import { useConnected } from "./hooks/useConnected";
import { rdt } from "./layout";

export function NewOrder() {
  //returns simple orderbook of buys/sells
  const adexState = useContext(AdexStateContext);
  const accounts = useAccounts();
  const requestData = useRequestData();
  const connected = useConnected();
  let orderType = "MARKET";
  let side = "BUY";
  let tokenAddress = adexState.currentPairInfo.token1.address;
  let amount = 100;
  let price = adexState.currentPairOrderbook.sells[0].price;
  let slippage = -1;
  const platformBadgeId = 1
  let submitAccountAddress = accounts.length > 0 ? accounts[0].address : "";
  let settleAccountAddress = submitAccountAddress;

  const createTx = () => {
    console.log("Creating tx");
    const order = adex.createExchangeOrderTx(
      adexState.currentPairAddress,
      orderType,
      side,
      tokenAddress,
      amount,
      price,
      slippage,
      platformBadgeId,
      submitAccountAddress,
      settleAccountAddress
    );
    console.log(
      adexState.currentPairAddress,
      "\n",
      orderType,
      "\n",
      side,
      "\n",
      tokenAddress,
      "\n",
      amount,
      "\n",
      price,
      "\n",
      slippage,
      "\n",
      platformBadgeId,
      "\n",
      submitAccountAddress,
      "\n",
      settleAccountAddress
    );
    order
      .then((response) => {
        const data = response.data;
        console.log(data);
        adex.submitTransaction(data, rdt);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  return (
    <div>
      {connected && <button onClick={() => createTx()}>Create order</button>}
    </div>
  );
}
