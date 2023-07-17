import { SyntheticEvent, useContext } from "react";
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
  let orderType = adex.OrderType.MARKET;
  let amount = 10;
  let price = -1;
  let slippage = -1;

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
    price = orderType === "MARKET" ? -1 : price;
    console.log(
      "ORDER INPUT DETAILS:\n\n",
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
    order
      .then((response) => {
        console.log("RESPONSE________________________________________");
        console.log(response);
        const data = response.data;
        console.log(data);
        adex.submitTransaction(data, rdt);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const setOrderType = ({ newOrderType }: { newOrderType: adex.OrderType }) => {
    orderType = newOrderType;
    console.log(orderType);
  };

  const setOrderVariables = async (event: SyntheticEvent) => {
    event.preventDefault();
    amount = parseFloat(event.target.amount.value);
    price = parseFloat(
      event.target.price.value ? event.target.price.value : price
    );
    slippage = parseFloat(
      event.target.slippage.value ? event.target.slippage.value : slippage
    );
    console.log(
      "Order variables:\nAmount:%f\nPrice:%f\nSlippage%f",
      amount,
      price,
      slippage
    );
  };

  return (
    <div>
      <button
        onClick={() => setOrderType({ newOrderType: adex.OrderType.MARKET })}
      >
        MARKET
      </button>
      <button
        onClick={() => setOrderType({ newOrderType: adex.OrderType.LIMIT })}
      >
        LIMIT
      </button>
      <button
        onClick={() => setOrderType({ newOrderType: adex.OrderType.POSTONLY })}
      >
        POST-ONLY
      </button>
      <br />
      <form onSubmit={setOrderVariables}>
        <label htmlFor="amount">Amount</label>
        <input type="decimal" id="amount" name="amount" required />
        <label htmlFor="price">Price</label>
        <input type="decimal" id="price" name="price" />
        <label htmlFor="slippage">Slippage</label>
        <input type="decimal" id="slippage" name="slippage" />
        <button type="submit">Submit</button>
      </form>
      <br />
      {connected && (
        <button
          onClick={() =>
            createTx({
              orderType,
              side: adex.OrderSide.BUY,
              tokenAddress: adexState.currentPairInfo.token1.address,
              amount,
              price,
              slippage,
            })
          }
        >
          Buy {adexState.currentPairInfo.token1.name}
        </button>
      )}
      {connected && (
        <button
          onClick={() =>
            createTx({
              orderType,
              side: adex.OrderSide.SELL,
              tokenAddress: adexState.currentPairInfo.token1.address,
              amount,
              price,
              slippage,
            })
          }
        >
          Sell {adexState.currentPairInfo.token1.name}
        </button>
      )}
    </div>
  );
}
