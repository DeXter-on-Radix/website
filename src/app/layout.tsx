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

  return (
    <html lang="en" data-theme="dark">
      <Provider store={store}>
        <body className={inter.className}>
          <div className="grid grid-cols-12 h-full prose md:prose-lg lg:prose-xl max-w-none divide-y-4 divide-base-300">
            <Navbar />
            {children}
            <Footer />
          </div>
        </body>
      </Provider>
    </html>
  );
}
