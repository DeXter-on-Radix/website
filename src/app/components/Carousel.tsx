import React, { useCallback, useEffect, useState } from "react";

export interface CarouselProps {
  items: { Content: React.FC }[];
  interval?: number;
}

function Carousel({ items, interval = 10000 }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const moveToNextSlide = useCallback(() => {
    setActiveIndex(activeIndex === items.length - 1 ? 0 : activeIndex + 1);
  }, [setActiveIndex, activeIndex, items]);

  useEffect(() => {
    const intervalId = setInterval(moveToNextSlide, interval);
    return () => {
      clearInterval(intervalId);
    };
  }, [moveToNextSlide, interval]);

  const ItemToRender = items[activeIndex].Content;

  return (
    <div className="relative sm:overflow-hidden sm:max-h-[80px] sm:min-h-[80px] xs:max-h-auto bg-gradient-to-r from-dexter-gradient-green from-10% to-dexter-gradient-blue to-90%  ">
      <ItemToRender />
      <div className="absolute bottom-1 left-1/2">
        {/* make sure that there are more than 1 items in the carousel before displaying the dots ui*/}
        {items.length > 1 && (
          <div className="flex items-center justify-center space-x-2">
            {items.map((_, idx) => {
              return (
                <>
                  <div
                    key={`carousel-item-${idx}`}
                    className={`rounded-full w-2 h-2  ${
                      activeIndex === idx ? "bg-slate-700" : "bg-slate-500"
                    }`}
                  />
                </>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Carousel;
