"use client";

import { useHydrationErrorFix } from "hooks";
import { twMerge } from "tailwind-merge";

interface DexterButtonProps {
  label: string;
  targetUrl?: string;
  targetBlank?: boolean;
  onClick?: () => void;
  width?: string;
  height?: string;
  wrapperClassName?: string;
  labelClassName?: string;
}

export function DexterButton({
  label,
  targetUrl = "",
  targetBlank,
  onClick = () => {},
  width = "w-[220px]",
  height = "h-[44px]",
  wrapperClassName = "",
  labelClassName = "",
}: DexterButtonProps) {
  const isClient = useHydrationErrorFix();

  if (!isClient) return null;

  const wrapperDefaultClassName = `dexter-btn
     inline-flex items-center justify-center
     ${width} 
     min-${height}
  `;
  const labelDefaultClassName = "font-bold text-sm tracking-[.1px]";

  return (
    <a
      href={targetUrl}
      target={`${targetBlank ? "_blank" : ""}`}
      onClick={onClick}
      className={twMerge(wrapperDefaultClassName, wrapperClassName)}
    >
      <span className={twMerge(labelDefaultClassName, labelClassName)}>
        {label}
      </span>
    </a>
  );
}
