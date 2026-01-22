"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag } from "@/components/Tag";
import {
  CommunityCreation,
  experimentColors,
  experimentNames,
} from "@/data/communityCreations";

interface CommunityCardProps {
  creation: CommunityCreation;
  scale?: number;
}

// Base card sizes
const BASE_SIZES = {
  landscape: { width: 280, height: 180 },
  portrait: { width: 180, height: 280 },
};

export function CommunityCard({ creation, scale = 1 }: CommunityCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const baseSize = BASE_SIZES[creation.orientation];

  // Apply scale to dimensions
  const size = {
    width: Math.round(baseSize.width * scale),
    height: Math.round(baseSize.height * scale),
  };

  // Scale border radius proportionally (base 16px = rounded-2xl)
  const borderRadius = Math.round(16 * scale);

  const expColors = experimentColors[creation.experiment];
  const expName = experimentNames[creation.experiment];

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden cursor-pointer"
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        borderRadius: `${borderRadius}px`,
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

      {/* Tags Container - scales with card */}
      <div
        className="absolute bottom-3 left-3 flex gap-2"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "bottom left",
        }}
      >
        {/* User Tag - uses experiment color */}
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

export default CommunityCard;
