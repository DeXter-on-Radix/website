import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdContentCopy } from "react-icons/md";
import { setCopied } from "../state/priceChartSlice";
import { DexterToast } from "components/DexterToaster";
import { useAppDispatch } from "../hooks";

interface CopyIconProps {
  targetUrl: string;
}

export function CopyIcon({ targetUrl }: CopyIconProps) {
  const dispatch = useAppDispatch();

  const handleCopy = () => {
    dispatch(setCopied(true));
    DexterToast.success("Copied!");

    setTimeout(() => {
      dispatch(setCopied(false));
    }, 2000);
  };

  return (
    <>
      <CopyToClipboard text={targetUrl} onCopy={handleCopy}>
        <MdContentCopy
          className="cursor-pointer text-base"
          title="Copy to clipboard"
        />
      </CopyToClipboard>
    </>
  );
}
