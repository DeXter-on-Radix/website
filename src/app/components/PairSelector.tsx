import { useAppSelector, useAppDispatch } from "../hooks";
import { selectPairAddress } from "../state/pairSelectorSlice";
import { orderInputSlice } from "../state/orderInputSlice";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";

interface PairInfo {
  name: string;
  address: string;
}
function displayName(name?: string) {
  return name?.replace("/", " - ").toUpperCase();
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
    const newOptions = options.filter(
      (option) => option["name"].toLowerCase().indexOf(query.toLowerCase()) > -1
    );
    setFilteredOptions(newOptions);
    setHighlightedIndex(0);
  }, [options, query]);

  return (
    <div
      className={
        "w-full h-full relative uppercase" + (isOpen ? " bg-base-100" : "")
      }
    >
      <div
        className="w-full h-full flex text-xl font-bold justify-between p-4"
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
          className="flex-initial !bg-transparent uppercase"
        />
        <div className="flex space-x-2 text-secondary-content">
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
          " absolute z-30 bg-base-100 w-full !my-0 !p-0 overflow-auto max-h-screen"
        }
      >
        {filteredOptions.map((option, index) => {
          return (
            <li
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectOption()}
              className={
                "font-bold !px-4 py-0 cursor-pointer" +
                (highlightedIndex === index ? " bg-base-300" : "")
              }
              key={`${id}-${index}`}
            >
              <div className="flex justify-between  ">
                <span className="">{displayName(option["name"])}</span>
                <span className="">+</span>
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
