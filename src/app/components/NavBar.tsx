import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "hooks";
import { getSupportedLanguagesAsString } from "../state/i18nSlice";

import { i18nSlice } from "../state/i18nSlice";

import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { isMobile } from "../utils";

const NavItems: { path: string; title: string }[] = [
  {
    path: "/",
    title: "Trade",
  },
  // // TODO: comment back in when rewards launch
  // {
  //   path: "/rewards",
  //   title: "Rewards",
  // },
];

export function Navbar() {
  return (
    <nav className="flex items-center justify-between w-full !h-[74px] !min-h-[74px]">
      <Image
        src="/dexter-logo-and-lettering.svg"
        alt="Dexter logo and lettering"
        width={130}
        height={130}
        className="!my-0 mx-5"
        priority={true}
      />
      {/* DESKTOP VERSION */}
      <NavbarContentDesktop />
      {/* MOBILE VERSION (with hamburger menu) */}
      <NavbarContentMobile />
    </nav>
  );
}

function NavbarContentDesktop() {
  return (
    <>
      <div className="hidden sm:flex h-full items-center flex-1 px-2 mx-2 mt-1 z-10">
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
      <div className="hidden sm:flex p-2 pr-4">
        <LanguageSelection />
        <radix-connect-button></radix-connect-button>
      </div>
    </>
  );
}

function NavbarContentMobile() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="sm:hidden flex justify-center items-center mr-6">
      <button onClick={() => setMenuOpen(true)}>
        <Image
          src="/hamburger-icon.svg"
          alt="menu"
          width="32"
          height="32"
          className="h-auto color-white"
        />
      </button>
      {menuOpen && <MobileMenu setMenuOpen={setMenuOpen} />}
    </div>
  );
}

function MobileMenu({
  setMenuOpen,
}: {
  setMenuOpen: (newMenuOpen: boolean) => void;
}) {
  return (
    <div
      className={`flex flex-col items-end w-[100vw] h-[100vh] bg-transparent overflow-hidden z-30 fixed top-0 left-0 backdrop-blur-lg py-5 ${
        isMobile() ? "px-6" : "px-10"
      }`}
    >
      {/* Close Menu Button */}
      <button onClick={() => setMenuOpen(false)}>
        <Image
          src="/close-x.svg"
          alt="menu"
          width="32"
          height="32"
          className="h-auto color-white opacity-70"
        />
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
        <LanguageSelection />
      </div>
    </div>
  );
}

interface NavbarItemProps {
  title: string;
  target: string;
}
interface NavbarItemMobileProps extends NavbarItemProps {
  setMenuOpen: (newMenuOpenState: boolean) => void;
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

function LanguageSelection() {
  const dispatch = useAppDispatch();
  const supportedLanguagesStr = useSelector(getSupportedLanguagesAsString);
  const supportedLanguages = supportedLanguagesStr.split(",");
  let { language } = useAppSelector((state) => state.i18n);

  const handleLanguageChange = (lang: string) => {
    dispatch(i18nSlice.actions.changeLanguage(lang.toLowerCase()));
    Cookies.set("userLanguage", lang, { expires: 365, partitioned: true }); // Set a cookie for 1 year
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
