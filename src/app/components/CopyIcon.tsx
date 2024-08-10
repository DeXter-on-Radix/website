import { useState } from "react";
import { useAppDispatch } from "../hooks";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdContentCopy } from "react-icons/md";
import { setCopied } from "../state/priceChartSlice";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/svg-arrow.css";

interface CopyIconProps {
  targetUrl: string;
}

export function CopyIcon({ targetUrl }: CopyIconProps) {
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState(false);

  const handleCopy = () => {
    dispatch(setCopied(true));
    setVisible(true);

    setTimeout(() => {
      setVisible(false);
      dispatch(setCopied(false));
    }, 700);
  };

  return (
    <>
      <Tippy
        content={<span>Copied!</span>}
        visible={visible}
        onClickOutside={() => setVisible(false)}
        arrow={true}
        theme="custom"
      >
        <div>
          <CopyToClipboard text={targetUrl} onCopy={handleCopy}>
            <MdContentCopy
              className="cursor-pointer text-base"
              title="Copy to clipboard"
              onClick={() => setVisible(true)}
            />
          </CopyToClipboard>
        </div>
      </Tippy>
    </>
  );
}
