import "react";
import { useState, useEffect } from "react";

export interface PromoBannerProps {
  imageUrl: string; // 600x80
  imageUrlMobile: string; // 600x200
  redirectUrl: string; // target redirect address when banner is clicked
}

// The banner display logic is different depending on screensize:
// < 600px  : show mobile banner (600x200), and scale down linearly
// > 600px  : show desktop banner (600x80) without scaling, center content
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

  // Use null initially to not show any image and prevent react error
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);

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
        "promo-banner flex justify-center items-center " + // positioning
        `max-w-[100vw] ` + // sizing
        "bg-gradient-to-r from-dexter-gradient-green from-10% to-dexter-gradient-blue to-90%" // gradient background
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
  );
}
