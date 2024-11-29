"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Contribute = () => {
  const router = useRouter();

  useEffect(() => {
    router.push(
      "https://github.com/DeXter-on-Radix/website/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22"
    );
  }, [router]);

  return null;
};

export default Contribute;
