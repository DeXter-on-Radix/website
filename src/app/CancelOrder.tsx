import * as adex from "alphadex-sdk-js";
import { RdtContext } from "./contexts";
import { useContext } from "react";

export function useCancelOrder() {
  const rdt = useContext(RdtContext);

  const cancelOrder = async (
    orderId: number,
    pairAddress: string,
    account: string
  ): Promise<void> => {
    try {
      const txdata = await adex.createCancelOrderTx(
        pairAddress,
        orderId,
        account
      );

      const response = await adex.submitTransaction(txdata.data, rdt);
    } catch (error) {}
  };

  return cancelOrder;
}
