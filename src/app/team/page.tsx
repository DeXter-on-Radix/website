"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector, useTranslations } from "hooks";
import {
  teamSlice,
  ActivityStatus,
  Expertise,
  Contributor,
  selectFilteredContributors,
} from "state/teamSlice";
import { fetchTeamState } from "state/teamSlice";
import { DexterButton } from "components/DexterButton";
import { FaTelegram, FaGithub } from "react-icons/fa";
import { SkeletonRectangle } from "components/Skeleton";

export default function Team() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchTeamState());
  }, [dispatch]);

  return (
    <div className="bg-[#141414] grow flex items-center justify-center pt-10">
      <div className="max-w-[1200px] p-8">
        <HeaderComponent />
        <Filters />
        <Contributors />
        <JoinUs />
      </div>
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

function Filters() {
  const t = useTranslations();
  return (
    <div className="text-center text-base mt-8">
      <p>{t("activity_status")}</p>
      <ActivityStatusToggle filter={ActivityStatus.ACTIVE} />
      <ActivityStatusToggle filter={ActivityStatus.PAST} />
      <ActivityStatusToggle filter={undefined} />
      <p className="!mt-8">{t("area_of_work")}</p>
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
      className={`cursor-pointer inline-block mx-1 mt-3 px-4 py-2 bg-[#232629] opacity-60 rounded-badge hover:opacity-100 ${
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
      className={`cursor-pointer inline-block mx-1 mt-3 px-4 py-2 bg-[#232629] opacity-60 rounded-badge hover:opacity-100 ${
        isActive ? "!opacity-100 bg-dexter-green text-black" : ""
      }`}
      onClick={() => dispatch(teamSlice.actions.setExpertiseFilter(filter))}
    >
      <p className="text-sm font-bold">{t(label)}</p>
    </div>
  );
}

function Contributors() {
  const t = useTranslations();
  const { teamSlice } = useAppSelector((state) => state);
  const contributors = selectFilteredContributors(teamSlice);
  return (
    <div className="my-10">
      {teamSlice.isLoading ? (
        <>
          <div className="flex justify-center">
            <SkeletonRectangle width="w-40" height="h-6" />
          </div>
          <div className="flex flex-wrap justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((_, indx) => {
              return (
                <SkeletonRectangle
                  width="w-[250px]"
                  height="h-[120px]"
                  key={indx}
                  className="m-2 bg-[#2C2C2C]"
                />
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="text-base text-center opacity-70">
            {t("N_contributors_found").replaceAll(
              "<$NUMBER>",
              contributors.length.toString()
            )}
          </p>
          <div className="flex flex-wrap justify-center">
            {contributors.map((contributor, indx) => {
              return <ContributorCard contributor={contributor} key={indx} />;
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ContributorCard({ contributor }: { contributor: Contributor }) {
  const t = useTranslations();
  return (
    <div className="w-[250px] h-[120px] bg-[#232629] rounded-2xl m-2 p-4 relative">
      {contributor.isActive && (
        <div className="absolute right-0 bg-dexter-green rounded-tl-full rounded-bl-full">
          <p className="text-black text-xs font-medium text-right py-1 ml-3 mr-2">
            Active
          </p>
        </div>
      )}
      {/* Flexbox container for image and text */}
      <div className="flex items-start">
        {/* Contributor Image */}
        <img
          src={
            contributor.imageUrl ||
            "https://dexternominations.space/_next/image?url=%2Fcontimg%2Fdefault.jpg&w=256&q=75"
            // "grey-circle.svg"
          }
          alt={contributor.telegram}
          width="60"
          height="60"
          className={`rounded-full ${contributor.imageUrl ? "" : "opacity-80"}`}
        />

        {/* Contributor Details */}
        <div className="flex flex-col ml-3">
          {/* Truncate telegram name */}
          <p
            className="truncate max-w-[110px] text-white text-base font-semibold cursor-default"
            title={contributor.name.length > 12 ? contributor.name : ""}
          >
            {contributor.name}
          </p>
          {/* Display badges */}
          <div className="flex flew-wrap my-1">
            {contributor.expertise.map((expertise, indx) => {
              return <Badge key={indx} text={t(expertise)} />;
            })}
            {contributor.isOG && <Badge text={"OG"} />}
          </div>
          <p className="text-white text-xs opacity-40">
            {t("contributed_in_N_phases").replaceAll(
              "<$NUMBER>",
              contributor.phasesActive.length.toString()
            )}
          </p>
        </div>
      </div>
      {/* Social Links */}
      <div className="flex mt-2">
        {contributor.telegram && (
          <SocialLink
            username={contributor.telegram}
            socialPlatform={SocialPlatform.TELEGRAM}
          />
        )}
        {contributor.github && (
          <SocialLink
            username={contributor.github}
            socialPlatform={SocialPlatform.GITHUB}
          />
        )}
      </div>
    </div>
  );
}

enum SocialPlatform {
  "TELEGRAM" = "TELEGRAM",
  "GITHUB" = "GITHUB",
}

function SocialLink({
  username,
  socialPlatform,
}: {
  username: string;
  socialPlatform: SocialPlatform;
}) {
  const { iconHtml, url } =
    socialPlatform === SocialPlatform.TELEGRAM
      ? {
          iconHtml: <FaTelegram size={20} />,
          url: `https://t.me/${username.toLowerCase()}`,
        }
      : socialPlatform === SocialPlatform.GITHUB
      ? {
          iconHtml: <FaGithub size={20} />,
          url: `https://github.com/${username.toLowerCase()}`,
        }
      : {
          iconHtml: <></>,
          url: "",
        };
  return (
    <a className="mr-1 cursor-pointer" href={url} target="_blank">
      {iconHtml}
    </a>
  );
}

function Badge({ text }: { text: string }) {
  const color =
    text === "OG" ? "bg-[#00ca92] text-black font-bold" : "bg-[#191B1D]";
  return (
    <div className={`${color} rounded-full px-3 py-1 text-xs mr-1`}>{text}</div>
  );
}

function JoinUs() {
  const t = useTranslations();
  return (
    <div className="text-center !mt-20 !mb-20">
      <DexterHeading title={t("want_to_join_us")} fontSize={30} />
      <DexterParagraph text={t("we_are_always_looking_for")} />
      <DexterButton
        title={t("register_now")}
        targetBlank={true}
        targetUrl="https://dexter-on-radix.gitbook.io/dexter/overview/how-do-i-contribute"
      />
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

function DexterHeading({
  title,
  fontSize,
}: {
  title: string;
  fontSize?: number;
}) {
  return (
    <>
      <h2
        className="text-md bg-gradient-to-r from-dexter-gradient-blue to-dexter-gradient-green to-50% bg-clip-text text-transparent font-normal"
        style={{
          margin: 0,
          marginBottom: "20px",
          marginTop: "0px",
          fontSize: `${fontSize || 45}px`,
        }}
      >
        {title}
      </h2>
    </>
  );
}
