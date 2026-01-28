"use client";

export default function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      {/* Mascot placeholder */}
      <div
        className="w-[170px] h-[170px] rounded-2xl mb-4 flex items-center justify-center"
        style={{ backgroundColor: "var(--color-surface-variant)" }}
      >
        {/* TODO: Replace with actual mascot image */}
        <span className="text-6xl">🐱</span>
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
