import { useRdtState } from "./useRdtState";
import { useRdt } from "./useRdt";

export const useAccounts = () => {
  // const state = useRdtState();
  const rdt = useRdt();
  // return state?.accounts ?? [];
  return rdt?.accounts ?? [];
};
