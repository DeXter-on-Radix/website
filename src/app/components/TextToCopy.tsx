import { useState } from "react";
import { useAppDispatch } from "../hooks";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdContentCopy } from "react-icons/md";
import { setCopied } from "../state/priceChartSlice";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/svg-arrow.css";
import { useTranslations } from "../hooks";

interface TextToCopyProps {
  targetUrl: string;
}

export function TextToCopy({ targetUrl }: TextToCopyProps) {
  const dispatch = useAppDispatch();
  const [toolTipVisible, setToolTipVisible] = useState(false);
  const t = useTranslations();

  const handleCopy = () => {
    dispatch(setCopied(true));
    setToolTipVisible(true);

    setTimeout(() => {
      setToolTipVisible(false);
      dispatch(setCopied(false));
    }, 700);
  };

  return (
    <>
      <Tippy
        content={<span>{t("copied")}</span>}
        visible={toolTipVisible}
        onClickOutside={() => setToolTipVisible(false)}
        arrow={true}
        theme="custom"
      >
        <div>
          <CopyToClipboard text={targetUrl} onCopy={handleCopy}>
            <MdContentCopy
              className="cursor-pointer text-base"
              title="Copy to clipboard"
              onClick={() => setToolTipVisible(true)}
            />
          </CopyToClipboard>
        </div>
      </Tippy>
    </>
  );
}
