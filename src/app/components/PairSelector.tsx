import { useAppSelector, useAppDispatch } from "../hooks";
import { selectPairAddress, TokenInfo } from "../state/pairSelectorSlice";
import { orderInputSlice } from "../state/orderInputSlice";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

interface PairInfo {
  token1: TokenInfo;
  name: string;
  address: string;
}
function displayName(name?: string) {
  return name?.toUpperCase();
}
function getPairs(name?: string): string[] {
  return name ? name.split("/") : [];
}
// Sort pairs as follows: 1) XRD/xUSDT (if present), 2) DEXTR/XRD (if present), then the rest alphabetically.
function sortOptions(options: PairInfo[]): PairInfo[] {
  const sortedOptions = options.sort((a: PairInfo, b: PairInfo) =>
    a.name.localeCompare(b.name)
  );
  // Define first and second pair
  const priorityPairs = ["XRD/xUSDC", "DEXTR/XRD"];
  const priorityOptions: PairInfo[] = priorityPairs
    .map((pair) => options.find((option) => option.name === pair))
    .filter((val): val is PairInfo => val !== undefined);
  const otherOptions = sortedOptions.filter(
    (option) => !priorityPairs.includes(option.name)
  );
  return [...priorityOptions, ...otherOptions];
}

export function PairSelector() {
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
    if (process.env.NEXT_PUBLIC_DEFAULT_PAIR_ADDRESS != "") {
      dispatch(
        selectPairAddress(process.env.NEXT_PUBLIC_DEFAULT_PAIR_ADDRESS || "")
      );
    }
  }, [dispatch]);

  const selectOption = useCallback(() => {
    const option = filteredOptions[highlightedIndex];
    setQuery(() => "");
    dispatch(orderInputSlice.actions.resetNumbersInput());
    dispatch(selectPairAddress(option["address"]));
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
        e.preventDefault();
        setIsOpen(true);
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
    // const newOptions = [];
    // if (options.find(option => option["name"] === "xrd/"))
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
        className="w-full h-full flex text-xl font-bold justify-between p-4 px-5"
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
          className="!bg-transparent uppercase"
          style={{ minWidth: 0, padding: 0, border: "none" }}
        />
        <Image
          src="/chevron-down.svg"
          alt="chevron down"
          width="40"
          height="40"
          className=""
        />
      </div>
      <ul
        tabIndex={0}
        className={
          `${isOpen ? "" : "hidden"}` +
          " absolute z-30 bg-base-100 w-full !my-0 !p-0 overflow-auto max-h-screen"
        }
      >
        {filteredOptions.map((option, index) => {
          const [pair1, pair2] = getPairs(option["name"]);

          return (
            <li
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectOption()}
              className={
                "!px-4 py-3 cursor-pointer opacity-70 hover:opacity-100" +
                (highlightedIndex === index ? " bg-base-300" : "")
              }
              style={{ marginTop: 0, marginBottom: 0 }}
              key={`${id}-${index}`}
            >
              <div className="flex justify-between ml-2 mr-2 ">
                <div className="flex justify-center items-center">
                  {pair1 && pair2 && (
                    <>
                      <img
                        src={option.token1.iconUrl}
                        alt="Token Icon"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="font-bold">{pair1}</span>
                      <span className="opacity-50">/{pair2}</span>
                    </>
                  )}
                </div>
                <span>+</span>
              </div>
            </li>
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
