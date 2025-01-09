"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const RakoonRevenue = () => {
  const router = useRouter();

  useEffect(() => {
    router.push(
      "https://docs.google.com/spreadsheets/d/1xyEob71d5c2eHuQjq1P60DXaAeeuboB2nSQFztiWviU/edit?usp=sharing"
    );
  }, [router]);

  return null;
};

export default RakoonRevenue;
