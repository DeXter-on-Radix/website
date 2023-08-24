import React from "react";

export function Navbar() {
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <a className="btn btn-ghost normal-case text-xl">DeXter</a>
      </div>

      <div className="navbar-end">
        <radix-connect-button className="btn"></radix-connect-button>
      </div>
    </div>
  );
}
