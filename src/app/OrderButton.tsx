import { useContext, useEffect, useState, useCallback } from "react";
import {
  AdexStateContext,
  WalletContext,
  RdtContext,
  GatewayContext,
} from "./contexts";
import { Account } from "@radixdlt/radix-dapp-toolkit";
import * as adex from "alphadex-sdk-js";
import { roundTo, RoundType } from "./utils";

export function OrderButton() {
  const adexState = useContext(AdexStateContext);
  const wallet = useContext(WalletContext);
  const rdt = useContext(RdtContext);
  const gatewayApi = useContext(GatewayContext);
  const [accounts, setAccounts] = useState<Account[]>([]);
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
  const [isBuySide, setIsBuySide] = useState<boolean>(true);
  const [selectedToken, setSelectedToken] = useState<adex.TokenInfo>(
    adexState.currentPairInfo.token1
  );
  const [unselectedToken, setUnselectedToken] = useState<adex.TokenInfo>(
    adexState.currentPairInfo.token2
  );
  const [token1Selected, setToken1Selected] = useState<Boolean>(true);
  const [positionSize, setPositionSize] = useState<number>(0);
  const [positionPercent, setPositionPercent] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);

  const [priceBox, setPriceBox] = useState<string>(
    "w-full m-2 p-2 rounded-none border"
  );
  const [slippagePercent, setSlippagePercent] = useState<number>(1);
  const [swapText, setSwapText] = useState<string | null>(null);
  const platformBadgeID = 1;
  const platformFee = 0.001; //TODO: Get this data from the platform badge and set it as a global variable
  const fees = 0.0025; //TODO: Get this data from the badge and set as global variable

  const getAccountResourceBalance = useCallback(
    async (resourceAddress: string, account: string) => {
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
        return 0;
      }
    },
    [gatewayApi]
  );

  const fetchBalances = useCallback(
    async (
      address1: string = adexState.currentPairInfo.token1.address,
      address2: string = adexState.currentPairInfo.token2.address,
      account: string = wallet ? wallet.accounts[0]?.address : ""
    ) => {
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
        console.error("Error fetching balances:", error);
      }
    },
    [setToken1Balance, setToken2Balance, getAccountResourceBalance]
  );

  //Updates token balances
  useEffect(() => {
    // const account = "";
    const account = wallet ? wallet.accounts[0]?.address : "";
    if (
      adexState.currentPairInfo.token1.address &&
      adexState.currentPairInfo.token2.address &&
      account &&
      gatewayApi
    ) {
      fetchBalances();
    }
  }, [
    adexState.currentPairInfo.token1.address,
    adexState.currentPairInfo.token2.address,
    connected,
    accounts,
    gatewayApi,
    fetchBalances,
    wallet,
  ]);

  //updates accounts
  useEffect(() => {
    if (wallet) setAccounts(wallet.accounts);
  }, [wallet]);

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
  }, [
    adexState.currentPairInfo,
    adexState.currentPairOrderbook.buys,
    adexState.currentPairOrderbook.sells,
  ]);

  //sets price on change screen
  useEffect(() => {
    if (price != 0) {
      return;
    }
    if ((token1Selected && isBuySide) || (!token1Selected && !isBuySide)) {
      setPrice(bestSell);
    } else {
      setPrice(bestBuy);
    }
  }, [bestBuy, bestSell, orderSide, price, token1Selected]);

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

  const getQuote = useCallback(
    async (
      sendingToken: adex.TokenInfo = selectedToken,
      quoteOrderSide: adex.OrderSide = orderSide,
      sendingAmount: number = positionSize
    ) => {
      const minPosition = token1Selected
        ? adexState.currentPairInfo.minOrderToken1
        : adexState.currentPairInfo.minOrderToken2;
      if (
        quoteOrderSide !== adex.OrderSide.BUY &&
        (sendingAmount < minPosition || !sendingAmount)
      ) {
        return null;
      }
      const orderPrice = orderType !== adex.OrderType.MARKET ? price : -1;
      const orderSlippage =
        orderType !== adex.OrderType.MARKET ? -1 : slippagePercent / 100;
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
    },
    [
      selectedToken,
      orderSide,
      positionSize,
      token1Selected,
      adexState.currentPairInfo.minOrderToken1,
      adexState.currentPairInfo.minOrderToken2,
      adexState.currentPairInfo.address,
      orderType,
      price,
      slippagePercent,
    ]
  );

  function createTx() {
    const validationError =
      !positionSize || //Haven't input a position size
      positionSize <= 0 || //done it dumb
      (orderType !== adex.OrderType.MARKET && //LIMIT or POST order
        ((price < 0 && slippagePercent < 0) || //haven't input price or slippagex`
          !(price || slippagePercent))); //No input for price or slippage
    //TODO: Check user has funds for tx
    //TODO: Check for crazy slippage
    //TODO: Fat finger checks
    if (validationError) {
      alert("Please correctly fill out all fields");
      return;
    }

    if (!isBuySide) {
      if (positionSize > (token1Selected ? token1Balance : token2Balance)) {
        alert("Insufficient funds for transaction");
        return;
      }
    } else {
      const tokenBalance = token1Selected ? token2Balance : token1Balance;
      if (
        //Logic is not entirely accurate for market orders
        (token1Selected ? positionSize * price : positionSize / price) >
        tokenBalance
      ) {
        alert("Insufficient funds for transaction");
        return;
      }
    }

    if (slippagePercent > 5) {
      alert(
        "Warning: High slippage entered, trade may return less than expected."
      );
    }
    //checks for excessively high/low price
    if (orderType === adex.OrderType.LIMIT) {
      if (isBuySide) {
        if (token1Selected && price > 1.05 * bestSell) {
          alert(
            //These should probably be "toasts" not "alerts"
            "Warning: Price entered is significantly above best sell. Trade may return less than expected."
          );
        } else if (!token1Selected && price < 0.95 * bestBuy) {
          alert(
            "Warning: Price entered is significantly below best buy. Trade may return less than expected."
          );
        }
      } else {
        //orderSide === SELL
        if (token1Selected && price < 0.95 * bestBuy) {
          alert(
            "Warning: Price entered is significantly below best buy. Trade may return less than expected."
          );
        } else if (!token1Selected && price > 1.05 * bestBuy) {
          alert(
            "Warning: Price entered is significantly above best sell. Trade may return less than expected."
          );
        }
      }
    }

    const orderPrice = orderType !== adex.OrderType.MARKET ? price : -1;
    const orderSlippage =
      orderType !== adex.OrderType.MARKET ? -1 : slippagePercent / 100;
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
        return adex.submitTransaction(data, rdt);
      })
      .then(() => {
        //temporary fix to update balances
        fetchBalances();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function safelySetPositionSize(position: number, percent: number = 0) {
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
    position = roundTo(position, maxDigits, RoundType.DOWN);
    setPositionSize(position);
    if (!percent) {
      setPositionPercent(0);
    }
  }

  async function setPercentageOfFunds(percentage: number) {
    const proportion = percentage / 100;
    if (proportion < 0) {
      setPositionSize(0);
      return;
    }
    if (percentage > 100) {
      percentage = Math.floor(percentage / 10);
      setPercentageOfFunds(percentage);
      return;
    }
    setPositionPercent(percentage);
    const tokenBalance =
      proportion *
      ((token1Selected && isBuySide) || (!token1Selected && !isBuySide)
        ? token2Balance
        : token1Balance);
    if (orderType !== adex.OrderType.MARKET) {
      if (!isBuySide) {
        safelySetPositionSize(tokenBalance, percentage);
      } else if (isBuySide) {
        // Flips the numbers when calculating returns
        safelySetPositionSize(
          token1Selected ? tokenBalance / price : tokenBalance * price,
          percentage
        );
      }
    } //market order, so need to calculate if there is liquidity to execute
    else
      try {
        // originally written for BUY side
        const quote: adex.SwapQuote | null = await getQuote(
          isBuySide ? unselectedToken : selectedToken,
          adex.OrderSide.SELL,
          tokenBalance
        );
        if (quote) {
          const percentCost = platformFee + fees + slippagePercent / 100;
          if (isBuySide) {
            const expectedReturn = token1Selected
              ? (tokenBalance / price) * (1 - percentCost)
              : tokenBalance * price * (1 - percentCost);

            if (expectedReturn > quote.toAmount) {
              //TODO: Add proper warning about not being able to market sell full stack
              console.log("Increase slippage to sell sufficient");
            }
            safelySetPositionSize(quote.toAmount, percentage);
          } else {
            const expectedReturn = token1Selected
              ? tokenBalance * price * (1 - percentCost)
              : (tokenBalance / price) * (1 - percentCost);

            if (expectedReturn > quote.fromAmount) {
              //TODO: Add proper warning about not being able to market sell full stack
              console.log("Increase slippage to sell sufficient");
            }
            safelySetPositionSize(quote.fromAmount, percentage);
          }
        } else {
          setPositionSize(0);
        }
      } catch (error) {
        setPositionSize(0);
        console.error(error);
      }
  }
  //Updates position size when percent is set and slippage is adjusted
  useEffect(() => {
    if (positionPercent && orderType === adex.OrderType.MARKET) {
      setPercentageOfFunds(positionPercent);
    }
  }, [slippagePercent]);

  function safelySetPrice(priceInput: number) {
    setPrice(priceInput);
    if (
      (((isBuySide && token1Selected) || (!isBuySide && !token1Selected)) &&
        priceInput > 1.1 * bestSell) ||
      (((!isBuySide && token1Selected) || (isBuySide && !token1Selected)) &&
        priceInput < 0.9 * bestBuy)
    ) {
      setPriceBox("w-full m-2 p-2 rounded-none border-red-900 bg-red-200");
    } else {
      setPriceBox("w-full m-2 p-2 rounded-none border");
    }
  }

  const generateAndSetSwapText = useCallback(
    (
      fromName: string,
      fromAmount: number,
      toName: string,
      toAmount: number,
      extraText?: string
    ) => {
      let text: string = `Sending ${fromAmount} ${fromName} to receive ${toAmount} ${toName}`;
      if (
        (!isBuySide && fromAmount < positionSize * 0.99) ||
        (isBuySide && toAmount < positionSize * 0.99)
      ) {
        text =
          text +
          ". !!! Order size greater than available liquidity. Reduce order or increase slippage !!!";
      }
      text = extraText ? text + extraText : text;
      setSwapText(text);
    },
    [orderSide, positionSize, setSwapText]
  );

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
          const fromAmount = isBuySide ? otherAmount : positionSize;
          const toAmount = isBuySide ? positionSize : otherAmount;
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
    getQuote,
    token1Selected,
    generateAndSetSwapText,
  ]);

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
          onClick={() => {
            setOrderSide(adex.OrderSide.BUY);
            setIsBuySide(true);
          }}
        >
          BUY
        </a>
        <a
          className={activeSideTabClass(adex.OrderSide.SELL)}
          onClick={() => {
            setOrderSide(adex.OrderSide.SELL);
            setIsBuySide(false);
          }}
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
            className="m-2 p-2 rounded-none border"
            value={Number.isNaN(positionSize) ? "0" : positionSize}
            onInput={(event) => {
              safelySetPositionSize(parseFloat(event.currentTarget.value));
            }}
          />
        </div>
        <div className="flex justify-between">
          <button
            className={"btn m-2" + (positionPercent === 25 ? " ring" : "")}
            onClick={() => {
              setPercentageOfFunds(25);
            }}
          >
            25%
          </button>
          <button
            className={"btn m-2" + (positionPercent === 50 ? " ring" : "")}
            onClick={() => {
              setPercentageOfFunds(50);
            }}
          >
            50%
          </button>
          <button
            className={"btn m-2" + (positionPercent === 75 ? " ring" : "")}
            onClick={() => {
              setPercentageOfFunds(75);
            }}
          >
            75%
          </button>
          <button
            className={"btn m-2" + (positionPercent === 100 ? " ring" : "")}
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
            className="m-2 p-2 rounded-none border"
            value={!Number.isNaN(positionPercent) ? positionPercent : ""}
            onInput={(event) =>
              setPercentageOfFunds(parseFloat(event.currentTarget.value))
            }
          />
        </div>
        {orderType === adex.OrderType.MARKET && (
          <div>
            <div className="flex">
              <label htmlFor="slippage" className="my-auto">
                Slippage
              </label>
              <input
                type="number"
                id="slippage"
                name="slippage"
                value={slippagePercent}
                className={
                  "w-full m-2 p-2 rounded-none border" +
                  (slippagePercent > 10 ? " border-red-900 bg-red-200" : "")
                }
                onInput={(event) => {
                  let slip = parseFloat(event.currentTarget.value);
                  slip = !Number.isNaN(slip) ? slip : 0;
                  setSlippagePercent(slip);
                }}
              />
              %
            </div>
            <br />
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
                className={priceBox}
                value={!Number.isNaN(price) ? price : ""}
                onInput={(event) => {
                  safelySetPrice(parseFloat(event.currentTarget.value));
                }}
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
