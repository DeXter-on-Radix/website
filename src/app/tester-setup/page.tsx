"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const TesterSetup = () => {
  const router = useRouter();

  useEffect(() => {
    router.push(
      "https://ductus.notion.site/DeXter-Beta-Tester-Setup-106a4c8666088049987dc71fe4bb3daa"
    );
  }, [router]);

  return null;
};

export default TesterSetup;
