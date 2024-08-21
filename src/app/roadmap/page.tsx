"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Roadmap = () => {
  const router = useRouter();

  useEffect(() => {
    router.push(
      "https://ductus.notion.site/DeXter-Roadmap-e8faed71fe1c4cdf95fb247f682c0d3a"
    );
  }, [router]);

  return null;
};

export default Roadmap;
