import { useAppSelector, useAppDispatch } from "../hooks";
import { selectPairAddress } from "../state/pairSelectorSlice";
import { orderInputSlice } from "../state/orderInputSlice";
import { useRef, useState } from "react";

interface PairInfo {
  name: string;
  address: string;
}
function displayName(name?: string) {
  return name?.replace("/", " - ");
}

export function PairSelector() {
  const pairSelector = useAppSelector((state) => state.pairSelector);
  const dispatch = useAppDispatch();

  const options = pairSelector.pairsList;
  const id = "pairOption";

  const handleChange = (val: PairInfo | null) => {
    if (val == null) return;

    dispatch(orderInputSlice.actions.resetNumbersInput());

    const pairAddress = val["address"];
    dispatch(selectPairAddress(pairAddress));
  };

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectOption = (option: PairInfo) => {
    setQuery(() => "");
    handleChange(option);
    setIsOpen((isOpen) => !isOpen);
  };

  function toggle(e: React.MouseEvent<HTMLInputElement>) {
    setIsOpen(e && e.target === inputRef.current);
  }

  const getDisplayValue = () => {
    if (query) return displayName(query);
    if (pairSelector.name) return displayName(pairSelector.name);

    return "";
  };

  const filter = (options: PairInfo[]) => {
    return options.filter(
      (option) => option["name"].toLowerCase().indexOf(query.toLowerCase()) > -1
    );
  };

  return (
    <div className="w-full">
      <div className="dropdown dropdown-end w-full">
        <label className="btn btn-block text-xl font-bold no-animation">
          <div className="flex justify-between selected-value w-full">
            <input
              id="pair-selector-text"
              ref={inputRef}
              type="text"
              value={getDisplayValue()}
              name="searchTerm"
              onChange={(e) => {
                setQuery(e.target.value);
                handleChange(null);
              }}
              onClick={toggle}
              className="flex-initial !bg-transparent"
            />
            <span className="flex-none order-last pt-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="white"
                viewBox="0 0 16 16"
              >
                <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
              </svg>
            </span>
          </div>
        </label>
        <ul
          ref={dropdownRef}
          tabIndex={0}
          className={
            `options ${isOpen ? "" : "hidden"}` +
            " dropdown-content z-10 menu bg-base-200 shadow rounded-box w-full !my-0 !p-0"
          }
        >
          {filter(options).map((option, index) => {
            return (
              <li
                onClick={() => selectOption(option)}
                className=" font-bold !pl-0"
                key={`${id}-${index}`}
              >
                <div className="flex justify-between">
                  <span className="flex-1">{displayName(option["name"])}</span>
                  <span className="flex-none">+</span>
                </div>
              </li>
            );
          })}
          <li>
            <div
              className={
                filter(options).length == 0
                  ? "flex justify-between"
                  : "flex justify-between hidden"
              }
            >
              <span className="flex-1">No Results</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
