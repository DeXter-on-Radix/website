"use client";

import "./styles/globals.css";

import { Footer } from "./components/Footer";
import { Navbar } from "./components/NavBar";
import { Provider } from "react-redux";
import { usePathname } from "next/navigation";
import { DexterToaster } from "./components/DexterToaster";
import { useEffect } from "react";
import { initializeSubscriptions, unsubscribeAll } from "./subscriptions";
import { store } from "./state/store";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize store
  useEffect(() => {
    initializeSubscriptions(store);
    return () => {
      unsubscribeAll();
    };
  }, []);

  const path = usePathname();

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
          <DexterToaster toastPosition="top-center" />
          <div
            data-path={path}
            className="h-screen prose md:prose-lg lg:prose-xl max-w-none flex flex-col"
          >
            <div className="flex flex-col justify-between min-h-[100vh] max-w-[100vw] overflow-x-hidden">
              <Navbar />
              {children}
              <Footer />
            </div>
          </div>
        </body>
      </Provider>
    </html>
  );
}
