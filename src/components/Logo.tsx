export function Logo({ className }: { className?: string }) {
  return (
    <svg
      width="60"
      height="27"
      viewBox="0 0 60 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13.59 14.43C13.59 15.87 12.42 17.04 10.98 17.04C9.54 17.04 8.37 15.87 8.37 14.43C8.37 12.99 9.54 11.82 10.98 11.82C12.42 11.82 13.59 12.99 13.59 14.43Z"
        fill="currentColor"
      />
      <path
        d="M6.87 1.29C6.87 0.58 6.29 0 5.58 0C4.87 0 4.29 0.58 4.29 1.29V24.45C4.29 25.16 4.87 25.74 5.58 25.74C6.29 25.74 6.87 25.16 6.87 24.45V1.29Z"
        fill="currentColor"
      />
      <path
        d="M53.25 1.29C53.25 0.58 53.83 0 54.54 0C55.25 0 55.83 0.58 55.83 1.29V24.45C55.83 25.16 55.25 25.74 54.54 25.74C53.83 25.74 53.25 25.16 53.25 24.45V1.29Z"
        fill="currentColor"
      />
      <path
        d="M24.58 18.59C24.58 17.88 25.16 17.3 25.87 17.3C26.58 17.3 27.16 17.88 27.16 18.59V22.86C27.16 23.57 26.58 24.15 25.87 24.15C25.16 24.15 24.58 23.57 24.58 22.86V18.59Z"
        fill="currentColor"
      />
      <path
        d="M9.74 2.79C9.74 2.08 10.32 1.5 11.03 1.5C11.74 1.5 12.32 2.08 12.32 2.79V6.57C12.32 7.28 11.74 7.86 11.03 7.86C10.32 7.86 9.74 7.28 9.74 6.57V2.79Z"
        fill="currentColor"
      />
      <path
        d="M10.13 8.73C10.13 8.02 10.71 7.44 11.42 7.44C12.13 7.44 12.71 8.02 12.71 8.73V14.04C12.71 14.75 12.13 15.33 11.42 15.33C10.71 15.33 10.13 14.75 10.13 14.04V8.73Z"
        fill="currentColor"
      />
      <path
        d="M16.07 14.43C16.07 12.62 17.54 11.15 19.35 11.15C21.16 11.15 22.63 12.62 22.63 14.43C22.63 16.24 21.16 17.71 19.35 17.71C17.54 17.71 16.07 16.24 16.07 14.43Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LabsLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className || ""}`}>
      <span
        className="font-mono text-[26px]"
        style={{ color: "var(--color-primary)" }}
      >
        (c.ai)
      </span>
      <span
        className="font-mono text-[26px]"
        style={{ color: "var(--color-primary)" }}
      >
        labs
      </span>
    </div>
  );
}

export default Logo;
