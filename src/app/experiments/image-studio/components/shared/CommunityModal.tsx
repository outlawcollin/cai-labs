"use client";

import { useEffect, useCallback, useRef } from "react";
import { CommunityCard } from "@/components/CommunitySection/CommunityCard";
import {
  communityCreations,
} from "@/data/communityCreations";

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommunityModal({ isOpen, onClose }: CommunityModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose]
  );

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center transition-opacity duration-200"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        zIndex: 100,
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="community-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full mx-4 outline-none flex flex-col"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-outline-variant)",
          borderRadius: "39px",
          boxShadow: "0px 15px 75px rgba(0, 0, 0, 0.8)",
          maxWidth: "600px",
          maxHeight: "80vh",
          paddingTop: "20px",
        }}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 mb-4">
          <h2
            id="community-modal-title"
            className="text-2xl font-medium"
            style={{ color: "var(--color-on-surface)" }}
          >
            community
          </h2>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex items-center justify-center transition-opacity hover:opacity-70 cursor-pointer"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              backgroundColor: "var(--color-surface-variant)",
            }}
            aria-label="Close modal"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "var(--color-on-surface)" }}
            >
              <path
                d="M6 6L18 18M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Card Grid */}
        <div
          className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide"
          style={{ minHeight: 0 }}
        >
          <div className="grid grid-cols-2 gap-3">
            {communityCreations.map((creation) => (
              <CommunityCard
                key={creation.id}
                creation={creation}
                scale={0.85}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
