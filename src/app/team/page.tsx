"use client";

import { useEffect } from "react";
import {
  fetchTeamState,
  showContributorRanking,
  Contributor,
  exportBarchartRaceData,
} from "state/teamSlice";

export default function Rewards() {
  useEffect(() => {
    fetchTeamState().then((teamState) => {
      const contributorMap = new Map<string, Contributor>(
        teamState.contributorMap
      );
      showContributorRanking(contributorMap);
      exportBarchartRaceData(contributorMap, teamState.votingResultRows);
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
  return (
    <div>
      <DexterHeading title={"Contributors"} />
      <DexterParagraph text={"There is no formal team. Anyone can join."} />
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
