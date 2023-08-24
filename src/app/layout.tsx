"use client";

import "./styles/globals.css";
import { initializeSubscriptions, unsubscribeAll } from "./subscriptions";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/NavBar";
import { store } from "./redux/store";
import { Provider } from "react-redux";

const inter = Inter({ subsets: ["latin"] });

// declare the radix-connect-button as a global custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "radix-connect-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <html lang="en">
      <head>
        <title>DeXter</title>
      </head>
      <Provider store={store}>
        <body className={inter.className}>
          <div className="flex flex-col prose md:prose-lg lg:prose-xl max-w-none">
            <Navbar />

            <div className="h-full">{children}</div>

            <Footer />
          </div>
        </body>
      </Provider>
    </html>
  );
}
