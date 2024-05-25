import { useAppSelector, useAppDispatch, useTranslations } from "../hooks";
import { selectPair, TokenInfo } from "../state/pairSelectorSlice";
import { orderInputSlice } from "../state/orderInputSlice";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import Image from "next/image";
import React from "react";

interface PairInfo {
  name: string;
  address: string;
  token1: TokenInfo;
  token2: TokenInfo;
  lastPrice: number;
  change24h: number;
}
function displayName(name?: string) {
  return name?.toUpperCase();
}
function getPairs(name?: string): string[] {
  return name ? name.split("/") : [];
}
// Sort pairs as follows: 1) DEXTR/XRD (if present), then the rest alphabetically.
function sortOptions(options: PairInfo[]): PairInfo[] {
  const sortedOptions = options.sort((a: PairInfo, b: PairInfo) =>
    a.name.localeCompare(b.name)
  );
  // Define first pair to be DEXTR/XRD
  const priorityPairs = ["DEXTR/XRD"];
  const priorityOptions: PairInfo[] = priorityPairs
    .map((pair) => options.find((option) => option.name === pair))
    .filter((val): val is PairInfo => val !== undefined);
  const otherOptions = sortedOptions.filter(
    (option) => !priorityPairs.includes(option.name)
  );
  return [...priorityOptions, ...otherOptions];
}

export function PairSelector() {
  const t = useTranslations();
  const pairSelector = useAppSelector((state) => state.pairSelector);
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [filteredOptions, setFilteredOptions] = useState<PairInfo[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // uncomment duplicates to test scroll behavior
  const options = useMemo(
    () => [
      // ...pairSelector.pairsList,
      // ...pairSelector.pairsList,
      ...pairSelector.pairsList,
    ],
    [pairSelector.pairsList]
  );
  const id = "pairOption";

  useEffect(() => {
    dispatch(
      selectPair({
        pairAddress: process.env.NEXT_PUBLIC_DEFAULT_PAIR_ADDRESS!,
        pairName: "",
      })
    );
  }, [dispatch]);

  const selectOption = useCallback(() => {
    const option = filteredOptions[highlightedIndex];
    setQuery(() => "");
    dispatch(orderInputSlice.actions.resetNumbersInput());
    dispatch(
      selectPair({
        pairAddress: option["address"],
        pairName: option["name"],
      })
    );
    setIsOpen((isOpen) => !isOpen);
  }, [dispatch, highlightedIndex, filteredOptions]);

  const getDisplayValue = () => {
    if (isOpen) return displayName(query);
    if (pairSelector.name) return displayName(pairSelector.name);

    return "";
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "/") {
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        }
      } else if (e.key === "Escape") {
        setQuery("");
        setIsOpen(false);
      } else if (e.key === "Enter" && isOpen) {
        e.preventDefault();
        selectOption();
      } else if (e.key === "ArrowDown" && isOpen) {
        e.preventDefault();
        setHighlightedIndex((highlightedIndex) =>
          highlightedIndex < filteredOptions.length - 1
            ? highlightedIndex + 1
            : 0
        );
      } else if (e.key === "ArrowUp" && isOpen) {
        e.preventDefault();
        setHighlightedIndex((highlightedIndex) =>
          highlightedIndex > 0
            ? highlightedIndex - 1
            : filteredOptions.length - 1
        );
      }
    },
    [isOpen, selectOption, filteredOptions.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else {
      inputRef.current?.blur();
    }
  }, [isOpen]);

  useEffect(() => {
    const newOptions = options.filter(
      (option) => option["name"].toLowerCase().indexOf(query.toLowerCase()) > -1
    );
    setFilteredOptions(sortOptions(newOptions));
    setHighlightedIndex(0);
  }, [options, query]);

  return (
    <div
      className={
        "w-full h-full relative uppercase" + (isOpen ? " bg-base-100" : "")
      }
    >
      <div
        className="w-full h-full flex text-xl font-bold justify-between p-4 px-5 cursor-pointer"
        onClick={() => {
          setIsOpen((isOpen) => !isOpen);
        }}
      >
        <input
          id="pair-selector-text"
          ref={inputRef}
          type="text"
          value={getDisplayValue()}
          name="searchTerm"
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          className="!bg-transparent uppercase text-primary-content text-lg"
          style={{ minWidth: 0, padding: 0, border: "none" }}
        />
        {!isOpen && (
          <Image
            src="/chevron-down.svg"
            alt="chevron down"
            width="40"
            height="40"
            className="lg:hidden"
          />
        )}
        <div className="hidden lg:flex space-x-2 text-secondary-content">
          <FaSearch className="my-auto" />
          <span className="px-2 bg-neutral !rounded-sm text-neutral-content my-auto">
            /
          </span>
        </div>
      </div>
      <ul
        tabIndex={0}
        className={
          `${isOpen ? "" : "hidden"}` +
          " absolute z-30 bg-base-100 w-full !my-0 !p-0 overflow-y-scroll max-h-[50vh]"
        }
      >
        {filteredOptions.map((option, index) => {
          const [pair1, pair2] = getPairs(option["name"]);

          return (
            <React.Fragment key={`pair-${index}`}>
              {index === 0 && (
                <div className="flex justify-between text-sm opacity-40 ml-3 mr-3">
                  <span className="uppercase">{t("pairs")}</span>
                  <span className="uppercase">{t("price")}</span>
                </div>
              )}
              <li
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectOption()}
                className={
                  "!px-3 py-2 cursor-pointer " +
                  (highlightedIndex === index ? " bg-base-300" : "")
                }
                style={{ marginTop: 0, marginBottom: 0 }}
                key={`${id}-${index}`}
              >
                <div className="flex justify-between ">
                  <div className="flex justify-center items-center">
                    {pair1 && pair2 && (
                      <>
                        <div className="relative mr-8">
                          <img
                            src={option.token1.iconUrl}
                            alt="Token Icon"
                            className="w-6 h-6 rounded-full z-20"
                          />
                          <img
                            src={option.token2.iconUrl}
                            alt="Token Icon"
                            className="absolute top-0 left-6 w-6 h-6 rounded-full z-10"
                          />
                        </div>
                        <span className="font-bold text-base">{pair1}</span>
                        <span className="opacity-50 text-base">/{pair2}</span>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col text-sm text-right font-sans">
                    <span className="">{option.lastPrice}</span>
                  </div>
                </div>
              </li>
            </React.Fragment>
          );
        })}
        <li
          className={
            "justify-between " +
            (filteredOptions.length == 0 ? "flex" : "hidden")
          }
        >
          <span className="flex-1">No Results</span>
        </li>
      </ul>
    </div>
  );
}
