import { useAppSelector, useAppDispatch } from "../hooks";
import { selectPairAddress } from "../redux/pairSelectorSlice";

export function PairSelector() {
  const pairSelector = useAppSelector((state) => state.pairSelector);
  const dispatch = useAppDispatch();
  const selectPair = (pairAddress: string) => {
    dispatch(selectPairAddress(pairAddress));
  };
  return (
    <div className="dropdown dropdown-start w-full" id="pair-selector">
      <label tabIndex={0} className="justify-between btn btn-block font-bold">
        <span>{pairSelector.name || "Loading"}</span>
        <span className="float-right">
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
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu bg-base-200 shadow rounded-box w-full !my-0 !px-0"
      >
        <li className="text-xs text-left uppercase text-secondary-content !pl-4 ">
          Select a pair of tokens:
        </li>
        {pairSelector.pairsList.map((pair, index) => (
          <li className="font-bold !pl-0" key={index}>
            <button
              className="justify-between"
              onClick={() => selectPair(pair.address)}
            >
              {pair.name}
              <span>+</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
