"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Matter.js
const MascotLauncher = dynamic(
  () => import("@/components/MascotLauncher").then((mod) => mod.MascotLauncher),
  { ssr: false }
);

export default function LauncherPage() {
  return <MascotLauncher />;
}
