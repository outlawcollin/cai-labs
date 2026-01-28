"use client";

import Image from "next/image";

export default function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      {/* Mascot image */}
      <div className="w-[170px] h-[170px] relative mb-4">
        <Image
          src="/image-studio/background/bg_image.png"
          alt="Cat mascot"
          fill
          className="object-contain"
          sizes="170px"
        />
      </div>

      {/* Text */}
      <p
        className="text-sm"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        Your shots will go here.
      </p>
    </div>
  );
}
