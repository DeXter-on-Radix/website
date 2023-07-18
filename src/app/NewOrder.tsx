import {
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AdexStateContext } from "./page";
import * as adex from "alphadex-sdk-js";
import { useAccounts } from "./hooks/useAccounts";
import { useRequestData } from "./hooks/useRequestData";
import { useConnected } from "./hooks/useConnected";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";
import { useRdt } from "./hooks/useRdt";

const gatewayApi = GatewayApiClient.initialize({
  basePath: "https://rcnet.radixdlt.com",
});
const { status, transaction, stream, state } = gatewayApi;

export function NewOrder() {
  //returns simple orderbook of buys/sells
  const adexState = useContext(AdexStateContext);
  const accounts = useAccounts();
  const rdt = useRdt();

  const requestData = useRequestData();
  const connected = useConnected();
  const [token1Balance, setToken1Balance] = useState<number>(0);
  const [token2Balance, setToken2Balance] = useState<number>(0);
  let currentPairAddress = adexState.currentPairAddress;
  let orderType = adex.OrderType.MARKET;
  let amount = 0;
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

  const setPercentageOfFunds = ({ proportion }: { proportion: string }) => {
    //Button to set 25/50/75/100% of total token balance to an order.
    //Perhaps add some logic so you can't set 100% of xrd to an order
  };

  const getAccountResourceBalance = (
    resourceAddress: string,
    account: string
  ) => {
    async function getResourceDetails(
      resourceAddress: string,
      account: string
    ) {
      let response =
        await gatewayApi.state.innerClient.entityFungibleResourceVaultPage({
          stateEntityFungibleResourceVaultsPageRequest: {
            address: account,
            /* eslint-disable */ resource_address /* eslint-enable*/:
              resourceAddress,
          },
        });
      return response;
    }
    return new Promise((resolve, reject) => {
      getResourceDetails(resourceAddress, account)
        .then((response) => {
          const output = parseFloat(response.items[0].amount);
          console.log("BALANCE %f", output);
          resolve(output);
        })
        .catch((reason: TypeError) => {
          resolve(0);
        });
    });
  };
  const fetchBalances = useCallback(
    async (address1: string, address2: string, account: string) => {
      try {
        const token1Balance = (await getAccountResourceBalance(
          address1,
          account
        )) as number;
        const token2Balance = (await getAccountResourceBalance(
          address2,
          account
        )) as number;
        setToken1Balance(token1Balance);
        setToken2Balance(token2Balance);
      } catch (error) {
        console.log("Error fetching balances:", error);
      }
    },
    []
  );

  useEffect(() => {
    const account = accounts.length > 0 ? accounts[0].address : "";
    if (
      adexState.currentPairInfo.token1.address &&
      adexState.currentPairInfo.token2.address &&
      account
    ) {
      fetchBalances(
        adexState.currentPairInfo.token1.address,
        adexState.currentPairInfo.token2.address,
        account
      );
    }
    return;
  }, [
    adexState.currentPairInfo.token1.address,
    adexState.currentPairInfo.token2.address,
    connected,
    accounts,
    fetchBalances,
  ]);

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
        {" "}
        POST-ONLY{" "}
      </button>
      {adexState.currentPairInfo.token1.name} balance: {token1Balance}
      {adexState.currentPairInfo.token2.name} balance: {token2Balance}
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
