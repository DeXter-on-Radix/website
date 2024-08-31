"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector, useTranslations } from "hooks";
import {
  showContributorTrophies,
  showContributorTotalEarnings,
  teamSlice,
  showActiveContributors,
  ActivityStatus,
  Expertise,
  Contributor,
} from "state/teamSlice";
import { store } from "state/store";
import { fetchTeamState } from "state/teamSlice";

export default function Team() {
  useEffect(() => {
    fetchTeamState().then((teamState) => {
      store.dispatch(teamSlice.actions.setTeamState(teamState));
      showContributorTotalEarnings(teamState.contributorMap);
      showContributorTrophies(teamState.contributorMap);
      showActiveContributors(teamState.contributorMap);
    });
  }, []);

  return (
    <div className="bg-[#141414] grow flex items-center justify-center pt-10">
      <div className="max-w-[1200px] p-8">
        <HeaderComponent />
        <Filters />
        <Contributors />
      </div>
    </div>
  );
}

function Filters() {
  const t = useTranslations();
  return (
    <div className="text-center text-base mt-8">
      <p>{t("activity_status")}</p>
      <ActivityStatusToggle filter={ActivityStatus.ACTIVE} />
      <ActivityStatusToggle filter={ActivityStatus.PAST} />
      <ActivityStatusToggle filter={undefined} />
      <p className="!mt-4">{t("area_of_work")}</p>
      <ExpertiseToggle filter={undefined} />
      <ExpertiseToggle filter={Expertise.ADMIN} />
      <ExpertiseToggle filter={Expertise.DEV} />
      <ExpertiseToggle filter={Expertise.DESIGN} />
      <ExpertiseToggle filter={Expertise.SOCIAL_MEDIA} />
      <ExpertiseToggle filter={Expertise.TESTING} />
    </div>
  );
}

function ActivityStatusToggle({ filter }: { filter?: ActivityStatus }) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { activityStatusFilter } = useAppSelector((state) => state.teamSlice);
  const label = filter === undefined ? "all" : filter;
  const isActive = activityStatusFilter === filter;
  return (
    <div
      className={`cursor-pointer inline-block mx-1 my-3 px-4 py-2 bg-[#232629] opacity-60 rounded-badge hover:opacity-100 ${
        isActive ? "!opacity-100 bg-dexter-green text-black" : ""
      }`}
      onClick={() =>
        dispatch(teamSlice.actions.setActivityStatusFilter(filter))
      }
    >
      <p className="text-sm font-bold">{t(label)}</p>
    </div>
  );
}

function ExpertiseToggle({ filter }: { filter?: Expertise }) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { expertiseFilter } = useAppSelector((state) => state.teamSlice);
  const label = filter === undefined ? "all" : filter;
  const isActive = expertiseFilter === filter;
  return (
    <div
      className={`cursor-pointer inline-block mx-1 my-3 px-4 py-2 bg-[#232629] opacity-60 rounded-badge hover:opacity-100 ${
        isActive ? "!opacity-100 bg-dexter-green text-black" : ""
      }`}
      onClick={() => dispatch(teamSlice.actions.setExpertiseFilter(filter))}
    >
      <p className="text-sm font-bold">{t(label)}</p>
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
  const { contributorMap } = useAppSelector((state) => state.teamSlice);
  const contributors = contributorMap
    .map((arr) => arr[1])
    .sort((a, b) => b.phasesActive.length - a.phasesActive.length);
  return (
    <div className="flex flex-wrap justify-center mt-6">
      {contributors.map((contributor, indx) => {
        return <ContributorCard contributor={contributor} key={indx} />;
      })}
    </div>
  );
}

// TODO: Expertise
// TODO: links to social channels
// TODO: active badge
function ContributorCard({ contributor }: { contributor: Contributor }) {
  return (
    <div className="w-[250px] h-[120px] bg-[#232629] rounded-2xl m-2 p-4">
      {/* Flexbox container for image and text */}
      <div className="flex items-start">
        {/* Contributor Image */}
        <img
          src={
            contributor.imageUrl ||
            "https://dexternominations.space/_next/image?url=%2Fcontimg%2Fdefault.jpg&w=256&q=75"
          }
          alt={contributor.telegram}
          width="60"
          height="60"
          className="rounded-full"
        />

        {/* Contributor Details */}
        <div className="flex flex-col ml-3">
          {/* Truncate telegram name */}
          <p className="truncate max-w-[150px] text-white text-base font-semibold">
            {contributor.name}
          </p>
          {/* Display ADMIN and OG on the same line */}
          <p className="text-white text-base">
            <span className="mr-1">ADMIN</span>
            <span>OG</span>
          </p>
          <p className="text-white text-xs">
            contributed in {contributor.phasesActive.length} phases
          </p>
        </div>
      </div>
      <div>
        <p className="inline-block text-xs ml-2 max-w-[70px]">
          {contributor.telegram}
        </p>
        <p className="inline-block text-xs ml-2 max-w-[70px]">
          {contributor.github}
        </p>
        <p className="inline-block text-xs ml-2 max-w-[70px]">
          {contributor.discord}
        </p>
      </div>
    </div>
  );
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
