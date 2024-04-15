import "react";
import { useState, useEffect } from "react";

export interface PromoBannerProps {
  imageUrl: string; // 1640 x 128
  imageUrlMobile: string; // 500 x 128
  redirectUrl: string; // target redirect address when banner is clicked
}

// The banner display logic is different depending on screensize:
// < 600px  : show small image (500x128), and scale down linearly
// > 600px  : show large image (1640x128) without scaling, but center content
// > 1640px : show large image (1640x128) without scaling, and add gradient
//            colors on left and right side to prevent banner cutoff
export function PromoBanner({
  imageUrl,
  imageUrlMobile,
  redirectUrl,
}: PromoBannerProps) {
  const hasRedirectUrl = redirectUrl !== "";

  const isSmallScreen = () => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth <= 600;
  };

  // Use null initially to not show any image
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);

  useEffect(() => {
    // Determine which image to show based on the client's screen size
    setCurrentImageSrc(isSmallScreen() ? imageUrlMobile : imageUrl);

    // Update image source on window resize
    const handleResize = () => {
      setCurrentImageSrc(isSmallScreen() ? imageUrlMobile : imageUrl);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imageUrl, imageUrlMobile]);

  // Ignore header if image is missing
  if (currentImageSrc === null || currentImageSrc === "") {
    return null; // Return null if no image should be shown
  }

  const handleRedirect = () => {
    if (hasRedirectUrl && typeof window !== "undefined") {
      window.open(redirectUrl, "_blank");
    }
  };

  return (
    <div
      className={
        "flex justify-center items-center " +
        `max-w-[100vw] ` + // sizing
        "bg-gradient-to-r from-dexter-gradient-green from-50% to-dexter-gradient-blue to-50%" // gradient background
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
            isSmallScreen() ? "h-auto " : "h-[90px] w-auto max-w-[1640px]"
          }`}
        />
      </a>
    </div>
  );
}
