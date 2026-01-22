"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Story, experimentColors, experimentNames } from "@/data/stories";
import { Tag } from "./Tag";

interface StoryCardProps {
  story: Story;
  isMobile?: boolean;
  className?: string;
}

export function StoryCard({ story, isMobile = false, className }: StoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = experimentColors[story.experiment];
  const experimentName = experimentNames[story.experiment];

  return (
    <Link
      href={`/stories/${story.id}`}
      draggable={false}
      className={`relative block rounded-3xl overflow-hidden flex-shrink-0 ${
        isMobile ? "w-full h-[300px]" : "w-[800px] h-[420px]"
      } ${className || ""}`}
      style={{
        transform: isHovered && !isMobile ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Background Image - using native img for debugging */}
      <img
        src={story.imageSrc}
        alt={story.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 40%, transparent 70%)",
        }}
      />

      {/* Content Container */}
      <div className={`absolute inset-0 flex flex-col justify-end ${isMobile ? "p-3 pr-[72px]" : "p-4 pr-[64px]"}`}>
        {/* Tags */}
        <div className="flex gap-2 mb-2">
          <Tag
            label={experimentName}
            backgroundColor={colors.bg}
            textColor={colors.text}
          />
          {!isMobile && (
            <Tag
              label={story.author}
              backgroundColor={colors.bg}
              textColor={colors.text}
              icon="user"
            />
          )}
        </div>

        {/* Title - lowercase */}
        <h3
          className={`font-medium leading-[1] lowercase ${
            isMobile
              ? "text-[32px] tracking-[-0.64px] max-w-md"
              : "text-[48px] tracking-[-0.96px] max-w-[650px]"
          }`}
          style={{ color: "var(--color-brand-pure-white)" }}
        >
          {story.title}
        </h3>
      </div>

      {/* Play Button */}
      <div
        className={`absolute flex items-center justify-center transition-transform duration-200 ${
          isMobile ? "bottom-3 right-3 w-12 h-12" : "bottom-4 right-4 w-10 h-10"
        } rounded-full`}
        style={{
          backgroundColor: "var(--color-brand-pure-white)",
          transform: isHovered && !isMobile ? "scale(1.1)" : "scale(1)",
        }}
      >
        <Image
          src="/icons/play.svg"
          alt="Play"
          width={isMobile ? 24 : 20}
          height={isMobile ? 24 : 20}
        />
      </div>
    </Link>
  );
}

export default StoryCard;
