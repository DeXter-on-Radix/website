"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Treasury = () => {
  const router = useRouter();

  useEffect(() => {
    router.push(
      "https://dashboard.radixdlt.com/account/account_rdx168qrzyngejus9nazhp7rw9z3qn2r7uk3ny89m5lwvl299ayv87vpn5"
    );
  }, [router]);

  return null;
};

export default Treasury;
