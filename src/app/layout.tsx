import "./styles/globals.css";
import StoreProvider from "components/StoreProvider";
import AppBody from "components/AppBody";

// TODO: add metadata https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration#step-2-creating-a-root-layout

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className="scrollbar-none">
      <head>
        <title>DeXter</title>
      </head>
      <StoreProvider>
        <AppBody>{children}</AppBody>
      </StoreProvider>
    </html>
  );
}
