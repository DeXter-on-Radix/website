import { useEffect, useRef, useState } from "react";

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  setPageSize: (idx: number) => void;
  setCurrentPage: (idx: number) => void;
  totalDataLength: number;
}

const MAX_BUTTONS = 6;
const PAGINATION_OPTIONS = [10, 20, 50, 100];

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalDataLength,
  setCurrentPage,
  setPageSize,
  pageSize,
}) => {
  const totalPages = Math.ceil(totalDataLength / pageSize);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDropdownOpen) {
      const detectClose = (e: MouseEvent) => {
        if (
          isDropdownOpen &&
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node)
        ) {
          setIsDropdownOpen(false);
        }
      };
      window.addEventListener("mousedown", detectClose);
      return () => window.removeEventListener("mousedown", detectClose);
    }
    return () => {};
  }, [isDropdownOpen]);

  function renderPaginationButton(idx: number) {
    return (
      <div
        key={`pagination-button-${idx}`}
        onClick={() => setCurrentPage(idx)}
        role="button"
        className={`${
          currentPage === idx ? "bg-dexter-green rounded-full" : ""
        } text-white hover:bg-dexter-green p-1 hover:rounded-full h-6 w-6 text-center opacity-90 hover:opacity-100`}
      >
        {idx + 1}
      </div>
    );
  }

  const renderPaginationButtons = () => {
    if (totalPages <= MAX_BUTTONS) {
      return Array.from({ length: totalPages }, (_, i) =>
        renderPaginationButton(i)
      );
    }

    const pages = [];
    const siblingCount = Math.max(1, Math.floor((MAX_BUTTONS - 3) / 2));
    const showLeftEllipsis = currentPage > siblingCount + 1;
    const showRightEllipsis = currentPage < totalPages - siblingCount - 1;

    pages.push(renderPaginationButton(0)); // Always show the first page

    if (showLeftEllipsis) {
      pages.push("...");
    }

    const leftSibling = Math.max(1, currentPage - siblingCount);
    const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);
    for (let i = leftSibling; i <= rightSibling; i++) {
      pages.push(renderPaginationButton(i));
    }

    if (showRightEllipsis) {
      pages.push("...");
    }

    pages.push(renderPaginationButton(totalPages)); // Always show the last page

    return pages;
  };

  if (totalPages === 0) return null;

  return (
    <div className="flex flex-row itemcs-center space-x-4 relative">
      <div className="relative">
        {/* !TODO: Uncomment after design iteration */}
        {/* <button
          onClick={() => {
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className="flex border text-xs  border-gray-200  flex-row items-center"
        >
          <div className="pl-2">{pageSize}</div>
          <div>
            <div className="w-6 h-8"></div>
            <Image
              src="/chevron-down.svg"
              alt="chevron down"
              width="25"
              height="25"
            />
          </div>
        </button> */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute left-0  bg-dexter-grey-light text-white z-[1000] text-bold "
          >
            {PAGINATION_OPTIONS.map((item, idx) => (
              <div
                onClick={(e: React.MouseEvent) => {
                  const target = e.target as HTMLElement;
                  setIsDropdownOpen(false);
                  setPageSize(Number(target.innerText ?? 0));
                  setCurrentPage(0);
                }}
                className={`${
                  pageSize === item
                    ? "bg-dexter-green opacity-90 text-white "
                    : ""
                } hover:bg-dexter-green cursor-pointer px-4 py-2 hover:opacity-100 opacity-90 text-center  text-xs`}
                key={`${idx}-${item}`}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-row items-center justify-normal space-x-2 text-xs">
        {renderPaginationButtons()}
      </div>
    </div>
  );
};

export default Pagination;
