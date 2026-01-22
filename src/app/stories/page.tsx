"use client";

import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { StoryCard } from "@/components/StoryCard";
import { stories } from "@/data/stories";

export default function StoriesPage() {
  const [windowWidth, setWindowWidth] = useState(1920);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

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
            how the team explores new creative possibilities in the open
          </h1>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="px-4 lg:px-8 pb-16">
        {isMobile ? (
          // Mobile: vertical stack
          <div className="flex flex-col gap-4">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} isMobile />
            ))}
          </div>
        ) : (
          // Desktop: 2-column grid
          <div
            className="grid gap-5"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(600px, 1fr))",
            }}
          >
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} className="w-full" />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
