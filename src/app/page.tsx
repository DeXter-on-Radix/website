"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/trade");
  }, [router]);

  // Render nothing since we are redirecting for now without a home page
  return;
}
