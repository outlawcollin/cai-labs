"use client";

import { useEffect, useState } from "react";
import { Libre_Baskerville } from "next/font/google";
import SubpageNavBar from "@/components/SubpageNavBar";
import SubpageFooter from "@/components/SubpageFooter";
import {
  ThemeProvider,
  useTheme,
} from "@/app/experiments/image-studio/context/ThemeContext";
import { BOOKS } from "./data";
import Bookshelf from "./components/Bookshelf";
import ShelfFilterPills from "./components/ShelfFilterPills";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

export default function BooksPage() {
  return (
    <ThemeProvider>
      <BooksContent />
    </ThemeProvider>
  );
}

function BooksFooter() {
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
        setVariant(
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
        );
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
                <span style={{ color: "var(--color-on-surface-variant)" }}>
                  /
                </span>
              )}
            </span>
          ))}
        </div>
      }
    />
  );
}

const headingText = "books you can live.";
const subtitleText =
  "Play as a character in the classics, or add a story of your own.";

function BooksContent() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile === null) {
    return (
      <div
        className="flex flex-col min-h-dvh"
        style={{ backgroundColor: "var(--color-background)" }}
      />
    );
  }

  return (
    <div
      className={`flex flex-col h-dvh ${libreBaskerville.variable}`}
      style={{
        backgroundColor: "var(--color-background)",
        overflowX: "clip",
      }}
    >
      {/* Brand easing */}
      <style>{`
        :root {
          --ease-brand: cubic-bezier(0.93, 0.00, 0.07, 1.00);
          --ease-brand-in: cubic-bezier(0.00, 0.00, 0.07, 1.00);
          --ease-brand-out: cubic-bezier(0.93, 0.00, 1.00, 1.00);
          --ease-brand-bounce: cubic-bezier(0.00, 0.00, 0.07, 1.25);
        }
      `}</style>

      {/* NavBar */}
      <div>
        <SubpageNavBar
          backHref="/"
          isMobile={isMobile}
          variant="light"
          logoNode={
            <svg
              width="110"
              height="21"
              viewBox="0 0 110 21"
              fill="none"
              style={{ height: 24, width: "auto", color: "var(--color-on-surface)" }}
            >
              <path d="M11.3937 15.1537C9.537 15.1537 8.42445 13.8705 8.42445 11.6896C8.42445 9.50875 9.51807 8.18527 11.3937 8.18527C12.8164 8.18527 13.6625 8.79666 13.8897 10.1417H16.1177C15.9109 7.88029 14.0557 6.35254 11.3952 6.35254C8.23951 6.35254 6.09448 8.51182 6.09448 11.691C6.09448 14.8703 8.17834 16.9878 11.3952 16.9878C14.1591 16.9878 15.9531 15.4601 16.2211 13.1987H13.9931C13.6843 14.6041 12.879 15.1551 11.3937 15.1551V15.1537Z" fill="currentColor"/>
              <path d="M3.04934 0.960449C1.26692 3.14419 0.0160185 6.63414 0 10.0335C0.0160185 13.4342 1.26692 16.9227 3.04934 19.1065L5.11864 19.0979C3.28671 16.7271 2.3853 13.4371 2.36928 10.0335C2.3853 6.62983 3.28671 3.33983 5.11864 0.969081L3.04934 0.960449Z" fill="currentColor"/>
              <path d="M41.7006 0.960449C43.4845 3.14419 44.7354 6.63414 44.75 10.0335C44.734 13.4342 43.4831 16.9227 41.7006 19.1065L39.6313 19.0979C41.4633 16.7271 42.3647 13.4371 42.3807 10.0335C42.3647 6.62983 41.4633 3.33983 39.6313 0.969081L41.7006 0.960449Z" fill="currentColor"/>
              <path d="M19.8849 13.7881C18.9573 13.7881 18.2961 14.4599 18.2961 15.418C18.2961 16.3761 18.9558 16.9875 19.8849 16.9875C20.814 16.9875 21.4518 16.3358 21.4518 15.418C21.4518 14.5002 20.8125 13.7881 19.8849 13.7881Z" fill="currentColor"/>
              <path d="M35.9821 2.07275C35.136 2.07275 34.5593 2.64386 34.5593 3.47823C34.5593 4.3126 35.1374 4.88371 35.9821 4.88371C36.8267 4.88371 37.4048 4.3126 37.4048 3.47823C37.4048 2.64386 36.8267 2.07275 35.9821 2.07275Z" fill="currentColor"/>
              <path d="M37.1163 6.47461H34.8271V16.8654H37.1163V6.47461Z" fill="currentColor"/>
              <path d="M28.5043 6.35254C25.8845 6.35254 24.2346 7.63574 24.0497 9.85688H26.2777C26.4015 8.7981 27.2053 8.18671 28.4431 8.18671C29.6809 8.18671 30.4032 8.75782 30.4032 9.79646C30.4032 10.3259 30.2387 10.4683 29.5164 10.5905C27.8039 10.8552 26.5049 11.0178 25.6807 11.2839C24.3395 11.7112 23.6187 12.6491 23.6187 13.9942C23.6187 15.8485 24.9176 16.9893 27.0626 16.9893C28.4854 16.9893 29.7028 16.3779 30.4251 15.2774H30.5081V16.867H32.6939V10.3676C32.6939 7.77959 31.1881 6.35398 28.5072 6.35398L28.5043 6.35254ZM30.4018 12.3427C30.4018 13.9525 29.164 15.1752 27.4937 15.1752C26.4831 15.1752 25.9268 14.7264 25.9268 13.9122C25.9268 13.2404 26.2573 12.8318 26.9374 12.6089C27.6175 12.3844 29.5979 12.2823 30.4018 12.0377V12.3427Z" fill="currentColor"/>
              <path d="M105.487 16.992C102.514 16.992 100.763 15.7731 100.573 13.5244H102.472C102.704 14.8694 103.631 15.4789 105.487 15.4789C107.196 15.4789 108.081 14.9325 108.081 13.9447C108.081 13.02 107.491 12.6418 105.719 12.4316L104.454 12.2635C101.881 11.9693 100.848 11.0446 100.848 9.17421C100.848 7.24079 102.514 6.10596 105.234 6.10596C107.913 6.10596 109.558 7.21978 109.747 9.30031H107.871C107.617 8.14446 106.795 7.61907 105.234 7.61907C103.526 7.61907 102.767 8.10243 102.767 9.06914C102.767 9.99382 103.336 10.3931 105.023 10.5823L106.394 10.7714C109.178 11.1287 110.001 11.8642 110.001 13.8396C110.001 15.9202 108.44 16.992 105.487 16.992Z" fill="currentColor"/>
              <path d="M88.1599 16.887V1.75586H90.1213V11.1918H90.1845L95.6889 6.21114H97.8822L93.2636 10.5613V10.6454L98.0931 16.887H95.8998L91.956 11.8643H91.8717L90.1213 13.5245V16.887H88.1599Z" fill="currentColor"/>
              <path d="M79.9852 16.992C76.8218 16.992 74.6707 14.7853 74.6707 11.57C74.6707 8.31258 76.864 6.10596 79.9852 6.10596C83.1909 6.10596 85.342 8.3336 85.342 11.57C85.342 14.8064 83.1909 16.992 79.9852 16.992ZM79.9852 15.3948C82.052 15.3948 83.3596 13.9237 83.3596 11.57C83.3596 9.17421 82.052 7.70313 79.9852 7.70313C77.9396 7.70313 76.6742 9.19523 76.6742 11.57C76.6742 13.9447 77.9396 15.3948 79.9852 15.3948Z" fill="currentColor"/>
              <path d="M67.3397 16.992C64.1763 16.992 62.0251 14.7853 62.0251 11.57C62.0251 8.31258 64.2185 6.10596 67.3397 6.10596C70.5454 6.10596 72.6965 8.3336 72.6965 11.57C72.6965 14.8064 70.5454 16.992 67.3397 16.992ZM67.3397 15.3948C69.4065 15.3948 70.7141 13.9237 70.7141 11.57C70.7141 9.17421 69.4065 7.70313 67.3397 7.70313C65.294 7.70313 64.0287 9.19523 64.0287 11.57C64.0287 13.9447 65.294 15.3948 67.3397 15.3948Z" fill="currentColor"/>
              <path d="M55.3269 16.9921C53.7663 16.9921 52.3533 16.2565 51.6151 15.0376H51.5519V16.887H49.6538V1.75586H51.6362V8.08152H51.6995C52.4587 6.8416 53.8296 6.10606 55.3269 6.10606C58.1951 6.10606 60.051 8.27065 60.051 11.5701C60.051 14.8695 58.1951 16.9921 55.3269 16.9921ZM54.7997 15.3949C56.8032 15.3949 58.0686 13.9238 58.0686 11.5701C58.0686 9.17432 56.7821 7.70324 54.7997 7.70324C52.8173 7.70324 51.5519 9.21635 51.5519 11.5701C51.5519 13.9238 52.7962 15.3949 54.7997 15.3949Z" fill="currentColor"/>
            </svg>
          }
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Title Section */}
        <div
          className="flex flex-col items-center gap-3 px-6"
          style={{
            paddingTop: isMobile ? 64 : 96,
            paddingBottom: isMobile ? 24 : 44,
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: isMobile ? 36 : "clamp(36px, 5vw, 48px)",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--color-on-surface)",
              textAlign: "center",
              margin: 0,
              whiteSpace: "nowrap",
            }}
          >
            {headingText}
          </h1>

          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: isMobile ? 16 : "clamp(16px, 2vw, 24px)",
              fontWeight: 400,
              lineHeight: 1.4,
              color: "var(--color-on-surface)",
              opacity: 0.8,
              textAlign: "center",
              margin: 0,
              whiteSpace: "nowrap",
            }}
          >
            {subtitleText}
          </p>
        </div>

        {/* Bookshelf */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Bookshelf
            books={BOOKS}
            isMobile={isMobile}
          />
        </div>

        {/* Filter pills */}
        <div>
          <ShelfFilterPills
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
      </main>

      {/* Footer */}
      <BooksFooter />
    </div>
  );
}
