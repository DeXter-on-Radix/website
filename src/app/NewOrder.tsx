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

const debounce = (callback: { (): void; (arg0: any): void }, delay: number) => {
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

  const adexState = useContext(AdexStateContext);
  const accounts = useAccounts();
  const rdt = useRdt();

  const connected = useConnected();

  const [token1Balance, setToken1Balance] = useState<number | null>(null);
  const [token2Balance, setToken2Balance] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<adex.OrderType>(
    adex.OrderType.MARKET
  );
  const [orderSide, setOrderSide] = useState<adex.OrderSide>(
    adex.OrderSide.BUY
  );
  const [orderToken, setOrderToken] = useState<adex.TokenInfo>(
    adexState.currentPairInfo.token1
  );
  const [otherSideToken, setOtherSideToken] = useState<adex.TokenInfo>(
    adexState.currentPairInfo.token2
  );
  const [positionSize, setPositionSize] = useState<number>(0);
  const [price, setPrice] = useState<number>(-1);
  const [slippagePercent, setSlippagePercent] = useState<number>(0);
  const [swapText, setSwapText] = useState<string | null>(null);
  const platformBadgeID = 1;
  const platformFee = 0.001; //TODO: Get this data from the platform badge and set it as a global variable

  const createTx = () => {
    if (
      //TODO: Check user has funds for tx
      //TODO: Check for crazy slippage
      //TODO: Fat finger checks
      !positionSize || //Haven't input a position size
      positionSize <= 0 || //done it dumb
      (orderType !== adex.OrderType.MARKET && //LIMIT or POST order
        ((price < 0 && slippagePercent < 0) || //haven't input price or slippage
          (price > 0 && slippagePercent > 100) || //Input both price and slippage
          !(price || slippagePercent))) //No input for price or slippage
    ) {
      //Provide better error messages
      alert("Please correctly out all fields");
      return;
    }
    console.log(
      "ORDER INPUT DETAILS:\n Pair %s\nType %s \nSide %s \n token address %s\namount %f\nprice %f\nslip %f\nfrontend%f\naccount %s\naccount %s",
      adexState.currentPairAddress,
      orderType,
      orderSide,
      orderToken.address,
      positionSize,
      price,
      slippagePercent / 100,
      platformBadgeID,
      accounts.length > 0 ? accounts[0].address : "",
      accounts.length > 0 ? accounts[0].address : ""
    );
    const order = adex.createExchangeOrderTx(
      adexState.currentPairAddress,
      orderType,
      orderSide,
      orderToken.address,
      positionSize,
      price,
      slippagePercent / 100,
      platformBadgeID,
      accounts.length > 0 ? accounts[0].address : "",
      accounts.length > 0 ? accounts[0].address : ""
    );
    order
      .then((response) => {
        const data = response.data;
        adex.submitTransaction(data, rdt);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const setPercentageOfFunds = (proportion: number) => {
    proportion = proportion / 100;
    if (proportion < 0) {
      setPositionSize(0);
      return;
    }
    try {
      if (orderSide === adex.OrderSide.SELL) {
        if (orderToken === adexState.currentPairInfo.token1) {
          safelySetPositionSize(token1Balance * proportion);
        } else {
          safelySetPositionSize(token2Balance * proportion);
        }
      }
      if (orderSide === adex.OrderSide.BUY) {
        const tokenBalance =
          orderToken === adexState.currentPairInfo.token2
            ? token1Balance
            : token2Balance;
        console.log(tokenBalance)
        getSwapQuote(
          otherSideToken,
          orderToken,
          tokenBalance * proportion
        ).then((swapQuote: adex.SwapQuote) => {
          if (swapQuote) {
            console.log("set percent swapquote\n", swapQuote);
            safelySetPositionSize(swapQuote.toAmount);
          } else {
            setPositionSize(0); // Handle the case when swapQuote is null
          }
        });
      }
    } catch (error) {
      setPositionSize(0);
      console.error(error);
    }
  };

  //TODO: adjust logic to take account of buy/sell
  //Sell side works correctly
  //Buy side rounds incorrectly
  function safelySetPositionSize(position: number) {
    if (position === 0 || null) {
      setPositionSize(0);
      return;
    }
    const isSell = orderSide === adex.OrderSide.SELL;
    const isToken1 = orderToken === adexState.currentPairInfo.token1;

    const currentPairInfo = adexState.currentPairInfo;
    const maxDigits = isToken1
      ? currentPairInfo.maxDigitsToken1
      : currentPairInfo.maxDigitsToken2;
    const minPosition = isToken1
      ? currentPairInfo.minOrderToken1
      : currentPairInfo.minOrderToken2;
    if (position < minPosition) {
      console.log("POSITION TOO SMALL!!!");
    }

    if (position.toString().split(".")[1]?.length > maxDigits) {
      position = Number(
        //Ugly but rounds number down to nearest with correct decimal places
        (
          Math.floor(position * Math.pow(10, maxDigits)) /
          Math.pow(10, maxDigits)
        ).toFixed(maxDigits)
      );
    }

    setPositionSize(position);
  }

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
    setOtherSideToken(adexState.currentPairInfo.token2);
  }, [adexState.currentPairInfo.token1, adexState.currentPairInfo.token2]);

  function activeTypeTabClass(tabsOrderType: adex.OrderType) {
    let className = "tab tab-bordered";
    if (
      orderType === tabsOrderType ||
      (tabsOrderType === adex.OrderType.LIMIT &&
        orderType === adex.OrderType.POSTONLY) //Post only is displayed on limit page
    ) {
      className += " tab-active";
    }

    return className;
  }

  function activeSideTabClass(tabsSide: adex.OrderSide) {
    let className = "tab tab-bordered";
    if (orderSide === tabsSide) {
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

  const getSwapQuote = (
    sendingToken: adex.TokenInfo,
    receivingToken: adex.TokenInfo,
    sendingAmount: number
  ): Promise<adex.SwapQuote> => {
    // Explicitly defining the return type as Promise<adex.SwapQuote>
    const minPosition =
      orderToken === adexState.currentPairInfo.token1
        ? adexState.currentPairInfo.minOrderToken1
        : adexState.currentPairInfo.minOrderToken2;
    if (positionSize < minPosition || !positionSize)
      return Promise.resolve(null);
    console.log("order from", sendingToken);
    console.log("order to", receivingToken);
    console.log("size", sendingAmount);
    console.log(
      sendingToken.address,
      sendingAmount,
      receivingToken.address,
      slippagePercent / 100,
      platformFee
    );
    return adex
      .getSwapQuote(
        sendingToken.address,
        sendingAmount,
        receivingToken.address,
        slippagePercent / 100,
        platformFee
      )
      .then((response) => {
        return response.data[0];
      })
      .catch((error) => {
        console.error(error);
        return null;
      });
  };

  //Updates swap quote
  //TODO: adjust logic to take account of buy/sell
  useEffect(() => {
    getSwapQuote(
      orderSide === adex.OrderSide.SELL ? orderToken : otherSideToken,
      orderSide === adex.OrderSide.SELL ? otherSideToken : orderToken,
      positionSize
    ).then((swapQuote: adex.SwapQuote) => {
      if (swapQuote) {
        console.log(swapQuote);
        setSwapText(
          `Sending ${swapQuote.fromAmount} ${swapQuote.fromToken.name} to receive ${swapQuote.toAmount} ${swapQuote.toToken.name}`
        );
      } else {
        setSwapText(""); // Handle the case when swapQuote is null
      }
    });
  }, [positionSize, adexState.currentPairInfo, orderToken, orderSide]);

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
      </div>
      <div className="tabs">
        <a
          className={activeSideTabClass(adex.OrderSide.BUY)}
          onClick={() => setOrderSide(adex.OrderSide.BUY)}
        >
          BUY
        </a>
        <a
          className={activeSideTabClass(adex.OrderSide.SELL)}
          onClick={() => setOrderSide(adex.OrderSide.SELL)}
        >
          SELL
        </a>
      </div>
      <div className="tabs">
        <a
          className={activeTokenTabClass(adexState.currentPairInfo.token1)}
          onClick={() => {
            setOrderToken(adexState.currentPairInfo.token1);
            setOtherSideToken(adexState.currentPairInfo.token2);
          }}
        >
          {adexState.currentPairInfo.token1.name}
        </a>
        <a
          className={activeTokenTabClass(adexState.currentPairInfo.token2)}
          onClick={() => {
            setOrderToken(adexState.currentPairInfo.token2);
            setOtherSideToken(adexState.currentPairInfo.token1);
          }}
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
            value={!Number.isNaN(positionSize) ? positionSize : ""}
            onInput={(event) => {
              safelySetPositionSize(parseFloat(event.currentTarget.value));
            }}
          />
        </div>
        <div className="inline-flex">
          <button
            className="btn m-2"
            onClick={() => {
              setPercentageOfFunds(25);
            }}
          >
            25%
          </button>
          <button
            className="btn m-2"
            onClick={() => {
              setPercentageOfFunds(50);
            }}
          >
            50%
          </button>
          <button
            className="btn m-2"
            onClick={() => {
              setPercentageOfFunds(75);
            }}
          >
            75%
          </button>
          <button
            className="btn m-2"
            onClick={() => {
              setPercentageOfFunds(100);
            }}
          >
            100%
          </button>
          <input
            type="number"
            id="percentage"
            name="percentage"
            className="m-2 p-2 rounded-none"
            onInput={(event) =>
              setPercentageOfFunds(parseFloat(event.currentTarget.value))
            }
          />
        </div>
        {orderType === adex.OrderType.MARKET && (
          <div className="flex">
            <label htmlFor="slippage" className="my-auto">
              Slippage
            </label>
            <input
              type="number"
              id="slippage"
              name="slippage"
              value={!Number.isNaN(slippagePercent) ? slippagePercent : ""}
              className="w-full m-2 p-2 rounded-none"
              onInput={(event) =>
                setSlippagePercent(parseFloat(event.currentTarget.value))
              }
            />
            %
          </div>
        )}
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
            <div>
              <label>
                Prevent immediate execution
                <input
                  type="checkbox"
                  checked={orderType === adex.OrderType.POSTONLY}
                  onChange={() => {
                    setOrderType(
                      orderType === adex.OrderType.POSTONLY
                        ? adex.OrderType.LIMIT
                        : adex.OrderType.POSTONLY
                    );
                  }}
                />
              </label>
            </div>
          </div>
        )}
        {swapText}
      </div>
      {connected && (
        <div>
          <button
            className="btn m-2"
            onClick={() => {
              return createTx();
            }}
          >
            {orderSide} {orderToken.name}
          </button>
        </div>
      )}
    </div>
  );
}
