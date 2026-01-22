import Image from "next/image";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

function Mascot({ id, className }: { id: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className || ""}`}>
      <Image
        src={`/mascots/mascot-${id}/Mascot_${id}_Base.png`}
        alt=""
        fill
        className="object-contain"
      />
      <Image
        src={`/mascots/mascot-${id}/Mascot_${id}_Eyes_Neutral.png`}
        alt=""
        fill
        className="object-contain"
      />
    </span>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <NavBar navOpacity={1} showLogo />

      {/* Hero Section */}
      <div className="relative pt-32 md:pt-[220px] pb-32 md:pb-[300px] px-4 md:px-8">
        <div className="flex flex-col gap-4 md:gap-5 items-center text-center max-w-[1200px] mx-auto">
          {/* Label */}
          <p
            className="font-mono text-[18px] md:text-[30px]"
            style={{ color: "var(--color-primary)" }}
          >
            The purpose
          </p>

          {/* Mission Statement with inline mascots */}
          <p
            className="font-medium text-[28px] md:text-[60px] leading-[1.2] tracking-[-0.56px] md:tracking-[-1.2px]"
            style={{ color: "var(--color-primary)" }}
          >
            Cai Labs was created to push creative tools beyond what already exists. By sharing experiments early, we can explore new formats, learn faster, and discover what truly unlocks creativity.
            {/* Inline mascot after first major thought */}
            <Mascot id="04" className="w-[40px] h-[40px] md:w-[65px] md:h-[65px] mx-1 md:mx-2 align-middle" />
            Some ideas will grow, others will change or disappear, but each one helps shape what comes next.
            {/* Inline mascot at the end */}
            <Mascot id="02" className="w-[40px] h-[40px] md:w-[65px] md:h-[65px] mx-1 md:mx-2 align-middle" />
          </p>
        </div>

        {/* Outside mascots - positioned around text container */}
        {/* Top-left outside the text */}
        <div className="hidden lg:block absolute top-[160px] left-[5%] xl:left-[10%] w-[70px] h-[70px]">
          <Mascot id="11" className="w-full h-full" />
        </div>

        {/* Top-right outside the text */}
        <div className="hidden lg:block absolute top-[200px] right-[5%] xl:right-[10%] w-[80px] h-[80px]">
          <Mascot id="21" className="w-full h-full" />
        </div>
      </div>

      <Footer />
    </div>
  );
}
