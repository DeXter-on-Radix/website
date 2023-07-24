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
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";

const debounce = (callback: { (): void; (arg0: any): void; }, delay: number) => {
  let timerId;
  return (...args: any) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

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
  const [orderToken, setOrderToken] = useState<adex.TokenInfo>(
    adexState.currentPairInfo.token1
  );
  const [positionSize, setPositionSize] = useState<number>(-1);
  const [price, setPrice] = useState<number>(-1);
  const [slippage, setSlippage] = useState<number>(-1);
  const [swapQuote, setSwapQuote] = useState<adex.SwapQuote | null>(null);

  const createTx = (
    orderType: string,
    side: string,
    tokenAddress: string,
    amount: number,
    price: number,
    slippage: number
  ) => {
    price = orderType === "MARKET" ? -1 : price;
    console.log(
      "ORDER INPUT DETAILS:\n Pair %s\nType %s \nSide %s \n token address %s\namount %f\nprice %f\nslip %f\nfrontend%f\naccount %s\naccount %s",
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
        await gatewayApi?.state.innerClient.entityFungibleResourceVaultPage({
          stateEntityFungibleResourceVaultsPageRequest: {
            address: account,
            /* eslint-disable */ resource_address /* eslint-enable*/:
              resourceAddress,
          },
        });
      return response ? response : null;
    }
    return new Promise((resolve, reject) => {
      getResourceDetails(resourceAddress, account)
        .then((response) => {
          const output = parseFloat(response ? response.items[0].amount : "0");
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
    [
      adexState.currentPairAddress,
      connected,
      accounts,
      getAccountResourceBalance,
    ]
  );

  //Updates token balances
  useEffect(() => {
    const account = accounts.length > 0 ? accounts[0].address : "";
    console.log("Updating token pair/connecting");
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
  }, [
    adexState.currentPairInfo.token1.address,
    adexState.currentPairInfo.token2.address,
    connected,
    accounts,
  ]);

  //Updates selected side (token1/token2)
  useEffect(() => {
    setOrderToken(adexState.currentPairInfo.token1);
  }, [adexState.currentPairInfo.token1, adexState.currentPairInfo.token2]);

  function activeTypeTabClass(tabsOrderType: adex.OrderType) {
    let className = "tab tab-bordered";
    if (orderType === tabsOrderType) {
      className += " tab-active";
    }

    return className;
  }

  function activeTokenTabClass(tabsToken: adex.TokenInfo) {
    let className = "tab tab-bordered";
    if (orderToken === tabsToken) {
      className += " tab-active";
    }
    return className;
  }

  const getSwapQuote = () => {
    const platformFee = 0.001; //TODO: Get this data from the platform badge and set it as a global variable
    const adexPairInfo = adexState.currentPairInfo;
    console.log("getswapquote posn size",positionSize);
    console.log(
      orderToken.address,
      positionSize,
      orderToken === adexPairInfo.token1
        ? adexPairInfo.token2.address
        : adexPairInfo.token1.address,
      1,
      platformFee
    );
    const quote = adex.getSwapQuote(
      orderToken.address,
      positionSize,
      orderToken === adexPairInfo.token1
        ? adexPairInfo.token2.address
        : adexPairInfo.token1.address,
      1,
      platformFee
    );
    quote
      .then((response) => {
        setSwapQuote(response.data[0]);
        console.log(swapQuote);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    const debouncedGetSwapQuote = debounce(getSwapQuote, 2000);
    debouncedGetSwapQuote();
  }, [positionSize]);

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
          className={activeTypeTabClass(adex.OrderType.MARKET)}
          onClick={() => setOrderType(adex.OrderType.MARKET)}
        >
          Market
        </a>
        <a
          className={activeTypeTabClass(adex.OrderType.LIMIT)}
          onClick={() => setOrderType(adex.OrderType.LIMIT)}
        >
          Limit
        </a>
        <a
          className={activeTypeTabClass(adex.OrderType.POSTONLY)}
          onClick={() => setOrderType(adex.OrderType.POSTONLY)}
        >
          Post Only
        </a>
      </div>
      <div className="tabs">
        <a
          className={activeTokenTabClass(adexState.currentPairInfo.token1)}
          onClick={() => setOrderToken(adexState.currentPairInfo.token1)}
        >
          {adexState.currentPairInfo.token1.name}
        </a>
        <a
          className={activeTokenTabClass(adexState.currentPairInfo.token2)}
          onClick={() => setOrderToken(adexState.currentPairInfo.token2)}
        >
          {adexState.currentPairInfo.token2.name}
        </a>
      </div>
      <br />
      <div className="flex flex-col max-w-sm">
        <div className="flex justify-between">
          <label htmlFor="amount" className="my-auto">
            Position size
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            required
            className="w-full m-2 p-2 rounded-none"
            onInput={(event) => {
              setPositionSize(parseFloat(event.currentTarget.value));
            }}
          />
        </div>
        {orderType !== adex.OrderType.MARKET && (
          <div>
            <div className="flex justify-between">
              <label htmlFor="price" className="join-item my-auto">
                Price
              </label>
              <input
                type="number"
                id="price"
                name="price"
                className="w-full m-2 p-2 rounded-none"
                onInput={(event) =>
                  setPrice(parseFloat(event.currentTarget.value))
                }
              />
            </div>
            <div className="flex">
              <label htmlFor="slippage" className="my-auto">
                Slippage
              </label>
              <input
                type="number"
                id="slippage"
                name="slippage"
                className="w-full m-2 p-2 rounded-none"
                onInput={(event) =>
                  setSlippage(parseFloat(event.currentTarget.value))
                }
              />
            </div>
          </div>
        )}
        {swapQuote && (
          <div>
            <p>Display swap quote data here </p>
          </div>
        )}
      </div>
      <br />
      {connected && (
        <div>
          <button
            className="btn m-2"
            onClick={() => {
              if (
                !positionSize ||
                (orderType !== adex.OrderType.MARKET &&
                  (price < 0 || slippage < 0))
              ) {
                alert("Please fill out all fields");
                return;
              }
              return createTx(
                orderType,
                adex.OrderSide.BUY,
                orderToken.address,
                positionSize,
                price,
                slippage
              );
            }}
          >
            Buy {orderToken.name}
          </button>
          <button
            className="btn m-2 mb-8"
            onClick={() => {
              if (
                !positionSize ||
                (orderType !== adex.OrderType.MARKET &&
                  (price < 0 || slippage < 0))
              ) {
                alert("Please fill out all fields");
                return;
              }
              return createTx(
                orderType,
                adex.OrderSide.SELL,
                orderToken.address,
                positionSize,
                price,
                slippage
              );
            }}
          >
            Sell {orderToken.name}
          </button>
          <button className="btn m-2 mb-8" onClick={() => {}}>
            quote
          </button>
        </div>
      )}
    </div>
  );
}
