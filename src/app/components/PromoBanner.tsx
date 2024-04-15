import "react";
import { useEffect, useState } from "react";

export interface PromoBannerProps {
  imageUrl: string; // 1640 x 128
  imageUrlMobile: string; // 500 x 128
  redirectUrl: string; // target redirect address when banner is clicked
}

function isSmallScreen(): boolean {
  return window.innerWidth <= 500;
}

// The banner display logic is different depending on screensize:
// < 500px  : show small image (500x128), and scale down linearly
// > 500px  : show large image (1640x128) without scaling, but center content
// > 1640px : show large image (1640x128) without scaling, and add gradient
//            colors on left and right side to prevent banner cutoff
export function PromoBanner({
  imageUrl,
  imageUrlMobile,
  redirectUrl,
}: PromoBannerProps) {
  // determines which image to show (500x128 vs 1640x128)
  const [showSmallImage, setShowSmallImage] = useState(isSmallScreen());

  // dynamically handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setShowSmallImage(isSmallScreen());
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ignore header if image is missing
  if (imageUrl === "" || imageUrlMobile === "") {
    return <></>;
  }

  return (
    <div
      className={
        "flex justify-center items-center" + //positioning
        "max-w-[100vw] h-[128px] " + // sizing
        // add gradient that will be shown for screensizes > 1640px
        "bg-gradient-to-r from-dexter-gradient-blue from-50% to-dexter-green to-50%"
      }
    >
      <a href={redirectUrl || ""} className="cursor-pointer" target="_blank">
        {showSmallImage ? (
          <img
            src={imageUrlMobile}
            alt="promo header"
            className="w-[100vw] h-auto"
          />
        ) : (
          <img
            src={imageUrl}
            alt="promo header"
            className="object-cover w-1640px h-[128px]"
          />
        )}
      </a>
    </div>
  );
}
