import React from "react";

export const TokenAvatar = ({ url }: { url: string }) => {
  return (
    <div className="avatar">
      <div className="w-6 rounded-full relative">
        <img src={url} alt="token1" placeholder="empty" className="" />
      </div>
    </div>
  );
};
