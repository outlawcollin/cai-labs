"use client";

import Image from "next/image";
import Link from "next/link";

const mascotImages: Record<number, string> = {
  1: "/leaderboards/mascots/%231(2).png",
  2: "/leaderboards/mascots/%232(2).png",
  3: "/leaderboards/mascots/%233(2).png",
};

export interface LeaderboardRowProps {
  rank: number;
  name: string;
  username: string;
  profileImage: string;
  interactions: string;
  showMascot?: boolean;
  userId?: string;
  color?: string; // CSS color value for top 3 row backgrounds
  darkText?: boolean; // use dark text on light-colored backgrounds (e.g. lime)
}

export default function LeaderboardRow({
  rank,
  name,
  username,
  profileImage,
  interactions,
  showMascot = true,
  userId,
  color,
  darkText = false,
}: LeaderboardRowProps) {
  const isTopThree = rank <= 3;
  const hasColor = isTopThree && !!color;

  // Colored rows: white or black text on colored bg
  // Default rows: surface text on surface bg with border
  const coloredText = darkText ? "black" : "white";
  const coloredSubtext = darkText ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";
  const textColor = hasColor ? coloredText : "var(--color-on-surface)";
  const subtextColor = hasColor ? coloredSubtext : "var(--color-on-surface-variant)";
  const bgColor = hasColor ? color : "var(--color-surface)";
  const borderColor = hasColor ? "transparent" : "var(--color-outline-variant)";
  const avatarBorder = hasColor ? "rgba(255,255,255,0.24)" : "rgba(0,0,0,0.12)";

  const profileHref = userId ? `/user/${userId}` : "#";

  return (
    <div
      className="relative flex items-center justify-between p-3 md:p-6 rounded-[20px] md:rounded-[32px] shadow-md"
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Left side: rank + avatar + name */}
      <div className="flex items-center gap-3 md:gap-6 relative min-w-0">
        {/* Rank indicator */}
        <div className="shrink-0 w-[40px] h-[40px] md:w-[52px] md:h-[52px] flex items-center justify-center relative">
          {isTopThree && showMascot ? (
            <Image
              src={mascotImages[rank]}
              alt={`#${rank}`}
              width={208}
              height={208}
              quality={95}
              className="w-full h-full object-contain"
              sizes="52px"
            />
          ) : (
            <div
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-surface-variant) 50%, var(--color-surface))" }}
            >
              <span
                className="text-lg md:text-2xl font-semibold uppercase"
                style={{ color: textColor }}
              >
                {rank}
              </span>
            </div>
          )}
        </div>

        {/* Profile avatar */}
        <Link
          href={profileHref}
          className="shrink-0 w-[44px] h-[44px] md:w-[62px] md:h-[62px] rounded-full overflow-hidden relative"
          style={{
            border: `1px solid ${avatarBorder}`,
          }}
        >
          <Image
            src={profileImage}
            alt={name}
            fill
            className="object-cover"
            sizes="62px"
          />
        </Link>

        {/* Name + username */}
        <div className="flex flex-col gap-1 md:gap-2 min-w-0">
          <Link
            href={profileHref}
            className="text-base md:text-[32px] font-medium lowercase leading-none hover:opacity-80 transition-opacity"
            style={{ color: textColor }}
          >
            {name}
          </Link>
          <Link
            href={profileHref}
            className="text-xs md:text-sm leading-none tracking-tight truncate transition-all hover:underline"
            style={{
              fontFamily: "var(--font-mono)",
              color: subtextColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = hasColor ? "white" : "var(--color-on-surface)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = subtextColor;
            }}
          >
            {username}
          </Link>
        </div>
      </div>

      {/* Right side: interactions */}
      <div className="flex flex-col items-end gap-1 relative shrink-0 ml-3">
        <span
          className="text-base md:text-[32px] font-semibold lowercase leading-none"
          style={{ color: textColor }}
        >
          {interactions}
        </span>
        <span
          className="text-xs md:text-sm leading-none tracking-tight"
          style={{
            fontFamily: "var(--font-mono)",
            color: subtextColor,
          }}
        >
          interactions
        </span>
      </div>
    </div>
  );
}
