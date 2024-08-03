"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector, useHydrationErrorFix } from "hooks";
import { getSupportedLanguagesAsString } from "../state/i18nSlice";

import { i18nSlice } from "../state/i18nSlice";
import { radixSlice } from "../state/radixSlice";

import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { isMobile, shortenWalletAddress } from "../utils";
import {
  fetchAccountHistory,
  accountHistorySlice,
} from "../state/accountHistorySlice";
import { fetchBalances, pairSelectorSlice } from "../state/pairSelectorSlice";
// eslint-disable-next-line no-restricted-imports
import { WalletDataStateAccount } from "@radixdlt/radix-dapp-toolkit";
import { rewardSlice } from "state/rewardSlice";

interface NavbarItemProps {
  title: string;
  target: string;
}
interface NavbarItemMobileProps extends NavbarItemProps {
  setMenuOpen: (newMenuOpenState: boolean) => void;
}

const NavItems: { path: string; title: string }[] = [
  {
    path: "/trade",
    title: "Trade",
  },
  {
    path: "/rewards",
    title: "Rewards",
  },
];

export function Navbar() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const radixConnectButton = document.querySelector("radix-connect-button")!;
    // Trigger disconnect actions
    const handleDisconnect = () => {
      dispatch(accountHistorySlice.actions.resetAccountHistory());
      dispatch(pairSelectorSlice.actions.resetBalances());
    };

    radixConnectButton.addEventListener("onDisconnect", handleDisconnect);

    return () => {
      radixConnectButton.removeEventListener("onDisconnect", handleDisconnect);
    };
  }, [dispatch]);

  return (
    <nav
      className={
        "sticky top-0 sm:border-b-0 border-b-2 sm:border-none border-gray-800 sm:static " +
        "bg-base-200 sm:bg-transparent flex items-center justify-between w-full !h-[64px] !min-h-[64px] " +
        "z-[101]" // needed for main screen since divs use z-[100]
      }
    >
      <div className="flex h-full">
        <Logo />
        <NavbarItemsDesktop />
      </div>
      <div className="flex items-center content-center h-full relative">
        <div className="flex pr-4">
          <HideOnSmallScreens>
            <LanguageSelection />
          </HideOnSmallScreens>
          {/* ensure radix connect button is only initialized once */}
          <WalletSelector />
          <radix-connect-button></radix-connect-button>
        </div>
        <HamburgerMenu />
      </div>
    </nav>
  );
}

