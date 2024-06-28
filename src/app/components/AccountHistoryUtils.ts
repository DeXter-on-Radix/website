import { PairInfo } from "alphadex-sdk-js/lib/models/pair-info";
import { Order } from "state/accountHistorySlice";

export function getOrderIdentifier(order: Order): string {
  return constructOrderIdentifier(order.pairAddress, order.orderReceiptId);
}
export function getOrderIdentifierFromAdex(adexOrderReceipt: any): string {
  return constructOrderIdentifier(
    adexOrderReceipt.pairAddress,
    adexOrderReceipt.id
  );
}
function constructOrderIdentifier(pairAddress: string, id: string) {
  return `${pairAddress}_Order#${id}#`;
}

export function createOrderReceiptAddressLookup(
  pairsList: PairInfo[]
): Record<string, string> {
  const orderReceiptAddressLookup: Record<string, string> = {};
  pairsList.forEach((pairInfo) => {
    orderReceiptAddressLookup[pairInfo.address] = pairInfo.orderReceiptAddress;
  });
  return orderReceiptAddressLookup;
}

export function getBatchCancelManifest({
  userAccount,
  orders,
}: {
  userAccount: string;
  orders: Order[];
}) {
  let manifest = orders
    .map(({ pairAddress, orderReceiptAddress, orderReceiptId }, indx) => {
      return `
        CALL_METHOD
          Address("${userAccount}")
          "create_proof_of_non_fungibles"
          Address("${orderReceiptAddress}")
          Array<NonFungibleLocalId>(
            NonFungibleLocalId("#${orderReceiptId}#")
          )
        ;
        POP_FROM_AUTH_ZONE
          Proof("proof${indx + 1}")
        ;
        CALL_METHOD
          Address("${pairAddress}")
          "cancel_order"
          Proof("proof${indx + 1}")
        ;`;
    })
    .join("\n");
  manifest += `
        CALL_METHOD
          Address("${userAccount}")
          "deposit_batch"
          Expression("ENTIRE_WORKTOP")
        ;
  `;
  return manifest;
}
