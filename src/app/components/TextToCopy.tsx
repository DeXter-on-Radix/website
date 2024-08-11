import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdContentCopy } from "react-icons/md";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/svg-arrow.css";
import { useTranslations } from "../hooks";

interface TextToCopyProps {
  targetUrl: string;
}

export function TextToCopy({ targetUrl }: TextToCopyProps) {
  const [toolTipVisible, setToolTipVisible] = useState(false);
  const t = useTranslations();

  const handleCopy = () => {
    setToolTipVisible(true);

    setTimeout(() => {
      setToolTipVisible(false);
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
