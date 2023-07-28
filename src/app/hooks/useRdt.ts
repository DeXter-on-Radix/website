import { useContext } from "react";
import { RdtContext } from "../contexts";

export const useRdt = () => {
  // eslint-disable-next-line prettier/prettier
  const rdt = useContext(RdtContext)!

  return rdt;
};
