"use client";

import { StoryCard } from "./StoryCard";
import { Story } from "@/data/stories";

const CARD_WIDTH = 800;
const CARD_GAP = 20;

interface StoriesSectionProps {
  stories: Story[];
}

export function StoriesSection({ stories }: StoriesSectionProps) {
  return (
    <div className="mt-32 mb-24">
      {/* Section Header */}
      <div className="mb-10 md:mb-16 px-4 md:px-8 text-center">
        <h2
          className="font-semibold text-[32px] md:text-[48px] leading-[1] tracking-[-0.64px] md:tracking-[-0.96px] mb-3"
          style={{ color: "var(--color-on-background)" }}
        >
          built in the open
        </h2>
        <p
          className="font-medium text-[16px] md:text-[20px] leading-normal"
          style={{ color: "var(--color-on-background)" }}
        >
          Stories from the Character.ai team on how we build and experiment with new ideas.
        </p>
      </div>

      {/* Mobile: Vertical stack of cards */}
      <div className="md:hidden flex flex-col gap-4 px-4">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} isMobile={true} />
        ))}
      </div>

      {/* Desktop: Scrollable Cards Container */}
      <div
        className="hidden md:block overflow-x-auto scrollbar-hide select-none"
        style={{ cursor: "grab" }}
        onMouseDown={(e) => {
          e.preventDefault();
          const el = e.currentTarget;
          el.style.cursor = "grabbing";

          const startX = e.clientX;
          const scrollLeft = el.scrollLeft;
          let isDragging = false;

          const handleMouseMove = (e: MouseEvent) => {
            e.preventDefault();
            isDragging = true;
            const x = e.clientX;
            const walk = (startX - x) * 1.2;
            el.scrollLeft = scrollLeft + walk;
          };

          const handleMouseUp = () => {
            el.style.cursor = "grab";
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);

            // Prevent click if we were dragging
            if (isDragging) {
              const preventClick = (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
              };
              el.addEventListener("click", preventClick, { capture: true, once: true });
            }
          };

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }}
      >
        <div
          className="flex gap-5 px-8 py-4"
          style={{
            width: `${88 + stories.length * CARD_WIDTH + (stories.length - 1) * CARD_GAP}px`,
          }}
        >
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>

      {/* All Stories Button */}
      <div className="flex justify-center mt-10">
        <a
          href="/stories"
          className="group inline-flex items-center gap-2 h-11 px-5 rounded-full border transition-all duration-200 hover:bg-[var(--color-on-background)]"
          style={{
            borderColor: "var(--color-on-background)",
            color: "var(--color-on-background)",
          }}
        >
          <span className="font-medium text-base whitespace-nowrap group-hover:text-[var(--color-background)]">
            All Stories
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="group-hover:stroke-[var(--color-background)]"
          >
            <path
              d="M4.16667 10H15.8333M15.8333 10L10 4.16667M15.8333 10L10 15.8333"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:stroke-[var(--color-background)]"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default StoriesSection;
