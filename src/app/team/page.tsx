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
      <div className="max-w-[1000px] p-8">
        <HeaderComponent />
        <Filters />
        <Contributors />
      </div>
    </div>
  );
}

function Filters() {
  return (
    <div className="text-center text-base mt-8">
      <p>Activity status</p>
      <FilterToggle label="Active" />
      <FilterToggle label="Past" />
      <FilterToggle label="All" />
      <p className="!mt-4">Area of work</p>
      <FilterToggle label="All" />
      <FilterToggle label="Admin" />
      <FilterToggle label="Dev" />
      <FilterToggle label="Design" />
      <FilterToggle label="Social media" />
      <FilterToggle label="Testing" />
    </div>
  );
}

function FilterToggle({ label }: { label: string }) {
  return (
    <div className="cursor-pointer inline-block mx-1 my-3 px-6 py-3 bg-black opacity-25 rounded-badge hover:opacity-100">
      <p className="uppercase">{label}</p>
    </div>
  );
}

function HeaderComponent() {
  const t = useTranslations();
  return (
    <div className="text-center">
      <DexterHeading title={t("meet_our_contributors")} />
      <DexterParagraph text={t("we_have_a_diverse_talented")} />
    </div>
  );
}

function Contributors() {
  return <div></div>;
}

function DexterParagraph({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center">
      <p className="max-w-[600px] text-sm tracking-wide py-2">{text}</p>
    </div>
  );
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
