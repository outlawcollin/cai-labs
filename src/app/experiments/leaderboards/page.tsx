"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SubpageNavBar from "@/components/SubpageNavBar";
import LeaderboardRow from "./components/LeaderboardRow";
import StaticMascot from "./components/StaticMascot";
import PillTab from "@/app/experiments/image-studio/components/shared/PillTab";
import { ThemeProvider, useTheme } from "@/app/experiments/image-studio/context/ThemeContext";
import SubpageFooter from "@/components/SubpageFooter";

const CYCLE_DURATION = 24 * 60 * 60 * 1000;

function getTimeRemaining() {
  const now = Date.now();
  const remaining = CYCLE_DURATION - (now % CYCLE_DURATION);
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

function formatCountdown({ hours, minutes, seconds }: { hours: number; minutes: number; seconds: number }) {
  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");
  return `refreshes in ${h}h ${m}m ${s}s`;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  username: string;
  profileImage: string;
  interactions: string;
  userId: string;
}

const sampleData: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "lucille konohana",
    username: "@finennarrationworks",
    profileImage: "/community/community-01.png",
    interactions: "1.7m",
    userId: "finennarrationworks",
  },
  {
    rank: 2,
    name: "mafia husband",
    username: "@fictionalmanlover96",
    profileImage: "/community/community-04.png",
    interactions: "896.5k",
    userId: "fictionalmanlover96",
  },
  {
    rank: 3,
    name: "gojo satoru",
    username: "@characteruser124",
    profileImage: "/community/community-05.png",
    interactions: "731.3k",
    userId: "characteruser124",
  },
  {
    rank: 4,
    name: "hazbin hotel",
    username: "@ariaxolotl",
    profileImage: "/community/community-06.png",
    interactions: "720.7k",
    userId: "ariaxolotl",
  },
  {
    rank: 5,
    name: "4nn1",
    username: "@idiotuk",
    profileImage: "/community/community-07.png",
    interactions: "627.k",
    userId: "idiotuk",
  },
  {
    rank: 6,
    name: "dispatch",
    username: "@i-amsteve",
    profileImage: "/community/community-08.png",
    interactions: "598.3k",
    userId: "i-amsteve",
  },
];

// Stagger indices:
// 1-2: heading lines
// 3-4: subtitle lines
// 5: carousel
// 6: refresh pill
// 7+: rows
const headingLines = ["most talked-to,", "least behaved."];
const subtitleLines = ["characters people keep", "coming back to."];

const MASCOT_SIZE = 70;

const carouselImages = [
  { src: "/leaderboards/images/vamp.png", label: "Vampire Roommate", color: "#d90000", transparentBg: false },
  { src: "/leaderboards/images/pink.png", label: "Pink Blade", color: "#ff4dc9", transparentBg: false },
  { src: "/leaderboards/images/cool guy.png", label: "Cool Guy", color: "#7db4ff", transparentBg: true },
  { src: "/leaderboards/images/serpahix.png", label: "Seraphix", color: "#df91f2", transparentBg: false },
  { src: "/leaderboards/images/neon girl.png", label: "Neon Girl", color: "#00d9d9", transparentBg: true },
];

export default function LeaderboardsPage() {
  return (
    <ThemeProvider>
      <LeaderboardsContent />
    </ThemeProvider>
  );
}

