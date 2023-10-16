"use client";

import "./styles/globals.css";
import { initializeSubscriptions, unsubscribeAll } from "./subscriptions";
import { useEffect } from "react";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/NavBar";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import { usePathname } from "next/navigation";
import { getLocaleSeparators } from "utils";
import { uiSlice } from "redux/uiSlice";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();

  useEffect(() => {
    initializeSubscriptions(store);
    let separators = getLocaleSeparators();
    store.dispatch(
      uiSlice.actions.setDecimalSeparator(separators.decimalSeparator)
    );
    store.dispatch(
      uiSlice.actions.setThousandsSeparator(separators.thousandsSeparator)
    );
    return () => {
      unsubscribeAll();
    };
  }, []);

  // TODO: after MVP remove "use client", fix all as many Components as possible
  // to be server components for better SSG and SEO
  // and use metadata https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration#step-2-creating-a-root-layout

  return (
    <html lang="en" data-theme="dark">
      <head>
        <title>DeXter</title>
      </head>
      <Provider store={store}>
        <body>
          <div
            data-path={path}
            className="grid grid-cols-12 custom-auto-row-grid h-screen prose md:prose-lg lg:prose-xl max-w-none divide-y-4 divide-base-300"
          >
            <Navbar />
            {children}
            <Footer />
          </div>
        </body>
      </Provider>
    </html>
  );
}
