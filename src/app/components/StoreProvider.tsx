"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "state/store";
import { initializeSubscriptions, unsubscribeAll } from "subscriptions";

const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize store
  useEffect(() => {
    initializeSubscriptions(store);
    return () => {
      unsubscribeAll();
    };
  }, []);

  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;
