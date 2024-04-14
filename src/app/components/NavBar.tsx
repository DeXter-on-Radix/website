import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "hooks";
import { getSupportedLanguagesAsString } from "../state/i18nSlice";

import { i18nSlice } from "../state/i18nSlice";

import Cookies from "js-cookie";
import { usePathname } from "next/navigation";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between min-h-16 w-full h-20">
      <Image
        src="/dexter-logo-and-lettering.svg"
        alt="Dexter logo and lettering"
        width={122}
        height={122}
        className="!my-0 pl-2 mx-3 p-2"
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
        <NavbarItem title="Trade" target="/" />
        {/* <NavbarItem title="Rewards" target="/rewards" /> */}
      </div>
      <div className="hidden sm:flex p-2">
        <LanguageSelection />
        <radix-connect-button></radix-connect-button>
      </div>
    </>
  );
}

function NavbarContentMobile() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="sm:hidden flex justify-center items-center mr-4">
      <button onClick={() => setMenuOpen(!menuOpen)}>
        <Image
          src="/hamburger-icon.svg"
          alt="menu"
          width="32"
          height="32"
          className="h-auto color-white"
        />
      </button>
      {menuOpen && (
        <div className="flex flex-col items-end pt-10 pr-12 w-[100vw] h-[100vh] bg-transparent overflow-hidden z-30 fixed top-0 left-0 backdrop-blur-xl">
          <button onClick={() => setMenuOpen(false)}>CLOSE</button>
          <div>Trade</div>
          <div>Trade</div>
          <radix-connect-button></radix-connect-button>
          <LanguageSelection />
        </div>
      )}
    </div>
  );
}

interface NavbarItemProps {
  title: string;
  target: string;
}

function NavbarItem({ title, target }: NavbarItemProps) {
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

function LanguageSelection() {
  const dispatch = useAppDispatch();
  const supportedLanguagesStr = useSelector(getSupportedLanguagesAsString);
  const supportedLanguages = supportedLanguagesStr.split(",");
  let { language } = useAppSelector((state) => state.i18n);

  const handleLanguageChange = (lang: string) => {
    dispatch(i18nSlice.actions.changeLanguage(lang.toLowerCase()));
    Cookies.set("userLanguage", lang, { expires: 365 }); // Set a cookie for 1 year
  };

  return (
    <div className="mr-4 flex">
      {supportedLanguages.map((lang) => (
        <button
          className={`uppercase text-sm px-1 ${
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
