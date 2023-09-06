import React from "react";

export function Navbar() {
  return (
    <div className="col-span-12 navbar">
      <div className="navbar-start">
        <a className="btn btn-ghost normal-case text-xl">DeXter</a>
      </div>
      <div className="navbar-end">
        <radix-connect-button className="btn"></radix-connect-button>
      </div>
    </div>
  );
}
