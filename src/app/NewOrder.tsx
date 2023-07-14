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
  let slippage = -1;
  // const platformBadgeId = 1;

  const createTx = ({
    orderType,
    side,
    tokenAddress,
    amount,
    price,
    slippage,
  }: {
    orderType: string;
    side: string;
    tokenAddress: string;
    amount: number;
    price: number;
    slippage: number;
  }) => {
    slippage;
    const order = adex.createExchangeOrderTx(
      adexState.currentPairAddress,
      orderType,
      side,
      tokenAddress,
      amount,
      price,
      slippage,
      1,
      accounts.length > 0 ? accounts[0].address : "",
      accounts.length > 0 ? accounts[0].address : ""
    );
    console.log(
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
      slippage
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
      {connected && (
        <button
          onClick={() =>
            createTx({
              orderType,
              side: "BUY",
              tokenAddress,
              amount,
              price: adexState.currentPairOrderbook.sells[0].price,
              slippage,
            })
          }
        >
          Buy order
        </button>
      )}
      {connected && (
        <button
          onClick={() =>
            createTx({
              orderType,
              side: "SELL",
              tokenAddress,
              amount,
              price: adexState.currentPairOrderbook.buys[0].price,
              slippage,
            })
          }
        >
          Sell order
        </button>
      )}
    </div>
  );
}
