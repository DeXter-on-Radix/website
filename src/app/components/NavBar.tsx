import React from "react";
import Image from "next/image";
import { FaRegMoon } from "react-icons/fa6";

// TODO: theme switching

export function Navbar() {
  return (
    <div className="col-span-12 navbar">
      <div className="navbar-start">
        <a
          href="/"
          className="btn btn-ghost hover:bg-transparent no-underline text-xl p-0"
        >
          <Image
            src="/logo_icon.svg"
            alt="Dexter Logo"
            width={40}
            height={40}
            className="!my-0"
          />
          <span className="xs:invisible sm:visible uppercase">DeXter</span>
        </a>
      </div>

      <div className="navbar-end">
        <div
          className="btn mx-2 border-none"
          style={{ height: "40px", minHeight: "40px" }}
        >
          <FaRegMoon className="h-6 w-6 text-secondary-content" />
        </div>

        <radix-connect-button></radix-connect-button>
      </div>
    </div>
  );
}
