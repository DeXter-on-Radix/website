import React from "react";
import { TokenAvatar } from "common/tokenAvatar";

type Props = {
  logoUrl: string;
  symbol: string;
};

export const TokenWithSymbol = ({ logoUrl, symbol }: Props) => {
  return (
    <div className="flex items-center space-x-2">
      <TokenAvatar url={logoUrl} />
      <span className="font-bold text-base">{symbol}</span>
    </div>
  );
};
