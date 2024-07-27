"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export default function AnimatedCounter({
  value,
  direction = "up",
  wrapperClassName = "",
  counterClassName = "",
  formatNumberCallback = (num: number) =>
    Intl.NumberFormat("en-US").format(num),
  children,
}: {
  value: number;
  direction?: "up" | "down";
  wrapperClassName?: string;
  counterClassName?: string;
  formatNumberCallback?: (num: number) => string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 100,
    stiffness: 100,
  });

  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(direction === "down" ? 0 : value);
    }
  }, [motionValue, isInView, direction, value]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = formatNumberCallback(latest);
        }
      }),
    [springValue, formatNumberCallback]
  );

  return (
    <div className={wrapperClassName}>
      <span ref={ref} className={counterClassName} />
      {isInView && <span>{children}</span>}
    </div>
  );
}
