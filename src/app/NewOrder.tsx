import {
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AdexStateContext } from "./contexts";
import * as adex from "alphadex-sdk-js";
import { useAccounts } from "./hooks/useAccounts";
import { useConnected } from "./hooks/useConnected";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";
import { useRdt } from "./hooks/useRdt";

export function NewOrder() {
  const [gatewayApi, setGatewayApi] = useState<GatewayApiClient | null>(null);
  useEffect(() => {
    // TODO: do we really need the gateway api client here?
    // or can we somehow get data from rdt or adex?
    const gatewayApi = GatewayApiClient.initialize({
      basePath: "https://rcnet.radixdlt.com",
    });
    const { status, transaction, stream, state } = gatewayApi;
    setGatewayApi(gatewayApi);
  }, []);

  //returns simple orderbook of buys/sells
  const adexState = useContext(AdexStateContext);
  const accounts = useAccounts();
  const rdt = useRdt();

  const connected = useConnected();

  const [token1Balance, setToken1Balance] = useState<number | null>(null);
  const [token2Balance, setToken2Balance] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<adex.OrderType>(
    adex.OrderType.MARKET
  );
  const [positionSize, setPositionSize] = useState<number | undefined>(
    undefined
  );
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [slippage, setSlippage] = useState<number | undefined>(undefined);

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
      // TODO: check fo null or replace with another API
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

  function activeTabClass(tabsOrderType: adex.OrderType) {
    let className = "tab tab-bordered";
    if (orderType === tabsOrderType) {
      className += " tab-active";
    }

    return className;
  }

  return (
    <div>
      <div className="text-sm">
        <div>
          {adexState.currentPairInfo.token1.name} balance: {token1Balance}
        </div>
        <div>
          {adexState.currentPairInfo.token2.name} balance: {token2Balance}
        </div>
      </div>

      <div className="tabs">
        <a
          className={activeTabClass(adex.OrderType.MARKET)}
          onClick={() => setOrderType(adex.OrderType.MARKET)}
        >
          Market
        </a>
        <a
          className={activeTabClass(adex.OrderType.LIMIT)}
          onClick={() => setOrderType(adex.OrderType.LIMIT)}
        >
          Limit
        </a>
        <a
          className={activeTabClass(adex.OrderType.POSTONLY)}
          onClick={() => setOrderType(adex.OrderType.POSTONLY)}
        >
          Post Only
        </a>
      </div>
      <br />
      <div className="flex flex-col max-w-sm">
        <div className="flex justify-between">
          <label htmlFor="amount" className="my-auto">
            Position size
          </label>
          <input
            type="decimal"
            id="amount"
            name="amount"
            required
            className="w-full m-2 p-2 rounded-none"
            onInput={(event) =>
              setPositionSize(parseFloat(event.currentTarget.value))
            }
          />
        </div>

        <div className="flex justify-between">
          <label htmlFor="price" className="join-item my-auto">
            Price
          </label>
          <input
            type="decimal"
            id="price"
            name="price"
            className="w-full m-2 p-2 rounded-none"
            onInput={(event) => setPrice(parseFloat(event.currentTarget.value))}
          />
        </div>

        <div className="flex">
          <label htmlFor="slippage" className="my-auto">
            Slippage
          </label>
          <input
            type="decimal"
            id="slippage"
            name="slippage"
            className="w-full m-2 p-2 rounded-none"
            onInput={(event) =>
              setSlippage(parseFloat(event.currentTarget.value))
            }
          />
        </div>
      </div>
      <br />
      {connected && (
        <button
          className="btn m-2"
          onClick={() => {
            if (!price || !positionSize || !slippage) {
              alert("Please fill out all fields");
              return;
            }
            return createTx({
              orderType,
              side: adex.OrderSide.BUY,
              tokenAddress: adexState.currentPairInfo.token1.address,
              amount: positionSize,
              price,
              slippage,
            });
          }}
        >
          Buy {adexState.currentPairInfo.token1.name}
        </button>
      )}
      {connected && (
        <button
          className="btn m-2 mb-8"
          onClick={() => {
            if (!price || !positionSize || !slippage) {
              alert("Please fill out all fields");
              return;
            }
            return createTx({
              orderType,
              side: adex.OrderSide.SELL,
              tokenAddress: adexState.currentPairInfo.token1.address,
              amount: positionSize,
              price,
              slippage,
            });
          }}
        >
          Sell {adexState.currentPairInfo.token1.name}
        </button>
      )}
    </div>
  );
}
