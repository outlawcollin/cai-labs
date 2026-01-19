"use client";

import { useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import { createCardBody } from "@/lib/physics/bodies";

const { World } = Matter;

interface CardData {
  id: string;
  title: string;
  description: string;
  color: string;
  rotation: number;
  featured?: boolean;
}

const cardsData: CardData[] = [
  {
    id: "streams",
    title: "Streams",
    description: "Real-time AI conversations",
    color: "var(--color-secondary)",
    rotation: -12,
    featured: true,
  },
  {
    id: "comics",
    title: "Comics",
    description: "AI-generated visual stories",
    color: "var(--color-tertiary)",
    rotation: -6,
  },
  {
    id: "studio",
    title: "Image Studio",
    description: "Create stunning visuals",
    color: "var(--color-warning)",
    rotation: 0,
    featured: true,
  },
  {
    id: "news",
    title: "Fandom News",
    description: "Personalized updates",
    color: "var(--color-error)",
    rotation: 6,
  },
  {
    id: "books",
    title: "Books",
    description: "Interactive reading",
    color: "var(--color-primary)",
    rotation: 12,
  },
];

interface CardsProps {
  engine: Matter.Engine | null;
}

export function Cards({ engine }: CardsProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bodiesCreated = useRef(false);

  const createCardBodies = useCallback(() => {
    if (!engine || bodiesCreated.current) return;

    cardRefs.current.forEach((cardEl, index) => {
      if (!cardEl) return;

      const rect = cardEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const body = createCardBody(
        centerX,
        centerY,
        rect.width,
        rect.height,
        cardsData[index].rotation,
        cardsData[index].id
      );

      World.add(engine.world, body);
    });

    bodiesCreated.current = true;
  }, [engine]);

  useEffect(() => {
    const timer = setTimeout(createCardBodies, 150);
    return () => clearTimeout(timer);
  }, [createCardBodies]);

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end justify-center pb-8">
      {cardsData.map((card, index) => (
        <div
          key={card.id}
          ref={(el) => { cardRefs.current[index] = el; }}
          className="relative w-[200px] h-[280px] rounded-2xl shadow-lg flex flex-col p-5 transition-transform hover:scale-105"
          style={{
            backgroundColor: card.color,
            transform: `rotate(${card.rotation}deg)`,
            marginLeft: index === 0 ? 0 : "-40px",
            zIndex: 10 - Math.abs(index - 2),
          }}
        >
          {card.featured && (
            <span className="absolute top-3 right-3 bg-white/90 text-[10px] font-semibold px-2 py-1 rounded uppercase">
              Featured
            </span>
          )}
          <h3 className="text-xl font-bold text-[var(--color-primary)] mt-auto">
            {card.title}
          </h3>
          <p className="text-sm text-[var(--color-primary)]/70 mt-1 mb-4">
            {card.description}
          </p>
          <button className="self-start px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
            Try Now &rarr;
          </button>
        </div>
      ))}
    </div>
  );
}
