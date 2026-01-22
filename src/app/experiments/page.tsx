"use client";

import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ExperimentCard } from "@/components/ExperimentCard";
import { FilterButtonGroup } from "@/components/FilterButtonGroup";

const filterOptions = [
  "All Experiments",
  "Create",
  "Listen and Watch",
  "Play and Roleplay",
  "Explore",
];

const experiments = [
  {
    title: "turn stories into comics you can continue",
    description:
      "Create illustrated comic scenes using characters, then remix the comic into a live chat and keep the story going.",
    href: "/experiments/comics",
    variant: "lime-light" as const,
    buttonText: "Try Comics",
    imageSrc: "/experiments/comics.png",
  },
  {
    title: "see characters and yourself in new worlds",
    description:
      "Generate styled images by choosing characters, personas, moods, and scenes in a fast, visual flow.",
    href: "/experiments/image-studio",
    variant: "lavender-light" as const,
    buttonText: "Try Image Studio",
    imageSrc: "/experiments/image-studio.png",
  },
  {
    title: "watch characters act out your ideas",
    description:
      "Generate short form videos with characters, scenes, and motion using a prompt driven creation studio.",
    href: "/experiments/streams",
    variant: "butter-light" as const,
    buttonText: "Try Streams",
    imageSrc: "/experiments/streams.png",
  },
  {
    title: "podcasts where characters lead the conversation",
    description:
      "Create podcasts led by characters from any topic and jump into the conversation as it unfolds.",
    href: "/experiments/podcasts",
    variant: "rose-light" as const,
    buttonText: "Try Podcasts",
    imageSrc: "/experiments/podcasts.png",
  },
  {
    title: "step inside books and play the story",
    description:
      "Play through public domain books as a character, follow the story, or rewrite the world entirely.",
    href: "/experiments/books",
    variant: "sky-light" as const,
    buttonText: "Try Books",
    imageSrc: "/experiments/books.png",
  },
  {
    title: "follow fandoms and discuss them live",
    description:
      "Browse news and posts from shows and fandoms, then discuss them with characters.",
    href: "/experiments/fandom",
    variant: "butter-light" as const,
    buttonText: "Try Fandom",
    imageSrc: "/experiments/fandom.png",
  },
  {
    title: "see characters moving through the real world",
    description:
      "Explore a live map of characters moving through real locations and start chats grounded in place.",
    href: "/experiments/maps",
    variant: "lime-light" as const,
    buttonText: "Try Maps",
    imageSrc: "/experiments/maps.png",
  },
];

export default function ExperimentsPage() {
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
            experiments exploring new ways to tell stories, create media, and
            play
          </h1>
        </div>
      </div>

      {/* Filter Section */}
      <div className="px-4 md:px-8 pb-8 md:pb-16">
        <div className="flex justify-center">
          <FilterButtonGroup options={filterOptions} />
        </div>
      </div>

      {/* Experiments Grid */}
      <div className="px-4 lg:px-8 pb-16">
        {isMobile ? (
          // Mobile: vertical stack
          <div className="flex flex-col gap-4">
            {experiments.map((experiment) => (
              <ExperimentCard
                key={experiment.href}
                title={experiment.title}
                description={experiment.description}
                href={experiment.href}
                variant={experiment.variant}
                buttonText={experiment.buttonText}
                imageSrc={experiment.imageSrc}
                isMobile
              />
            ))}
          </div>
        ) : (
          // Desktop: CSS Grid for proper card sizing
          <div
            className="grid gap-5"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
            }}
          >
            {experiments.map((experiment) => (
              <ExperimentCard
                key={experiment.href}
                title={experiment.title}
                description={experiment.description}
                href={experiment.href}
                variant={experiment.variant}
                buttonText={experiment.buttonText}
                imageSrc={experiment.imageSrc}
                className="w-full"
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
