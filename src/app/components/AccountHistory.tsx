// import "react";

// export function AccountHistory() {
//   return (
//     // <div>
//     //   <div>
//     //     <Button label="Open Orders" value={TABLES.OPEN_ORDERS} />
//     //     <Button label="Order History" value={TABLES.ORDER_HISTORY} />
//     //     <Button label="Trade History" value={TABLES.TRADE_HISTORY} />
//     //     <button className="btn btn-ghost normal-case text-xl">
//     //       Show all orders
//     //     </button>
//     //     <button className="btn btn-ghost normal-case text-xl">
//     //       Export as CSV
//     //     </button>
//     //   </div>
//     //   <DisplayTable
//     //     orderReceiptData={orderReceiptData}
//     //     selectedTable={selectedTable}
//     //     onCancelOrder={cancelOrder}
//     //     account={account}
//     //   />
//     // </div>
//     <div>
//       <div>AccountHistory TODO</div>
//     </div>
//   );
// }
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchAccountHistory } from "../redux/accountHistorySlice"; // Replace with the correct path to your Redux slice

// export function AccountHistory() {
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     dispatch(fetchAccountHistory());
//   }, [dispatch]);

//   return (
//     <div>
//       <div>AccountHistory TODO</div>
//     </div>
//   );
// }

export function AccountHistory() {
  const dispatch = useAppDispatch();

  // Selectors to get account and pairAddress from the state
  const account = useAppSelector(
    (state) => state.radix?.walletData.accounts[0]?.address
  );
  const pairAddress = useAppSelector((state) => state.pairSelector.address);

  useEffect(() => {
    if (account && pairAddress) {
      dispatch(fetchAccountHistory());
    }
  }, [dispatch, account, pairAddress]); // Effect runs whenever account or pairAddress changes

  return (
    <div>
      <div>AccountHistory TODO</div>
    </div>
  );
}
