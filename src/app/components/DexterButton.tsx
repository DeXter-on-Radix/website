"use client";

import { useHydrationErrorFix } from "hooks";
import { twMerge } from "tailwind-merge";

interface DexterButtonProps {
  title: string;
  targetUrl?: string;
  targetBlank?: boolean;
  maxWidth?: string;
  minHeight?: string;
  wrapperClassName?: string;
  buttonClassName?: string;
  labelClassName?: string;
}

export function DexterButton({
  title,
  targetUrl,
  targetBlank,
  maxWidth = "w-[220px]",
  minHeight = "h-[44px]",
  wrapperClassName = "",
  buttonClassName = "",
  labelClassName = "",
}: DexterButtonProps) {
  const isClient = useHydrationErrorFix();

  if (!isClient) return null;

  const wrapperDefaultClassName = `z-100 min-w-[220px] max-${maxWidth}`;
  const buttonDefaultClassName = `min-${minHeight} ${maxWidth} px-4 mb-6 mt-8 rounded bg-dexter-green-OG text-black uppercase opacity-100`;
  const labelDefaultClassName = "font-bold text-sm tracking-[.1px]";

  return (
    <a
      href={targetUrl}
      className={twMerge(wrapperDefaultClassName, wrapperClassName)}
      target={`${targetBlank ? "_blank" : ""}`}
    >
      <button className={twMerge(buttonDefaultClassName, buttonClassName)}>
        <span className={twMerge(labelDefaultClassName, labelClassName)}>
          {title}
        </span>
      </button>
    </a>
  );
}