function LeaderboardsFooter() {
  const { theme, setTheme } = useTheme();

  const options = [
    { id: "light" as const, label: "Light" },
    { id: "dark" as const, label: "Dark" },
    { id: "system" as const, label: "System" },
  ];

  const [variant, setVariant] = useState<"light" | "dark">("light");

  useEffect(() => {
    const checkDark = () => {
      if (theme === "dark") {
        setVariant("dark");
      } else if (theme === "light") {
        setVariant("light");
      } else {
        setVariant(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      }
    };

    checkDark();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => checkDark();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  return (
    <SubpageFooter
      variant={variant}
      rightContent={
        <div className="flex items-center gap-2">
          {options.map((option, index) => (
            <span key={option.id} className="flex items-center gap-2">
              <button
                onClick={() => setTheme(option.id)}
                className="transition-colors cursor-pointer"
                style={{
                  color:
                    theme === option.id
                      ? "var(--color-on-surface)"
                      : "var(--color-on-surface-variant)",
                }}
              >
                {option.label}
              </button>
              {index < options.length - 1 && (
                <span style={{ color: "var(--color-on-surface-variant)" }}>/</span>
              )}
            </span>
          ))}
        </div>
      }
    />
  );
}

function LeaderboardsContent() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(carouselImages.length);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const extendedImages = [...carouselImages, ...carouselImages, ...carouselImages];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setCountdown(getTimeRemaining());
    const interval = setInterval(() => {
      setCountdown(getTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => prev + 1);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  // Silent reset: when we've scrolled past the middle set, jump back without transition
  useEffect(() => {
    const baseOffset = carouselImages.length;
    if (activeIndex >= baseOffset + carouselImages.length) {
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setActiveIndex(prev => prev - carouselImages.length);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransitionEnabled(true);
          });
        });
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [activeIndex]);


  if (isMobile === null) {
    return (
      <div className="flex flex-col min-h-dvh" style={{ backgroundColor: "var(--color-background)" }} />
    );
  }

  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{ backgroundColor: "var(--color-background)", overflowX: "clip" }}
    >
      {/* Keyframes — Jakub-style enter animation */}
      <style>{`
        :root {
          --ease-brand: cubic-bezier(0.93, 0.00, 0.07, 1.00);
          --ease-brand-in: cubic-bezier(0.00, 0.00, 0.07, 1.00);
          --ease-brand-out: cubic-bezier(0.93, 0.00, 1.00, 1.00);
          --ease-brand-bounce: cubic-bezier(0.00, 0.00, 0.07, 1.25);
        }
        @keyframes enter {
          from {
            opacity: 0;
            filter: blur(5px);
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            filter: blur(0px);
            transform: translateY(0px);
          }
        }
        .animate-enter {
          animation: enter 600ms ease-out both;
          animation-delay: calc(var(--stagger, 0) * 120ms);
        }
      `}</style>

      {/* NavBar */}
      <div className="animate-enter" style={{ "--stagger": 0 } as React.CSSProperties}>
      <SubpageNavBar
        backHref="/"
        isMobile={isMobile}
        variant="light"
        logoNode={
          <svg width="193" height="21" viewBox="0 0 193 21" fill="none" style={{ color: "var(--color-on-surface)", height: 24, width: "auto" }}>
            <path d="M11.3644 15.1534C9.51227 15.1534 8.40242 13.8702 8.40242 11.6894C8.40242 9.5085 9.49338 8.18502 11.3644 8.18502C12.7837 8.18502 13.6277 8.79641 13.8543 10.1415H16.0769C15.8707 7.88005 14.0199 6.35229 11.3659 6.35229C8.21793 6.35229 6.07812 8.51158 6.07812 11.6908C6.07812 14.87 8.15692 16.9876 11.3659 16.9876C14.1231 16.9876 15.9128 15.4598 16.1801 13.1984H13.9575C13.6495 14.6039 12.8462 15.1549 11.3644 15.1549V15.1534Z" fill="currentColor"/>
            <path d="M3.04192 0.960571C1.26384 3.14431 0.0159795 6.63427 0 10.0336C0.0159795 13.4344 1.26384 16.9229 3.04192 19.1066L5.10618 19.098C3.27871 16.7272 2.3795 13.4372 2.36352 10.0336C2.3795 6.62995 3.27871 3.33995 5.10618 0.969203L3.04192 0.960571Z" fill="currentColor"/>
            <path d="M41.5994 0.960571C43.379 3.14431 44.6268 6.63427 44.6413 10.0336C44.6254 13.4344 43.3775 16.9229 41.5994 19.1066L39.5352 19.098C41.3626 16.7272 42.2618 13.4372 42.2778 10.0336C42.2618 6.62995 41.3626 3.33995 39.5352 0.969203L41.5994 0.960571Z" fill="currentColor"/>
            <path d="M19.8349 13.7883C18.9095 13.7883 18.25 14.4601 18.25 15.4182C18.25 16.3762 18.9081 16.9876 19.8349 16.9876C20.7617 16.9876 21.398 16.336 21.398 15.4182C21.398 14.5004 20.7602 13.7883 19.8349 13.7883Z" fill="currentColor"/>
            <path d="M35.8958 2.07257C35.0518 2.07257 34.4766 2.64368 34.4766 3.47805C34.4766 4.31241 35.0533 4.88352 35.8958 4.88352C36.7384 4.88352 37.3151 4.31241 37.3151 3.47805C37.3151 2.64368 36.7384 2.07257 35.8958 2.07257Z" fill="currentColor"/>
            <path d="M37.0258 6.47461H34.7422V16.8654H37.0258V6.47461Z" fill="currentColor"/>
            <path d="M28.4363 6.35229C25.8229 6.35229 24.177 7.63549 23.9925 9.85663H26.2151C26.3386 8.79785 27.1405 8.18646 28.3752 8.18646C29.61 8.18646 30.3306 8.75757 30.3306 9.79621C30.3306 10.3256 30.1664 10.468 29.4459 10.5903C27.7375 10.855 26.4417 11.0176 25.6195 11.2837C24.2816 11.7109 23.5625 12.6489 23.5625 13.9939C23.5625 15.8483 24.8583 16.989 26.9981 16.989C28.4174 16.989 29.6318 16.3776 30.3523 15.2771H30.4351V16.8668H32.6156V10.3673C32.6156 7.77935 31.1136 6.35373 28.4392 6.35373L28.4363 6.35229ZM30.3291 12.3425C30.3291 13.9522 29.0943 15.175 27.4281 15.175C26.4199 15.175 25.865 14.7262 25.865 13.9119C25.865 13.2401 26.1948 12.8316 26.8732 12.6086C27.5516 12.3842 29.5272 12.2821 30.3291 12.0375V12.3425Z" fill="currentColor"/>
            <path d="M188.235 17.6119C185.393 17.6119 183.72 16.443 183.539 14.2865H185.353C185.575 15.5763 186.461 16.1608 188.235 16.1608C189.867 16.1608 190.714 15.6368 190.714 14.6895C190.714 13.8028 190.15 13.44 188.457 13.2384L187.247 13.0772C184.789 12.795 183.801 11.9083 183.801 10.1145C183.801 8.26033 185.393 7.172 187.993 7.172C190.553 7.172 192.125 8.24017 192.306 10.2354H190.512C190.271 9.12696 189.485 8.62311 187.993 8.62311C186.361 8.62311 185.635 9.08665 185.635 10.0138C185.635 10.9005 186.179 11.2835 187.792 11.4649L189.102 11.6462C191.762 11.9889 192.548 12.6943 192.548 14.5888C192.548 16.584 191.057 17.6119 188.235 17.6119Z" fill="currentColor"/>
            <path d="M175.382 17.612C172.641 17.612 170.867 15.5764 170.867 12.4122C170.867 9.24795 172.641 7.17206 175.382 7.17206C176.813 7.17206 178.123 7.87746 178.848 9.06656H178.909V3.00012H180.803V17.5112H178.989V15.7376H178.929C178.223 16.9066 176.873 17.612 175.382 17.612ZM175.886 16.0803C177.8 16.0803 178.989 14.6695 178.989 12.4122C178.989 10.1549 177.78 8.70379 175.886 8.70379C173.991 8.70379 172.762 10.1146 172.762 12.4122C172.762 14.6695 173.971 16.0803 175.886 16.0803Z" fill="currentColor"/>
            <path d="M159.168 17.511V16.0196H162.05V8.76406H159.168V7.27265H163.844V9.61054H163.924C164.569 8.2199 166.101 7.17188 168.62 7.17188V9.00591H168.137C165.617 9.00591 163.924 10.0136 163.924 12.4523V16.0196H168.62V17.511H159.168Z" fill="currentColor"/>
            <path d="M150.731 17.6119C148.473 17.6119 147.184 16.5437 147.184 14.6895C147.184 13.3392 147.889 12.4323 149.28 12.0292C150.066 11.8075 151.174 11.6866 153.29 11.3842C154.096 11.2633 154.318 11.0618 154.318 10.5579C154.318 9.34866 153.472 8.70372 152 8.70372C150.549 8.70372 149.622 9.36881 149.441 10.4975H147.607C147.829 8.38125 149.481 7.172 152.041 7.172C154.721 7.172 156.193 8.56264 156.193 11.0215V17.5111H154.399V15.7779H154.338C153.633 16.9468 152.303 17.6119 150.731 17.6119ZM151.073 16.1003C152.948 16.1003 154.318 14.8508 154.318 13.1175V12.5129C153.472 12.8555 151.134 12.8958 150.287 13.1377C149.461 13.3795 149.078 13.8632 149.078 14.6291C149.078 15.5965 149.763 16.1003 151.073 16.1003Z" fill="currentColor"/>
            <path d="M139.692 17.6118C136.669 17.6118 134.613 15.4956 134.613 12.412C134.613 9.28807 136.709 7.17188 139.692 7.17188C142.756 7.17188 144.811 9.30823 144.811 12.412C144.811 15.5157 142.756 17.6118 139.692 17.6118ZM139.692 16.0801C141.667 16.0801 142.917 14.6693 142.917 12.412C142.917 10.1144 141.667 8.7036 139.692 8.7036C137.737 8.7036 136.528 10.1346 136.528 12.412C136.528 14.6894 137.737 16.0801 139.692 16.0801Z" fill="currentColor"/>
            <path d="M128.214 17.612C126.723 17.612 125.373 16.9066 124.667 15.7376H124.607V17.5112H122.793V3.00012H124.687V9.06656H124.748C125.473 7.87746 126.783 7.17206 128.214 7.17206C130.955 7.17206 132.729 9.24795 132.729 12.4122C132.729 15.5764 130.955 17.612 128.214 17.612ZM127.711 16.0803C129.625 16.0803 130.834 14.6695 130.834 12.4122C130.834 10.1146 129.605 8.70379 127.711 8.70379C125.816 8.70379 124.607 10.1549 124.607 12.4122C124.607 14.6695 125.796 16.0803 127.711 16.0803Z" fill="currentColor"/>
            <path d="M110.828 17.5111V16.0197H113.71V8.76419H110.828V7.27277H115.504V9.61067H115.585C116.229 8.22002 117.761 7.172 120.28 7.172V9.00604H119.797C117.277 9.00604 115.585 10.0138 115.585 12.4524V16.0197H120.28V17.5111H110.828Z" fill="currentColor"/>
            <path d="M103.701 17.6118C100.577 17.6118 98.582 15.5561 98.582 12.412C98.582 9.20746 100.597 7.17188 103.701 7.17188C106.583 7.17188 108.337 9.16715 108.337 12.3918V13.0166H100.517C100.658 14.9313 101.807 16.0801 103.701 16.0801C105.273 16.0801 106.2 15.3948 106.482 14.3871H108.296C107.974 16.3018 106.281 17.6118 103.701 17.6118ZM100.517 11.6461H106.523C106.422 9.79193 105.354 8.7036 103.701 8.7036C101.827 8.7036 100.698 9.75162 100.517 11.6461Z" fill="currentColor"/>
            <path d="M90.7919 17.612C88.0509 17.612 86.2773 15.5764 86.2773 12.4122C86.2773 9.24795 88.0509 7.17206 90.7919 7.17206C92.2228 7.17206 93.5328 7.87746 94.2584 9.06656H94.3189V3.00012H96.2134V17.5112H94.3995V15.7376H94.339C93.6336 16.9066 92.2833 17.612 90.7919 17.612ZM91.2957 16.0803C93.2104 16.0803 94.3995 14.6695 94.3995 12.4122C94.3995 10.1549 93.1902 8.70379 91.2957 8.70379C89.4012 8.70379 88.1718 10.1146 88.1718 12.4122C88.1718 14.6695 89.3811 16.0803 91.2957 16.0803Z" fill="currentColor"/>
            <path d="M78.2229 17.6119C75.9657 17.6119 74.6758 16.5437 74.6758 14.6895C74.6758 13.3392 75.3812 12.4323 76.7718 12.0292C77.5578 11.8075 78.6663 11.6866 80.7825 11.3842C81.5887 11.2633 81.8104 11.0618 81.8104 10.5579C81.8104 9.34866 80.9639 8.70372 79.4926 8.70372C78.0415 8.70372 77.1144 9.36881 76.9331 10.4975H75.099C75.3207 8.38125 76.9734 7.172 79.5329 7.172C82.2134 7.172 83.6847 8.56264 83.6847 11.0215V17.5111H81.891V15.7779H81.8305C81.1251 16.9468 79.7949 17.6119 78.2229 17.6119ZM78.5655 16.1003C80.4399 16.1003 81.8104 14.8508 81.8104 13.1175V12.5129C80.9639 12.8555 78.626 12.8958 77.7795 13.1377C76.9532 13.3795 76.5703 13.8632 76.5703 14.6291C76.5703 15.5965 77.2555 16.1003 78.5655 16.1003Z" fill="currentColor"/>
            <path d="M67.4473 17.6119C64.3234 17.6119 62.3281 15.5562 62.3281 12.4121C62.3281 9.20758 64.3435 7.172 67.4473 7.172C70.3293 7.172 72.0828 9.16727 72.0828 12.392V13.0167H64.2629C64.404 14.9314 65.5528 16.0802 67.4473 16.0802C69.0193 16.0802 69.9464 15.3949 70.2286 14.3872H72.0424C71.72 16.3019 70.027 17.6119 67.4473 17.6119ZM64.2629 11.6462H70.2689C70.1681 9.79205 69.0999 8.70372 67.4473 8.70372C65.5729 8.70372 64.4443 9.75175 64.2629 11.6462Z" fill="currentColor"/>
            <path d="M50.5469 17.5112V16.0198H54.4971V4.49154H50.5469V3.00012H56.3916V16.0198H59.9992V17.5112H50.5469Z" fill="currentColor"/>
          </svg>
        }
      />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-14 max-w-5xl mx-auto w-full px-5 pt-32 md:pt-32 pb-12 md:pb-32">
        {/* Hero — side-by-side on desktop, stacked on mobile */}
        {(() => {
          const cardSize = isMobile ? 224 : 380;
          const gap = isMobile ? 40 : 80;
          const pillSize = isMobile ? "xs" as const : "sm" as const;
          const pillBottom = isMobile ? 24 : 44;
          const pillRight = isMobile ? 18 : 30;

          // Desktop: left-aligned track (right-peek only)
          // Mobile: centered track (both-side peek)
          const desktopTranslateX = `translateX(${-activeIndex * (cardSize + gap)}px)`;
          const mobileTranslateX = `translateX(calc(-${activeIndex * (cardSize + gap)}px - ${cardSize / 2}px))`;
          const translateX = isMobile ? mobileTranslateX : desktopTranslateX;

          const imageTrack = (
            <div
              className={`flex items-center absolute top-0 ${isMobile ? "" : "left-0"}`}
              style={{
                gap,
                ...(isMobile ? { left: "50%" } : {}),
                transform: translateX,
                transitionProperty: transitionEnabled ? "transform" : "none",
                transitionDuration: "600ms",
                transitionDelay: transitionEnabled ? "200ms" : "0ms",
                transitionTimingFunction: "var(--ease-brand)",
              }}
            >
              {extendedImages.map((img, i) => (
                <div
                  key={`${img.label}-${i}`}
                  className="rounded-full overflow-hidden shrink-0 relative"
                  style={{
                    width: cardSize,
                    height: cardSize,
                    ...(!img.transparentBg ? { border: "1px solid rgba(255,255,255,0.15)" } : {}),
                  }}
                >
                  <Image src={img.src} alt={img.label} fill className={img.transparentBg ? "object-contain" : "object-cover"} sizes={`${cardSize}px`} />
                </div>
              ))}
            </div>
          );

          const pillTrack = (
            <div
              className={`flex items-center absolute top-0 pointer-events-none z-20 ${isMobile ? "" : "left-0"}`}
              style={{
                gap,
                ...(isMobile ? { left: "50%" } : {}),
                transform: translateX,
                transitionProperty: transitionEnabled ? "transform" : "none",
                transitionDuration: "600ms",
                transitionTimingFunction: "var(--ease-brand)",
              }}
            >
              {extendedImages.map((img, i) => {
                const isActive = i === activeIndex || i === activeIndex - 1;
                return (
                  <div
                    key={`${img.label}-${i}`}
                    className="shrink-0 relative"
                    style={{ width: cardSize, height: cardSize }}
                  >
                    <div
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{
                        bottom: pillBottom,
                        opacity: isActive ? 1 : 0,
                        transitionProperty: transitionEnabled ? "opacity" : "none",
                        transitionDuration: isActive ? "300ms" : "150ms",
                        transitionTimingFunction: "var(--ease-brand)",
                      }}
                    >
                      <PillTab label={img.label} color={img.color} size={pillSize} />
                    </div>
                  </div>
                );
              })}
            </div>
          );

          return (
            <div className={`flex ${isMobile ? "flex-col gap-6" : "items-center justify-between"}`}>
              {/* Carousel — first in DOM (top on mobile, right on desktop via order) */}
              {isMobile ? (
                <div
                  className="animate-enter relative overflow-hidden"
                  style={{
                    "--stagger": headingLines.length + subtitleLines.length + 1,
                    height: cardSize,
                    width: "calc(100% + 40px)",
                    marginLeft: -20,
                    marginRight: -20,
                  } as React.CSSProperties}
                >
                  {imageTrack}
                  {pillTrack}
                  {/* Left gradient fade */}
                  <div
                    className="absolute top-0 bottom-0 left-0 z-10 pointer-events-none"
                    style={{
                      width: 60,
                      background: "linear-gradient(to right, var(--color-background), transparent)",
                    }}
                  />
                  {/* Right gradient fade */}
                  <div
                    className="absolute top-0 bottom-0 right-0 z-10 pointer-events-none"
                    style={{
                      width: 60,
                      background: "linear-gradient(to left, var(--color-background), transparent)",
                    }}
                  />
                </div>
              ) : (
                <div
                  className="animate-enter relative shrink-0 order-2 overflow-hidden rounded-full"
                  style={{
                    "--stagger": headingLines.length + subtitleLines.length + 1,
                    width: cardSize,
                    height: cardSize,
                  } as React.CSSProperties}
                >
                  {imageTrack}
                  {pillTrack}
                  {/* Left gradient fade */}
                  <div
                    className="absolute top-0 bottom-0 left-0 z-10 pointer-events-none"
                    style={{
                      width: 94,
                      background: "linear-gradient(to right, var(--color-background), transparent)",
                    }}
                  />
                  {/* Right gradient fade */}
                  <div
                    className="absolute top-0 bottom-0 right-0 z-10 pointer-events-none"
                    style={{
                      width: 94,
                      background: "linear-gradient(to left, var(--color-background), transparent)",
                    }}
                  />
                </div>
              )}

              {/* Text — second in DOM (below on mobile, left on desktop via order) */}
              <div className={`flex flex-col gap-4 min-w-0 ${isMobile ? "" : "order-1"}`}>
                <h1
                  className="font-medium leading-[1.1] tracking-tight lowercase flex flex-col"
                  style={{ color: "var(--color-on-surface)", fontSize: isMobile ? 36 : "clamp(48px, 7vw, 72px)" }}
                >
                  {headingLines.map((line, i) => (
                    <span
                      key={line}
                      className="animate-enter"
                      style={{ "--stagger": i + 1 } as React.CSSProperties}
                    >
                      {line}
                    </span>
                  ))}
                </h1>
                <div
                  className="flex flex-col leading-[1.2] tracking-tight"
                  style={{ color: "var(--color-on-surface)", opacity: 0.8, fontSize: isMobile ? 20 : "clamp(24px, 3.5vw, 36px)" }}
                >
                  {subtitleLines.map((line, i) => (
                    <span
                      key={line}
                      className="animate-enter"
                      style={{ "--stagger": headingLines.length + 1 + i } as React.CSSProperties}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Leaderboard */}
        <div className="flex flex-col gap-6">
          {/* Refresh pill */}
          <div
            className="animate-enter flex justify-end relative"
            style={{ "--stagger": headingLines.length + subtitleLines.length + 2 } as React.CSSProperties}
          >
            <div
              className="inline-flex px-1.5 py-1 rounded-[4.5px] relative"
              style={{ backgroundColor: "var(--color-on-surface)" }}
            >
              {/* <div className="absolute pointer-events-none" style={{ bottom: "100%", left: "50%", marginLeft: -MASCOT_SIZE / 2 }}>
                <StaticMascot mascotId="mascot-22" size={MASCOT_SIZE} />
              </div> */}
              <span
                className="text-sm md:text-base leading-none tracking-tight"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-background)",
                }}
              >
                {countdown ? formatCountdown(countdown) : "refreshes in --h --m --s"}
              </span>
            </div>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-2">
            {sampleData.map((entry, index) => (
              <div
                key={entry.rank}
                className="animate-enter relative"
                style={{ "--stagger": headingLines.length + subtitleLines.length + 3 + index } as React.CSSProperties}
              >
                {/* {index === 0 && !isMobile && (
                  <div className="absolute pointer-events-none z-10" style={{ top: -55, left: 120 }}>
                    <StaticMascot mascotId="mascot-11" size={MASCOT_SIZE} />
                  </div>
                )}
                {index === 2 && !isMobile && (
                  <div className="absolute pointer-events-none z-10" style={{ top: -55, right: 200 }}>
                    <StaticMascot mascotId="mascot-21" size={MASCOT_SIZE} />
                  </div>
                )}
                {index === 5 && !isMobile && (
                  <div className="absolute pointer-events-none z-10" style={{ top: -55, right: 160 }}>
                    <StaticMascot mascotId="mascot-04" size={MASCOT_SIZE} />
                  </div>
                )} */}
                <LeaderboardRow
                  rank={entry.rank}
                  name={entry.name}
                  username={entry.username}
                  profileImage={entry.profileImage}
                  interactions={entry.interactions}
                  showMascot={entry.rank <= 3}
                  userId={entry.userId}
                />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <LeaderboardsFooter />
    </div>
  );
}
