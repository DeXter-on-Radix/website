import { useContext, useEffect, useState } from "react";
import { AdexStateContext } from "./contexts";
import * as adex from "alphadex-sdk-js";
import { useAccounts } from "./hooks/useAccounts";
import { useConnected } from "./hooks/useConnected";
import { RadixNetworkConfigById } from "@radixdlt/babylon-gateway-api-sdk";
import { useRdt } from "./hooks/useRdt";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";

export function OrderButton() {
  const [gatewayApi, setGatewayApi] = useState<GatewayApiClient | null>(null);
  useEffect(() => {
    // TODO: do we really need the gateway api client here?
    // or can we somehow get data from rdt or adex?
    const gatewayApi = GatewayApiClient.initialize({
      basePath: RadixNetworkConfigById[13].gatewayUrl,
    });
    setGatewayApi(gatewayApi);
  }, []);

  const adexState = useContext(AdexStateContext);
  const rdt = useRdt();
  const accounts = useAccounts();
  const [bestSell, setBestSell] = useState<number>(0);
  const [bestBuy, setBestBuy] = useState<number>(0);
  const connected = true;

  const [token1Balance, setToken1Balance] = useState<number>(0);
  const [token2Balance, setToken2Balance] = useState<number>(0);
  const [orderType, setOrderType] = useState<adex.OrderType>(
    adex.OrderType.MARKET
  );
  const [orderSide, setOrderSide] = useState<adex.OrderSide>(
    adex.OrderSide.BUY
  );
  const [selectedToken, setSelectedToken] = useState<adex.TokenInfo>(
    adexState.currentPairInfo.token1
  );
  const [unselectedToken, setUnselectedToken] = useState<adex.TokenInfo>(
    adexState.currentPairInfo.token2
  );
  const [token1Selected, setToken1Selected] = useState<Boolean>(true);
  const [positionSize, setPositionSize] = useState<number>(0);
  const [price, setPrice] = useState<number>((bestBuy + bestSell) / 2);
  const [slippagePercent, setSlippagePercent] = useState<number>(1);
  const [swapText, setSwapText] = useState<string | null>(null);
  const platformBadgeID = 1;
  const platformFee = 0.001; //TODO: Get this data from the platform badge and set it as a global variable

  async function getAccountResourceBalance(
    resourceAddress: string,
    account: string
  ) {
    try {
      const response =
        await gatewayApi?.state.innerClient.entityFungibleResourceVaultPage({
          stateEntityFungibleResourceVaultsPageRequest: {
            address: account,
            // eslint-disable-next-line camelcase
            resource_address: resourceAddress,
          },
        });
      const output = parseFloat(response ? response.items[0].amount : "0");
      return output;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  async function fetchBalances(
    address1: string,
    address2: string,
    account: string
  ) {
    try {
      const token1Balance = (await getAccountResourceBalance(
        "resource_tdx_d_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxepwmma",
        // address1,
        account
      )) as number;
      const token2Balance = (await getAccountResourceBalance(
        "resource_tdx_d_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxepwmma",
        // address2,
        account
      )) as number;
      setToken1Balance(token1Balance);
      setToken2Balance(token2Balance);
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  }

  //Updates token balances
  useEffect(() => {
    const account = accounts.length > 0 ? accounts[0].address : "";
    console.log(account);
    if (
      adexState.currentPairInfo.token1.address &&
      adexState.currentPairInfo.token2.address &&
      account &&
      gatewayApi
    ) {
      console.log(rdt);
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
    gatewayApi,
  ]);

  //Updates selected side (token1/token2)
  useEffect(() => {
    setSelectedToken(adexState.currentPairInfo.token1);
    setUnselectedToken(adexState.currentPairInfo.token2);
    setToken1Selected(true);
  }, [adexState.currentPairInfo.token1, adexState.currentPairInfo.token2]);

  //Updates bestbuy, bestsell, price on new pair select
  useEffect(() => {
    //TODO: Don't generate these numbers like an idiot by getting the whole orderbook from adex
    setBestBuy(adexState.currentPairOrderbook.buys[0]?.price);
    setBestSell(
      adexState.currentPairOrderbook.sells[
        adexState.currentPairOrderbook.sells.length - 1
      ]?.price
    );
    setPrice(0);
  }, [adexState.currentPairInfo]);

  //sets price to halfway point
  useEffect(() => {
    if (!price || price === 0 || Number.isNaN(price)) {
      setPrice((bestBuy + bestSell) / 2);
    }
  }, [bestBuy, bestSell]);

  //applies styling to tabs
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
    return getActiveTabClass(selectedToken, tabsToken);
  }

  async function getQuote(
    sendingToken?: adex.TokenInfo,
    quoteOrderSide?: adex.OrderSide,
    sendingAmount?: number
  ) {
    const minPosition = token1Selected
      ? adexState.currentPairInfo.minOrderToken1
      : adexState.currentPairInfo.minOrderToken2;

    if (
      orderSide !== adex.OrderSide.BUY &&
      (positionSize < minPosition || !positionSize)
    ) {
      return null;
    }

    const orderPrice = orderType !== adex.OrderType.MARKET ? price : -1;
    const orderSlippage =
      orderType !== adex.OrderType.MARKET ? -1 : slippagePercent / 100;

    sendingToken = sendingToken || selectedToken;
    quoteOrderSide = quoteOrderSide || orderSide;
    sendingAmount = sendingAmount || positionSize;

    try {
      const response = await adex.getExchangeOrderQuote(
        adexState.currentPairInfo.address,
        orderType,
        quoteOrderSide,
        sendingToken.address,
        sendingAmount,
        platformFee,
        orderPrice,
        orderSlippage
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function createTx() {
    const validationError =
      !positionSize || //Haven't input a position size
      positionSize <= 0 || //done it dumb
      (orderType !== adex.OrderType.MARKET && //LIMIT or POST order
        ((price < 0 && slippagePercent < 0) || //haven't input price or slippage
          (price > 0 && slippagePercent > 100) || //Input both price and slippage
          !(price || slippagePercent))); //No input for price or slippage
    //TODO: Check user has funds for tx
    //TODO: Check for crazy slippage
    //TODO: Fat finger checks
    if (validationError) {
      alert("Please correctly fill out all fields");
      return;
    }

    const orderPrice = orderType !== adex.OrderType.MARKET ? price : -1;
    const orderSlippage =
      orderType !== adex.OrderType.MARKET ? -1 : slippagePercent / 100;

    console.log(
      "ORDER INPUT DETAILS:\n Pair %s\nType %s \nSide %s \n token address %s\namount %f\nprice %f\nslip %f\nfrontend%f\naccount %s\naccount %s",
      adexState.currentPairAddress,
      orderType,
      orderSide,
      selectedToken.address,
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
      selectedToken.address,
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
  }

  //TODO: adjust logic to take account of buy/sell
  //Sell side works correctly
  //Buy side rounds incorrectly
  function safelySetPositionSize(position: number) {
    if (position === 0 || position === null || !position) {
      setPositionSize(0);
      return;
    }

    const currentPairInfo = adexState.currentPairInfo;
    const maxDigits = token1Selected
      ? currentPairInfo.maxDigitsToken1
      : currentPairInfo.maxDigitsToken2;
    const minPosition = token1Selected
      ? currentPairInfo.minOrderToken1
      : currentPairInfo.minOrderToken2;
    if (position < minPosition) {
      generateAndSetSwapText(
        selectedToken.symbol,
        0,
        unselectedToken.symbol,
        0,
        " Order size too small."
      );
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

  //TODO: On limit buy orders, if liquidity at price is lower than available funds, available funds should be used
  async function setPercentageOfFunds(proportion: number) {
    proportion = proportion / 100;
    if (proportion < 0) {
      setPositionSize(0);
      return;
    }

    if (orderSide === adex.OrderSide.SELL) {
      if (token1Selected) {
        safelySetPositionSize(token1Balance * proportion);
      } else {
        safelySetPositionSize(token2Balance * proportion);
      }
    } else if (orderSide === adex.OrderSide.BUY) {
      const tokenBalance = token1Selected ? token2Balance : token1Balance;

      try {
        const quote: adex.SwapQuote | null = await getQuote(
          unselectedToken,
          adex.OrderSide.SELL,
          tokenBalance * proportion
        );

        if (quote) {
          if (
            orderType !== adex.OrderType.MARKET &&
            quote.fromAmount === 0 &&
            quote.toAmount === 0
          ) {
            // Flips the numbers when calculating returns
            safelySetPositionSize(
              token1Selected
                ? (tokenBalance * proportion) / price
                : tokenBalance * proportion * price
            );
          } else {
            safelySetPositionSize(quote.toAmount);
          }
        } else {
          setPositionSize(0); // Handle the case when quote is null
        }
      } catch (error) {
        setPositionSize(0);
        console.error(error);
      }
    }
  }

  //Updates swap quote
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
          const otherAmount = token1Selected
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
        console.error(error);
        setSwapText("");
      });
  }, [
    positionSize,
    price,
    slippagePercent,
    adexState.currentPairInfo,
    selectedToken,
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
            setSelectedToken(adexState.currentPairInfo.token1);
            setUnselectedToken(adexState.currentPairInfo.token2);
            setToken1Selected(true);
          }}
        >
          {adexState.currentPairInfo.token1.name}
        </a>
        <a
          className={activeTokenTabClass(adexState.currentPairInfo.token2)}
          onClick={() => {
            setSelectedToken(adexState.currentPairInfo.token2);
            setUnselectedToken(adexState.currentPairInfo.token1);
            setToken1Selected(false);
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
            {orderSide} {selectedToken.name}
          </button>
        </div>
      )}
    </div>
  );
}
