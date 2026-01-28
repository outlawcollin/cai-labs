"use client";

interface ImageStudioNavBarProps {
  credits: number;
}

export default function ImageStudioNavBar({ credits }: ImageStudioNavBarProps) {
  return (
    <nav
      className="h-[54px] flex items-center justify-between px-6 shrink-0"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Logo */}
      <div className="flex items-center">
        <span
          className="text-lg font-medium"
          style={{ color: "var(--color-on-surface)" }}
        >
          (c.ai) image studio
        </span>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Credits button */}
        <button
          className="h-[38px] px-4 rounded-full flex items-center gap-2"
          style={{ backgroundColor: "var(--color-surface-variant)" }}
        >
          {/* Chat icon placeholder */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--color-on-surface)" }}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-on-surface)" }}
          >
            {credits}
          </span>
        </button>

        {/* Notification icon */}
        <button
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--color-surface-variant)" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--color-on-surface)" }}
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {/* Avatar */}
        <div
          className="w-[40px] h-[40px] rounded-full"
          style={{
            backgroundColor: "var(--color-surface-variant)",
            border: "1px solid var(--color-outline-variant)",
          }}
        >
          {/* TODO: Replace with actual avatar image */}
        </div>
      </div>
    </nav>
  );
}
