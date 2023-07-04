import { useContext } from "react";
import { AdexStateContext } from "./page";

export function OrderBook({ orders, type }) {
  return (
      <>
      {orders.map((item, index ) => (
            <tbody key={index}>
              <tr>
                <th>{type}</th>
                <td>{item.price}</td>
                <td>{item.quantityRemaining}</td>
                <td>{item.valueRemaining}</td>
              </tr>
            </tbody>
      ))}
      </>
  );
}