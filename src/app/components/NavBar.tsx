import React from "react";
import Image from "next/image";

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
        <radix-connect-button className="btn"></radix-connect-button>
      </div>
    </div>
  );
}
