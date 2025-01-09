"use client";

import { DexterButton } from "components/DexterButton";
import { usePathname, useRouter } from "next/navigation";
import { getRedirectUrl, isRedirectPath } from "./redirects";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  // Redirect logic
  if (isRedirectPath(pathname)) {
    router.push(getRedirectUrl(pathname));
    return <p className="text-sm p-6">Redirecting...</p>;
  }

  // Regular 404 page
  return (
    <div className="w-full mt-8 max-[401px]:mb-16 max-md:mb-20 max-xl:mb-24 xl:mb-32 h-full flex flex-col justify-center items-center">
      <h2 className="bg-gradient-to-r from-dexter-gradient-blue to-dexter-gradient-green to-80% bg-clip-text text-transparent">
        <span className="max-[401px]:text-5xl max-sm:text-6xl max-lg:text-7xl max-xl:text-8xl text-9xl font-normal">
          404 :(
        </span>
      </h2>
      <p className="max-[401px]:text-base max-sm:text-lg max-xl:text-xl text-2xl font-normal text-white/90">
        You got the wrong way
      </p>

      <DexterButton
        title="Back to trade"
        targetUrl="/trade"
        buttonClassName="md:mt-10"
      />
    </div>
  );
}
