import React, { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_GRADIENT_BACKGROUND =
  "bg-gradient-to-r from-dexter-gradient-green from-10% to-dexter-gradient-blue to-90%";

export interface PromoBannerProps {
  imageUrl: string; // 600x80
  imageUrlMobile: string; // 600x200
  redirectUrl: string; // target redirect address when banner is clicked
  backgroundColor?: string; // background color, in the format of bg-[#fff]
}

interface PromoBannerCarouselProps {
  items: PromoBannerProps[];
  interval?: number; // ms
}

// The banner display logic is different depending on screensize:
// < 600px  : show mobile banner (600x200), and scale down linearly
// > 600px  : show desktop banner (600x80) without scaling, center content

export function PromoBannerCarousel({
  items,
  interval = 10000,
}: PromoBannerCarouselProps) {
  // Use null initially to not show any image and prevent hydration error
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState(
    items[0].backgroundColor || DEFAULT_GRADIENT_BACKGROUND
  );

  const hasRedirectUrl = items[activeIndex].redirectUrl !== "";

  const { imageUrlMobile, imageUrl, redirectUrl } = useMemo(
    () => items[activeIndex],
    [items, activeIndex]
  );

  const moveToNextSlide = useCallback(() => {
    setActiveIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  }, [items.length]);

  const handleRedirect = () => {
    if (hasRedirectUrl && typeof window !== "undefined") {
      window.open(redirectUrl, "_blank");
    }
  };

  const isSmallScreen = () => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth <= 600;
  };

  useEffect(() => {
    const selectedBg = items[activeIndex].backgroundColor;
    if (selectedBg) {
      setBackgroundColor(selectedBg);
    } else {
      setBackgroundColor(DEFAULT_GRADIENT_BACKGROUND);
    }
  }, [activeIndex, items]);

  useEffect(() => {
    // Determine which image to show based on the client's screen size
    setCurrentImageSrc(isSmallScreen() ? imageUrlMobile : imageUrl);
    // Update image source on window resize
    const handleResize = () => {
      setCurrentImageSrc(isSmallScreen() ? imageUrlMobile : imageUrl);
    };
    // Attach and remove event listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imageUrl, imageUrlMobile]);

  useEffect(() => {
    const intervalId = setInterval(moveToNextSlide, interval);
    return () => clearInterval(intervalId);
  }, [moveToNextSlide, interval, activeIndex]);

  const handleDotClick = useCallback((idx: number) => {
    setActiveIndex(idx);
  }, []);

  if (currentImageSrc === null || currentImageSrc === "") {
    return null; // Return null if no image should be shown
  }

  return (
    <div className={`min-h-[64px] ${backgroundColor} `}>
      <div className="relative">
        <div
          className={
            "flex justify-center items-center " + // positioning
            `max-w-[100vw] ` + // sizing
            `${backgroundColor}` // background
          }
        >
          <a
            onClick={handleRedirect}
            className={hasRedirectUrl ? "cursor-pointer" : "cursor-default"}
          >
            <img
              src={currentImageSrc}
              alt="promo header"
              className={`w-[100vw] ${
                isSmallScreen() ? "h-auto " : "h-[64px] w-auto"
              }`}
            />
          </a>
        </div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-[1000]">
          {items.length > 1 && (
            <div className="flex items-center justify-center space-x-2 z-[1000]">
              {items.map((_, idx) => (
                <div
                  key={`carousel-item-${idx}`}
                  className={`rounded-full p-1 w-2 h-2 z-[1000] ${
                    activeIndex === idx ? "bg-slate-700" : "bg-slate-500"
                  }`}
                  onClick={() => handleDotClick(idx)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