function WalletSelector() {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, walletData, selectedAccount } = useAppSelector(
    (state) => state.radix
  );

  const menuRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLImageElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      iconRef.current &&
      !iconRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isConnected) {
    return <></>;
  }

  return (
    <div
      className="flex justify-center items-center cursor-pointer hover:bg-slate-700 px-2 mx-2 rounded"
      onClick={() => setIsOpen(!isOpen)}
    >
      <img ref={iconRef} src="/wallet.svg" alt="wallet icon" />
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-[64px] right-0 w-[350px] max-[500px]:pl-4 max-[500px]:w-[100vw] max-w-[100vw] max-h-[50vh] overflow-hidden rounded bg-[#232629] overflow-y-scroll scrollbar-thin border-red"
        >
          {walletData.accounts.map((account, indx) => {
            const selectAccount = (account: WalletDataStateAccount) => {
              Cookies.set("selectedAddress", account.address, { expires: 365 });
              dispatch(radixSlice.actions.selectAccount(account));
              dispatch(fetchBalances());
              dispatch(rewardSlice.actions.resetShowSuccessUi());
              dispatch(
                accountHistorySlice.actions.resetSelectedOrdersToCancel()
              );
              dispatch(fetchAccountHistory());
            };
            return (
              <div
                className={"hover:bg-slate-700 px-4"}
                onClick={() => selectAccount(account)}
                key={indx}
              >
                <div className="text-base font-bold pt-3 flex justify-between">
                  <span
                    className={`truncate ${
                      account.address === selectedAccount.address
                        ? "bg-gradient-to-r from-dexter-gradient-blue to-dexter-gradient-green to-80% bg-clip-text text-transparent font-base"
                        : ""
                    }`}
                  >
                    {account.label}
                  </span>
                  {account.address === selectedAccount.address ? (
                    <span className="pl-2 font-base font-normal">
                      (current)
                    </span>
                  ) : (
                    <></>
                  )}
                </div>
                <div className="truncate text-sm font-light opacity-80 pb-3 border-b-[1px] border-b-[#5d5d5d7a]">
                  {shortenWalletAddress(account.address)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Responsive logo component for the navbar
//  > 420px : show full logo and lettering
// <= 420px : show only logo
function Logo() {
  return (
    <>
      <Link className="flex justify-center items-center" href="/">
        <Image
          src="/dexter-logo-and-lettering.svg"
          alt="Dexter logo and lettering"
          width={110}
          height={110}
          className="!my-0 mx-5 hidden min-[420px]:block"
          priority={true}
        />
        <Image
          src="/dexter-logo.svg"
          alt="Dexter logo and lettering"
          width={30}
          height={30}
          className="!my-0 mx-5 min-[420px]:hidden"
          priority={true}
        />
      </Link>
    </>
  );
}

function NavbarItemsDesktop() {
  return (
    <>
      <div className="hidden sm:flex h-full items-center flex-1 px-2 mx-2 z-10">
        {NavItems.map((navItem, indx) => {
          return (
            <NavbarItemDesktop
              title={navItem.title}
              target={navItem.path}
              key={indx}
            />
          );
        })}
      </div>
    </>
  );
}

function HamburgerMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="sm:hidden flex justify-center items-center mr-6 ml-4 relative right-4">
      <button onClick={() => setMenuOpen(true)}>
        <AnimatedBurger menuOpen={menuOpen} />
      </button>
      <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </div>
  );
}

function MobileMenu({
  menuOpen,
  setMenuOpen,
}: {
  menuOpen: boolean;
  setMenuOpen: (newMenuOpen: boolean) => void;
}) {
  const isClient = useHydrationErrorFix();
  if (!isClient) return null;

  return (
    <div
      className={`flex flex-col 
          items-end 
          w-[100vw] h-[100vh] 
          overflow-hidden 
          z-[1000] 
          fixed top-0 left-0 
          py-5
          bg-[rgba(0,0,0,0.8)] backdrop-blur-lg
           ${isMobile() ? "px-6" : "px-10"}
            ${
              menuOpen
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }
            transition-all duration-300
           `}
    >
      {/* Close Menu Button */}
      <button
        onClick={() => setMenuOpen(false)}
        className="absolute top-8 w-7 right-4"
      >
        <AnimatedBurger menuOpen={menuOpen} isInModal={true} />
      </button>
      {/* Navbar Items */}
      <div className="mt-10 w-full">
        {NavItems.map((navItem, indx) => {
          return (
            <NavbarItemMobile
              title={navItem.title}
              target={navItem.path}
              setMenuOpen={setMenuOpen}
              key={indx}
            />
          );
        })}
      </div>
      {/* Language Selection */}
      <div className="w-full flex flex-col items-center justify-center">
        <h3 className="w-full text-center text-secondary-content font-light text-base">
          Language Selection
        </h3>
        <LanguageSelection setMenuOpen={setMenuOpen} />
      </div>
    </div>
  );
}

function NavbarItemDesktop({ title, target }: NavbarItemProps) {
  const active = target === usePathname();
  return (
    <Link
      className={`h-full flex items-center px-5 hover:!no-underline hover:text-accent mb-0 ${
        active ? "border-b-2 border-[#cafc40]" : ""
      }`}
      href={target}
    >
      <p className={`text-sm ${active ? "text-[#cafc40]" : "text-white"}`}>
        {title}
      </p>
    </Link>
  );
}

function NavbarItemMobile({
  title,
  target,
  setMenuOpen,
}: NavbarItemMobileProps) {
  const active = target === usePathname();
  return (
    <Link
      className={`my-2 hover:!no-underline`}
      href={target}
      onClick={() => setMenuOpen(false)}
    >
      <p
        className={`text-2xl text-center py-4 ${
          active ? "text-[#cafc40]" : "text-white"
        }`}
      >
        {title}
      </p>
    </Link>
  );
}

function LanguageSelection({
  setMenuOpen,
}: {
  setMenuOpen?: (newMenuOpen: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const supportedLanguagesStr = useSelector(getSupportedLanguagesAsString);
  const supportedLanguages = supportedLanguagesStr.split(",");
  const { language } = useAppSelector((state) => state.i18n);

  const handleLanguageChange = (lang: string) => {
    Cookies.set("userLanguage", lang, { expires: 365 }); // Set a cookie for 1 year
    dispatch(i18nSlice.actions.changeLanguage(lang.toLowerCase()));
    setMenuOpen && setMenuOpen(false); // close mobile menu
  };

  return (
    <div className="mr-4 flex">
      {supportedLanguages.map((lang) => (
        <button
          className={`uppercase py-2 px-2 sm:px-1 text-xl sm:text-sm ${
            language === lang ? "font-extrabold" : "font-extralight"
          }`}
          key={lang}
          onClick={() => handleLanguageChange(lang)}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}

function HideOnSmallScreens({ children }: { children: React.ReactNode }) {
  return <div className="hidden sm:flex">{children}</div>;
}

const AnimatedBurger = ({
  menuOpen,
  isInModal = false,
}: {
  menuOpen: boolean;
  isInModal?: boolean;
}) => {
  return (
    <div
      className={`
            absolute 
            top-1/2 
            ${menuOpen ? "-translate-y-2.5" : "-translate-y-1/2"}
            h-[0.175rem] w-7 

            rounded-sm
            ${menuOpen ? "bg-transparent" : "bg-secondary-content"}
            transition-all
            duration-500
            
            before:absolute 
            before:content-[""]
            before:h-[0.175rem] before:w-7
            before:-translate-x-3.5
            before:-translate-y-2.5
            before:rounded-sm
            before:bg-secondary-content
            before:transition-all
            before:duration-500
            ${menuOpen ? "before:rotate-45" : ""}
            ${isInModal ? "before:translate-y-2.5" : ""}

            after:absolute 
            after:content-[""]
            after:h-[0.175rem] after:w-7
            after:-translate-x-3.5
            after:translate-y-2.5
            after:rounded-sm
            after:bg-secondary-content
            after:transition-all after:duration-500
            ${menuOpen ? "after:-translate-y-2.5 after:-rotate-45" : ""}
            
            `}
    ></div>
  );
};
