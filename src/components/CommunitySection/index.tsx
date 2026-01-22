"use client";

import { MarqueeBand } from "./MarqueeBand";
import { bandConfigs, getCreationsForBand } from "@/data/communityCreations";

export function CommunitySection() {
  return (
    <section className="py-16 md:py-24">
      {/* Section Header - white background */}
      <div className="mb-10 md:mb-16 px-4 md:px-8 text-center">
        <h2
          className="font-semibold text-[32px] md:text-[48px] leading-[1] tracking-[-0.64px] md:tracking-[-0.96px] mb-3"
          style={{ color: "var(--color-on-background)" }}
        >
          created by the community
        </h2>
        <p
          className="font-medium text-[16px] md:text-[20px] leading-normal"
          style={{ color: "var(--color-on-background)" }}
        >
          What people are making with Cai Labs experiments.
        </p>
      </div>

      {/* Marquee Container - off-white background with floating bands */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: "var(--color-brand-off-white)",
          height: "clamp(450px, 65vh, 900px)",
        }}
      >
        {/* All bands occupy same space, stacked by zIndex */}
        {bandConfigs.map((band) => (
          <MarqueeBand
            key={band.id}
            config={band}
            creations={getCreationsForBand(band.id)}
          />
        ))}
      </div>

      {/* CTA Button - white background */}
      <div className="flex justify-center mt-10">
        <a
          href="/community"
          className="group inline-flex items-center gap-2 h-11 px-5 rounded-full border transition-all duration-200 hover:bg-[var(--color-on-background)]"
          style={{
            borderColor: "var(--color-on-background)",
            color: "var(--color-on-background)",
          }}
        >
          <span className="font-medium text-base whitespace-nowrap group-hover:text-[var(--color-background)]">
            More Community Creations
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="group-hover:stroke-[var(--color-background)]"
          >
            <path
              d="M4.16667 10H15.8333M15.8333 10L10 4.16667M15.8333 10L10 15.8333"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:stroke-[var(--color-background)]"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}

export default CommunitySection;
