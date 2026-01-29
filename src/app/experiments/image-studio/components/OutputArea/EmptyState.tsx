"use client";

// import { useState } from "react";
// import Image from "next/image";
// import CommunityModal from "../shared/CommunityModal";

// const polaroids = [
//   { src: "/image-studio/polaroid/anime34.png", rotate: -5, offsetY: 0 },
//   { src: "/image-studio/polaroid/coolcool.png", rotate: 0, offsetY: 14 },
//   { src: "/image-studio/polaroid/old2.png", rotate: 0, offsetY: 10 },
// ];

export default function EmptyState() {
  // const [isHovered, setIsHovered] = useState(false);
  // const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {/* Mascot image */}
      <img
        src="/image-studio/background/bg_image.png"
        alt=""
        className="w-[170px] mb-4"
      />

      {/* Text */}
      <p
        className="text-sm"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        Your shots will go here.
      </p>

      {/* Polaroid stack - commented out for now */}
      {/* <div className="relative h-[240px] w-[400px] mb-6">
        {polaroids.map((p, i) => (
          <div
            key={p.src}
            className="absolute"
            style={{
              left: `${i * 116}px`,
              top: `${p.offsetY}px`,
              transform: `rotate(${p.rotate}deg)`,
              zIndex: i,
            }}
          >
            <div
              className="relative overflow-hidden"
              style={{
                width: 170,
                height: 228,
                backgroundColor: "#fafaf8",
                border: "1px solid #e8e8e8",
                padding: "13px 6px 52px 6px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(125deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.25) 55%, rgba(255,255,255,0) 62%, rgba(255,255,255,0) 100%)",
                  zIndex: 2,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
                  zIndex: 1,
                }}
              />
              <div className="relative w-full h-full overflow-hidden" style={{ zIndex: 0 }}>
                <Image
                  src={p.src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="158px"
                />
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* Community discovery - commented out for now */}
      {/* <div className="flex flex-col gap-1.5 items-center">
        <div className="flex items-center">
          <span
            className="text-[18px] font-semibold"
            style={{ color: "var(--color-on-surface)" }}
          >
            shots people won&apos;t shut up about.
          </span>
          <button
            onClick={() => setModalOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex items-center justify-center cursor-pointer shrink-0 ml-1"
            aria-label="Browse community"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 4L10 8L6 12"
                stroke={isHovered ? "var(--color-on-surface)" : "var(--color-on-surface-variant)"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: "stroke 150ms ease-in-out" }}
              />
            </svg>
          </button>
        </div>
        <p
          className="text-[16px] text-center leading-tight"
          style={{ color: "var(--color-on-surface-variant)", maxWidth: 236 }}
        >
          characters, personas, and stories from the community.
        </p>
      </div> */}

      {/* <CommunityModal isOpen={modalOpen} onClose={() => setModalOpen(false)} /> */}
    </div>
  );
}
