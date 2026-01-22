"use client";

import Image from "next/image";

interface TagProps {
  label: string;
  backgroundColor: string;
  textColor: string;
  icon?: "user" | "play";
  className?: string;
}

export function Tag({
  label,
  backgroundColor,
  textColor,
  icon,
  className = "",
}: TagProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 px-1.5 pt-[3px] pb-[5px] rounded ${className}`}
      style={{ backgroundColor }}
    >
      {icon === "user" && (
        <Image
          src="/icons/user.svg"
          alt=""
          width={9}
          height={9}
          className="flex-shrink-0"
        />
      )}
      <span
        className="font-mono text-[10px] uppercase leading-none"
        style={{ color: textColor }}
      >
        {label}
      </span>
    </div>
  );
}

export default Tag;
