import { useAppSelector, useAppDispatch, useTranslations } from "../hooks";
import { selectPair, TokenInfo } from "../state/pairSelectorSlice";
import { orderInputSlice } from "../state/orderInputSlice";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import React from "react";

import { BLACKLISTED_PAIRS } from "../data/BLACKLISTED_PAIRS";

interface PairInfo {
  name: string;
  address: string;
  token1: TokenInfo;
  token2: TokenInfo;
  lastPrice: number;
  change24h: number;
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

// Remove blacklisted trading pairs
function removeBlacklistedOptions(options: PairInfo[]): PairInfo[] {
  return options.filter(
    (option) => !BLACKLISTED_PAIRS.includes(option.address)
  );
}

export function PairSelector() {
  const t = useTranslations();
  const pairSelector = useAppSelector((state) => state.pairSelector);
  const dispatch = useAppDispatch();

  const menuRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Use -1 to indicate that the highlightedIndex should be ignored
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [filteredOptions, setFilteredOptions] = useState<PairInfo[]>([]);
  const [selectedOption, setSelectedOption] = useState<PairInfo>();

  const selectedOptionIndex = useMemo(() => {
    const index = filteredOptions.findIndex(
      (x) => x.name === selectedOption?.name
    );
    // set the selectedOptionIndex to 0 if no option is selected
    return index !== -1 ? index : 0;
  }, [filteredOptions, selectedOption]);

  const options = useMemo(() => {
    return [...removeBlacklistedOptions(pairSelector.pairsList)];
  }, [pairSelector.pairsList]);

  const id = "pairOption";

  useEffect(() => {
    dispatch(
      selectPair({
        pairAddress: process.env.NEXT_PUBLIC_DEFAULT_PAIR_ADDRESS!,
        pairName: "",
      })
    );
  }, [dispatch]);

  const selectOption = useCallback(
    (index: number = highlightedIndex) => {
      const option = filteredOptions[index];
      setSelectedOption(option);
      setQuery("");
      dispatch(orderInputSlice.actions.resetNumbersInput());
      dispatch(
        selectPair({
          pairAddress: option["address"],
          pairName: option["name"],
        })
      );
      setHighlightedIndex(-1);
      setIsOpen(!isOpen);
    },
    [
      setSelectedOption,
      setQuery,
      dispatch,
      setHighlightedIndex,
      setIsOpen,
      filteredOptions,
      highlightedIndex,
      isOpen,
    ]
  );

  const getDisplayValue = () => {
    if (isOpen) return query;
    if (pairSelector.name) return pairSelector.name;
    return "";
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const finalIndex =
        highlightedIndex !== -1 ? highlightedIndex : selectedOptionIndex;

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
        selectOption(finalIndex);
      } else if (e.key === "ArrowDown" && isOpen) {
        e.preventDefault();
        setHighlightedIndex(
          finalIndex + 1 === filteredOptions.length ? 0 : finalIndex + 1
        );
      } else if (e.key === "ArrowUp" && isOpen) {
        e.preventDefault();
        setHighlightedIndex(
          finalIndex - 1 < 0 ? filteredOptions.length - 1 : finalIndex - 1
        );
      }
    },
    [
      setIsOpen,
      setHighlightedIndex,
      highlightedIndex,
      selectedOptionIndex,
      filteredOptions,
      isOpen,
      selectOption,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const onQueryChange = (userInputQuery: string) => {
    const sortedOptions = sortOptions(
      options.filter(
        (option) =>
          option["name"].toLowerCase().indexOf(userInputQuery.toLowerCase()) >
          -1
      )
    );
    setFilteredOptions(sortedOptions);
    setQuery(userInputQuery);
    // Reset the current selected option to the first one that is available
    // everytime that the user query is updated
    setHighlightedIndex(0);
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else {
      inputRef.current?.blur();
      // Restore filtered options when the menu closes
      setFilteredOptions(sortOptions(options));
      setHighlightedIndex(-1);
    }
  }, [isOpen, options, setFilteredOptions, setHighlightedIndex]);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className={
        "w-full h-full relative uppercase" + (isOpen ? " bg-base-100" : "")
      }
    >
      <div
        className="w-full h-full flex text-xl font-bold justify-between p-4 px-5 cursor-pointer"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <input
          id="pair-selector-text"
          autoComplete="off"
          ref={inputRef}
          type="text"
          value={getDisplayValue()}
          name="searchTerm"
          onChange={(e) => {
            onQueryChange(e.target.value);
          }}
          className="!bg-transparent uppercase text-primary-content text-lg"
          style={{ minWidth: 0, padding: 0, border: "none" }}
        />
        {!isOpen && (
          <Image
            src="/chevron-down.svg"
            alt="chevron down"
            width="25"
            height="25"
            className=""
          />
        )}
      </div>
      <ul
        tabIndex={0}
        className={
          `${isOpen ? "" : "hidden"}` +
          " absolute z-30 bg-base-100 w-full !my-0 !p-0 overflow-y-scroll max-h-[50vh] list-none scrollbar-thin"
        }
      >
        {filteredOptions.map((option, index) => {
          const [pair1, pair2] = getPairs(option["name"]);
          const indexToHighLight =
            highlightedIndex !== -1 ? highlightedIndex : selectedOptionIndex;
          return (
            <React.Fragment key={`pair-${index}`}>
              {index === 0 && (
                <div className="flex justify-between text-sm opacity-40 ml-3 mr-3">
                  <span className="uppercase">{t("pairs")}</span>
                  <span className="uppercase">{t("price")}</span>
                </div>
              )}
              <li
                onClick={() => {
                  selectOption(index);
                }}
                className={`!px-3 py-2 cursor-pointer  ${
                  indexToHighLight === index
                    ? "bg-base-300"
                    : "hover:bg-base-200"
                }`}
                style={{ marginTop: 0, marginBottom: 0 }}
                key={`${id}-${index}`}
              >
                <div className="flex justify-between">
                  <div className="flex justify-center items-center truncate">
                    {pair1 && pair2 && (
                      <>
                        <div className="relative mr-8">
                          <img
                            src={
                              option.token1.symbol === "3TR" // remove broken link for 3TR
                                ? "grey-circle.svg"
                                : option.token1.iconUrl
                            }
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
