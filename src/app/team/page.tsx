"use client";

import { useEffect } from "react";
import { useTranslations } from "hooks";
import {
  showContributorTrophies,
  showContributorTotalEarnings,
  teamSlice,
} from "state/teamSlice";
import { store } from "state/store";
import { fetchTeamState } from "state/teamSlice";

export default function Rewards() {
  useEffect(() => {
    fetchTeamState().then((teamState) => {
      store.dispatch(teamSlice.actions.setTeamState(teamState));
      showContributorTotalEarnings(teamState.contributorMap);
      showContributorTrophies(teamState.contributorMap);
    });
  }, []);

  return (
    <div className="bg-[#141414] grow flex items-center justify-center">
      <div>
        {/* <HeaderComponent /> */}
        <Contributors />
      </div>
    </div>
  );
}

function Contributors() {
  const t = useTranslations();
  return (
    <div>
      <DexterHeading title={t("meet_our_contributors")} />
      <DexterParagraph text={t("we_have_a_diverse_talented")} />
    </div>
  );
}

function DexterParagraph({ text }: { text: string }) {
  return <p className="text-sm tracking-wide py-2">{text}</p>;
}

function DexterHeading({ title }: { title: string }) {
  return (
    <>
      <h2
        className="text-md bg-gradient-to-r from-dexter-gradient-blue to-dexter-gradient-green to-50% bg-clip-text text-transparent font-normal"
        style={{
          margin: 0,
          marginBottom: "20px",
          marginTop: "0px",
          fontSize: "45px",
        }}
      >
        {title}
      </h2>
    </>
  );
}
