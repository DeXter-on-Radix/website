"use client";

import "./styles/globals.css";

import { Footer } from "./components/Footer";
import { Navbar } from "./components/NavBar";
import { Provider } from "react-redux";
import { usePathname } from "next/navigation";
import { DexterToaster } from "./components/DexterToaster";
import { useEffect, Suspense } from "react";
import { initializeSubscriptions, unsubscribeAll } from "./subscriptions";
import { store } from "./state/store";

import { detectBrowserLanguage } from "./utils";
import { i18nSlice } from "./state/i18nSlice";

import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "hooks";

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

  // TODO: after MVP remove "use client", fix all as many Components as possible
  // to be server components for better SSG and SEO
  // and use metadata https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration#step-2-creating-a-root-layout

  return (
    <html lang="en" data-theme="dark" className="scrollbar-none">
      <head>
        <title>DeXter</title>
      </head>
      <Provider store={store}>
        <AppBody>{children}</AppBody>
      </Provider>
    </html>
  );
}

// This subcomponent is needed to initialize browser language for the whole app
function AppBody({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const path = usePathname();

  // Detect browser langauge
  const { textContent } = useAppSelector((state) => state.i18n);
  const supportedLanguages = Object.keys(textContent);
  useEffect(() => {
    const userLanguageCookieValue = Cookies.get("userLanguage");
    if (userLanguageCookieValue) {
      dispatch(i18nSlice.actions.changeLanguage(userLanguageCookieValue));
    } else {
      const browserLang = detectBrowserLanguage();
      if (supportedLanguages.includes(browserLang)) {
        dispatch(i18nSlice.actions.changeLanguage(browserLang));
      }
    }
  }, [dispatch]);

  return (
    <body>
      <DexterToaster toastPosition="top-center" />
      <div
        data-path={path}
        className="h-screen prose md:prose-lg lg:prose-xl max-w-none flex flex-col"
      >
        <div className="flex flex-col justify-between min-h-[100vh] max-w-[100vw] overflow-x-hidden">
          <Navbar />
          {
            // When using useSearchParams from next/navigation we need to
            // wrap the outer component in a Suspense boundary, otherwise
            // the build on cloudflare fails. More info here:
            // https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
          }
          <Suspense>{children}</Suspense>
          <Footer />
        </div>
      </div>
    </body>
  );
}
