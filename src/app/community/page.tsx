"use client";

import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { CommunityPageCard } from "@/components/CommunityPageCard";
import { communityCreations } from "@/data/communityCreations";

// Distribute cards across 4 columns for masonry effect
const column1Ids = ["cc-05", "cc-09", "cc-04", "cc-14", "cc-20"];
const column2Ids = ["cc-01", "cc-10", "cc-07", "cc-15"];
const column3Ids = ["cc-13", "cc-06", "cc-11", "cc-08", "cc-19"];
const column4Ids = ["cc-17", "cc-12", "cc-18", "cc-16"];

const getCreationsForColumn = (ids: string[]) =>
  ids.map((id) => communityCreations.find((c) => c.id === id)!).filter(Boolean);

export default function CommunityPage() {
  const [windowWidth, setWindowWidth] = useState(1920);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const col1 = getCreationsForColumn(column1Ids);
  const col2 = getCreationsForColumn(column2Ids);
  const col3 = getCreationsForColumn(column3Ids);
  const col4 = getCreationsForColumn(column4Ids);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <NavBar navOpacity={1} showLogo />

      {/* Hero Section */}
      <div className="pt-32 md:pt-40 pb-12 md:pb-16 px-4 md:px-8">
        <div className="flex flex-col items-center text-center max-w-[1200px] mx-auto">
          <h1
            className="font-semibold text-[28px] md:text-[60px] leading-[1.2] tracking-[-0.56px] md:tracking-[-1.2px]"
            style={{ color: "var(--color-primary)" }}
          >
            built by the community
          </h1>
        </div>
      </div>

      {/* Cards Section */}
      <div className="px-4 lg:px-8 pb-16">
        {isMobile ? (
          // Mobile: single column stack
          <div className="flex flex-col gap-4">
            {communityCreations.map((creation) => (
              <CommunityPageCard key={creation.id} creation={creation} />
            ))}
          </div>
        ) : (
          // Desktop: 4-column masonry with staggered offsets
          <div className="flex gap-5">
            {/* Column 1 - no offset */}
            <div className="flex-1 flex flex-col gap-5">
              {col1.map((creation) => (
                <CommunityPageCard key={creation.id} creation={creation} />
              ))}
            </div>

            {/* Column 2 - 44px offset */}
            <div className="flex-1 flex flex-col gap-5 pt-11">
              {col2.map((creation) => (
                <CommunityPageCard key={creation.id} creation={creation} />
              ))}
            </div>

            {/* Column 3 - no offset */}
            <div className="flex-1 flex flex-col gap-5">
              {col3.map((creation) => (
                <CommunityPageCard key={creation.id} creation={creation} />
              ))}
            </div>

            {/* Column 4 - 64px offset */}
            <div className="flex-1 flex flex-col gap-5 pt-16">
              {col4.map((creation) => (
                <CommunityPageCard key={creation.id} creation={creation} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
