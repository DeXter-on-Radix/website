import { useEffect, useState } from "react";
import { useRdt } from "./useRdt";
import { WalletData } from "./../types";

export const useRdtState = () => {
  const rdt = useRdt();
  const [state, setState] = useState<WalletData>();

  useEffect(() => {
    console.log("UseRdtState trying to set state");
    console.log(rdt);
    if (rdt && rdt.walletApi) {
      const subscription = rdt.walletApi.walletData$.subscribe((state) => {
        setState(state);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  },[rdt.walletApi, rdt]);

  return state;
};
