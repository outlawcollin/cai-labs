"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag } from "@/components/Tag";
import {
  CommunityCreation,
  experimentColors,
  experimentNames,
} from "@/data/communityCreations";

interface CommunityPageCardProps {
  creation: CommunityCreation;
}

export function CommunityPageCard({ creation }: CommunityPageCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const expColors = experimentColors[creation.experiment];
  const expName = experimentNames[creation.experiment];

  // Aspect ratio classes based on orientation
  const aspectClass =
    creation.orientation === "portrait"
      ? "aspect-[400/520]"
      : "aspect-[520/400]";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl cursor-default ${aspectClass}`}
      style={{
        transform: isHovered ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <img
        src={creation.imageSrc}
        alt={`Creation by ${creation.username}`}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 30%, transparent 60%)",
        }}
      />

      {/* Tags Container */}
      <div className="absolute bottom-3 left-3 flex gap-2">
        {/* User Tag */}
        <Link
          href={`/community?user=${creation.username}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Tag
            label={creation.username}
            backgroundColor={expColors.bg}
            textColor={expColors.text}
            icon="user"
          />
        </Link>

        {/* Experiment Tag */}
        <Link
          href={`/experiments/${creation.experiment}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Tag
            label={expName}
            backgroundColor={expColors.bg}
            textColor={expColors.text}
          />
        </Link>
      </div>
    </div>
  );
}

export default CommunityPageCard;
