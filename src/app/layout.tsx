"use client";

import "./styles/globals.css";

import { Footer } from "./components/Footer";
import { Navbar } from "./components/NavBar";
import { store } from "./state/store";
import { Provider } from "react-redux";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
