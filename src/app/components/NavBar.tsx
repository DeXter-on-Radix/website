import React from "react";

import { dexterLogo } from "assets/svg";
import Image from "next/image";

export function Navbar() {
  return (
    <div className="col-span-12 navbar px-4">
      <div className="navbar-start">
        <Image src={dexterLogo} alt="dexterLogo" />
      </div>
      <div className="navbar-end">
        <radix-connect-button className="btn"></radix-connect-button>
      </div>
    </div>
  );
}
