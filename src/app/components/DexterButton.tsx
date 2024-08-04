"use client";

import { useHydrationErrorFix } from "hooks";

interface DexterButtonProps {
  title: string;
  targetUrl?: string;
  targetBlank?: boolean;
  maxWidth?: string;
}

export function DexterButton({
  title,
  targetUrl,
  targetBlank,
  maxWidth = "w-[220px]",
}: DexterButtonProps) {
  const isClient = useHydrationErrorFix();

  if (!isClient) return null;

  return (
    <a
      href={targetUrl}
      className={`z-100 min-w-[220px] max-${maxWidth}`}
      target={`${targetBlank ? "_blank" : ""}`}
    >
      <button
        className={
          `min-h-[44px] ${maxWidth} px-4 my-6 mt-8 rounded ` +
          `bg-dexter-green-OG text-black uppercase ` +
          `opacity-100 cursor-pointer `
        }
      >
        <span className="font-bold text-sm tracking-[.1px] ">{title}</span>
      </button>
    </a>
  );
}
