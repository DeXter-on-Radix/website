import { useAppSelector, useAppDispatch } from "../hooks";
import { selectPairAddress } from "../redux/pairSelectorSlice";

export function PairSelector() {
  const pairSelector = useAppSelector((state) => state.pairSelector);
  const dispatch = useAppDispatch();
  const selectPair = (pairAddress: string) => {
    dispatch(selectPairAddress(pairAddress));
  };
  return (
    <div className="dropdown" id="pair-selector">
      <label tabIndex={0} className="btn m-1">
        {pairSelector.name}
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
      >
        {pairSelector.pairsList.map((pair, index) => (
          <li key={index}>
            <button onClick={() => selectPair(pair.address)}>
              {pair.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
