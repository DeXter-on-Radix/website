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

  const adexState = useContext(AdexStateContext);
  const accounts = useAccounts();
  const rdt = useRdt();
  const bestSell =
    adexState.currentPairOrderbook.sells[
      adexState.currentPairOrderbook.sells.length - 1
    ]?.price;
  const bestBuy = adexState.currentPairOrderbook.buys[0]?.price;
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
  const [price, setPrice] = useState<number>((bestBuy + bestSell) / 2);
  const [slippagePercent, setSlippagePercent] = useState<number>(0);
  const [swapText, setSwapText] = useState<string | null>(null);
  const platformBadgeID = 1;
  const platformFee = 0.001; //TODO: Get this data from the platform badge and set it as a global variable

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
      orderSide,
      orderType,
      orderToken,
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
  //applies styline to tabs
  function getActiveTabClass(activeValue: any, tabsValue: any) {
    let className = "tab tab-bordered";
    if (activeValue === tabsValue) {
      className += " tab-active";
    }
    return className;
  }

  function activeTypeTabClass(tabsOrderType: adex.OrderType) {
    if (orderType != adex.OrderType.POSTONLY) {
      return getActiveTabClass(orderType, tabsOrderType);
    } else {
      //Post only is displayed on limit page
      return getActiveTabClass(adex.OrderType.LIMIT, tabsOrderType);
    }
  }

  function activeSideTabClass(tabsSide: adex.OrderSide) {
    return getActiveTabClass(orderSide, tabsSide);
  }

  function activeTokenTabClass(tabsToken: adex.TokenInfo) {
    return getActiveTabClass(orderToken, tabsToken);
  }

  const getQuote = (
    sendingToken?: adex.TokenInfo,
    quoteOrderSide?: adex.OrderSide,
    sendingAmount?: number
  ) => {
    const minPosition =
      orderToken === adexState.currentPairInfo.token1
        ? adexState.currentPairInfo.minOrderToken1
        : adexState.currentPairInfo.minOrderToken2;
    if (
      orderSide != adex.OrderSide.BUY &&
      (positionSize < minPosition || !positionSize)
    ) {
      return Promise.resolve(null);
    }
    const orderPrice = orderType != adex.OrderType.MARKET ? price : -1;
    const orderSlippage =
      orderType != adex.OrderType.MARKET ? -1 : slippagePercent / 100;

    sendingToken = sendingToken ? sendingToken : orderToken;
    quoteOrderSide = quoteOrderSide ? quoteOrderSide : orderSide;
    sendingAmount = sendingAmount ? sendingAmount : positionSize;
    console.log(
      adexState.currentPairInfo.address,
      orderType,
      quoteOrderSide,
      sendingToken.address,
      sendingAmount,
      platformFee,
      orderPrice,
      orderSlippage
    );
    return adex
      .getExchangeOrderQuote(
        adexState.currentPairInfo.address,
        orderType,
        quoteOrderSide,
        sendingToken.address,
        sendingAmount,
        platformFee,
        orderPrice,
        orderSlippage
      )
      .then((response) => {
        console.log(response.data);
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return null;
      });
  };

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

    const orderPrice = orderType != adex.OrderType.MARKET ? price : -1;
    const orderSlippage =
      orderType != adex.OrderType.MARKET ? -1 : slippagePercent / 100;

    console.log(
      "ORDER INPUT DETAILS:\n Pair %s\nType %s \nSide %s \n token address %s\namount %f\nprice %f\nslip %f\nfrontend%f\naccount %s\naccount %s",
      adexState.currentPairAddress,
      orderType,
      orderSide,
      orderToken.address,
      positionSize,
      orderPrice,
      orderSlippage,
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
      orderPrice,
      orderSlippage,
      platformBadgeID,
      accounts.length > 0 ? accounts[0].address : "",
      accounts.length > 0 ? accounts[0].address : ""
    );
    order
      .then((response) => {
        const data = response.data;
        console.log(response);
        adex.submitTransaction(data, rdt);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  //TODO: adjust logic to take account of buy/sell
  //Sell side works correctly
  //Buy side rounds incorrectly
  function safelySetPositionSize(position: number) {
    if (position === 0 || position === null || !position) {
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

  const setPercentageOfFunds = (proportion: number) => {
    proportion = proportion / 100;
    if (proportion < 0 ) {
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
      } else if (orderSide === adex.OrderSide.BUY) {
        const tokenBalance =
          orderToken === adexState.currentPairInfo.token2
            ? token1Balance
            : token2Balance;
        console.log(tokenBalance);
        console.log(otherSideToken, orderToken, tokenBalance * proportion);
        getQuote(
          otherSideToken,
          adex.OrderSide.SELL,
          tokenBalance * proportion
        ).then((quote: adex.SwapQuote) => {
          if (quote) {
            console.log("set percent swapquote\n", quote);
            if (
              orderType != adex.OrderType.MARKET &&
              quote.fromAmount === 0 &&
              quote.toAmount === 0
            ) {
              //Flips the numbers when calculating returns
              safelySetPositionSize(
                orderToken === adexState.currentPairInfo.token1
                  ? (tokenBalance * proportion) / price
                  : tokenBalance * proportion * price
              );
            } else {
              safelySetPositionSize(quote.toAmount);
            }
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

  //Updates swap quote
  //TODO: adjust logic to take account of buy/sell
  useEffect(() => {
    if (
      positionSize === 0 ||
      (orderType != adex.OrderType.MARKET && price <= 0)
    ) {
      setSwapText("");
      return;
    }
    getQuote()
      .then((quote: adex.Quote) => {
        if (
          orderType != adex.OrderType.MARKET &&
          quote.fromAmount === 0 &&
          quote.toAmount === 0
        ) {
          //Flips the numbers when calculating returns
          const otherAmount =
            orderToken === adexState.currentPairInfo.token1
              ? positionSize * price
              : positionSize / price;
          const fromAmount =
            orderSide === adex.OrderSide.BUY ? otherAmount : positionSize;
          const toAmount =
            orderSide === adex.OrderSide.BUY ? positionSize : otherAmount;
          generateAndSetSwapText(
            quote.fromToken.name,
            fromAmount,
            quote.toToken.name,
            toAmount,
            " Order will not immediately execute."
          );
        } else {
          generateAndSetSwapText(
            quote.fromToken.name,
            quote.fromAmount,
            quote.toToken.name,
            quote.toAmount
          );
        }
      })
      .catch((error) => {
        console.log(error);
        setSwapText("");
      });
  }, [
    positionSize,
    price,
    slippagePercent,
    adexState.currentPairInfo,
    orderToken,
    orderSide,
    orderType,
  ]);

  function generateAndSetSwapText(
    fromName: string,
    fromAmount: number,
    toName: string,
    toAmount: number,
    extraText?: string
  ) {
    let text: string = `Sending ${fromAmount} ${fromName} to receive ${toAmount} ${toName}`;
    if (
      (orderSide === adex.OrderSide.SELL && fromAmount < positionSize * 0.99) ||
      (orderSide === adex.OrderSide.BUY && toAmount < positionSize * 0.99)
    ) {
      text =
        text +
        ". !!! Order size greater than available liquidity. Reduce order or increase slippage !!!";
    }
    text = extraText ? text + extraText : text;
    setSwapText(text);
  }

  //

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
        <div className="flex justify-between">
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
                value={!Number.isNaN(price) ? price : ""}
                onInput={(event) =>
                  setPrice(parseFloat(event.currentTarget.value))
                }
              />
              <button
                className="btn m-2"
                onClick={() => {
                  setPrice(bestBuy ? bestBuy : price);
                }}
              >
                Best buy
              </button>
              <button
                className="btn m-2"
                onClick={() => {
                  setPrice(bestSell ? bestSell : price);
                }}
              >
                Best sell
              </button>
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
        <div className="text-sm">
          <div>{swapText}</div>
        </div>
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
