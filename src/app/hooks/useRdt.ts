import { useContext } from "react";
import { RdtContext } from "../contexts";

export const useRdt = () => {
  const rdt = useContext(RdtContext);

  return rdt;
};
