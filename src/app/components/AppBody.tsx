"use client";

import React, { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "hooks";
import { detectBrowserLanguage } from "utils";
import { i18nSlice } from "state/i18nSlice";
import Cookies from "js-cookie";
import { Navbar } from "./NavBar";
import { Footer } from "./Footer";
import { DexterToaster } from "./DexterToaster";

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
  }, [dispatch, supportedLanguages]);

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

export default AppBody;
