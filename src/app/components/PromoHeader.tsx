import "react";

interface PromoHeaderProps {
  imageUrl: string; // 1640 x 128
  imageUrlMobile: string; // 500 x 128
}

export function PromoHeader({ imageUrl, imageUrlMobile }: PromoHeaderProps) {
  const deterministicSize = "w-[1640px] max-[500px]:w-[500px] h-[128px]";
  return (
    <div className={`${deterministicSize}`}>
      <img
        srcSet={`${imageUrlMobile} 500w, ${imageUrl} 1640w`}
        sizes="(max-width: 500px) 500px, 1640px"
        alt=""
      />
    </div>
  );
}
