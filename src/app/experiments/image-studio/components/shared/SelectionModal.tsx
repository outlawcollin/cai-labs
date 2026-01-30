"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { Persona, Character } from "../../types";

type SelectableItem = Persona | Character;

interface Tab {
  id: string;
  label: string;
}

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: SelectableItem[];
  onSelect: (item: SelectableItem) => void;
  selectedId?: string;
  tabs?: Tab[];
  onTabChange?: (tabId: string) => void;
  activeTab?: string;
}

export function SelectionModal({
  isOpen,
  onClose,
  title,
  items,
  onSelect,
  selectedId,
  tabs,
  onTabChange,
  activeTab: controlledActiveTab,
}: SelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [internalActiveTab, setInternalActiveTab] = useState(tabs?.[0]?.id || "");
  const modalRef = useRef<HTMLDivElement>(null);

  const activeTab = controlledActiveTab ?? internalActiveTab;

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, searchQuery]);

  // Handle escape key to close
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Handle click outside to close
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Add/remove escape key listener
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

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Handle item selection
  const handleSelect = (item: SelectableItem) => {
    onSelect(item);
  };

  // Reset search when modal closes
  const handleClose = () => {
    setSearchQuery("");
    setHoveredId(null);
    onClose();
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center transition-opacity duration-200"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        zIndex: 100,
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full mx-4 outline-none flex flex-col"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-outline-variant)",
          borderRadius: "39px",
          boxShadow: "0px 15px 75px rgba(0, 0, 0, 0.8)",
          maxWidth: "460px",
          maxHeight: "80vh",
          paddingTop: "20px",
        }}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 mb-4">
          <h2
            id="modal-title"
            className="text-2xl font-medium"
            style={{ color: "var(--color-on-surface)" }}
          >
            {title}
          </h2>

          {/* Close Button - Circular */}
          <button
            onClick={handleClose}
            className="flex items-center justify-center hover:opacity-70 cursor-pointer"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              backgroundColor: "var(--color-surface-variant)",
            }}
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.8125 5.8125L12.1875 12.1875M12.1875 5.8125L5.8125 12.1875" stroke="var(--color-on-surface)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 mb-4">
          <div
            className="flex items-center gap-3 px-4 rounded-xl"
            style={{
              backgroundColor: "var(--color-surface-variant)",
              height: "48px",
            }}
          >
            {/* Search Icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "var(--color-on-surface-variant)", flexShrink: 0 }}
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M20 20L16 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search Characters"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-base"
              style={{ color: "var(--color-on-surface)" }}
            />
          </div>
        </div>

        {/* Tab Buttons */}
        {tabs && tabs.length > 0 && (
          <div className="flex gap-2 px-6 mb-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className="rounded-full font-medium transition-colors duration-200 cursor-pointer"
                  style={{
                    height: "44px",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    backgroundColor: isActive
                      ? "var(--color-inverse-surface)"
                      : "var(--color-surface-variant)",
                    color: isActive
                      ? "var(--color-inverse-on-surface)"
                      : "var(--color-on-surface-variant)",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable Item List */}
        <div
          className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-hide"
          style={{ minHeight: 0 }}
        >
          {filteredItems.length === 0 ? (
            <div
              className="py-12 text-center"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              No results found
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredItems.map((item) => {
                const isSelected = item.id === selectedId;
                const isHovered = item.id === hoveredId;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="flex items-center gap-3 w-full rounded-3xl transition-colors duration-200 cursor-pointer"
                    style={{
                      padding: "12px",
                      backgroundColor: isHovered
                        ? "var(--color-surface-variant)"
                        : "transparent",
                    }}
                  >
                    {/* Avatar - 52px, rounded-2xl */}
                    <div
                      className="flex-shrink-0 rounded-2xl overflow-hidden relative"
                      style={{
                        width: "52px",
                        height: "52px",
                        backgroundColor: "var(--color-surface-variant)",
                      }}
                    >
                      {item.avatar ? (
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-xl font-medium"
                          style={{ color: "var(--color-on-surface-variant)" }}
                        >
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Name - 16px medium */}
                    <span
                      className="flex-1 text-left font-medium"
                      style={{
                        color: "var(--color-on-surface)",
                        fontSize: "16px",
                      }}
                    >
                      {item.name}
                    </span>

                    {/* Select button - appears on hover */}
                    {isHovered && !isSelected && (
                      <span
                        className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: "var(--color-outline-variant)",
                          color: "var(--color-on-surface)",
                        }}
                      >
                        Select
                      </span>
                    )}

                    {/* Selected indicator - Subtract-2.svg */}
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16344 7.16344 0 16 0ZM25.8604 9.3916C25.4334 8.28717 24.1545 7.72398 23.0039 8.13379C21.2395 8.76233 19.5746 9.9508 18.1348 11.2207C15.8372 13.2471 13.8578 15.6316 12.0498 18.0977C11.5472 17.5641 11.0635 17.159 10.6074 16.8525C9.8933 16.3727 9.08834 16.032 8.22168 16C6.99463 16.0002 6 16.9558 6 18.1338C6.00015 19.1998 6.81474 20.0828 7.87891 20.2412C8.0768 20.3382 8.95217 20.8594 10.1816 22.9248C10.5722 23.5809 11.295 23.9902 12.082 24C12.8689 24.0098 13.6026 23.6185 14.0107 22.9727C14.328 22.4728 14.6648 21.9855 15.0049 21.501C16.8017 18.9409 18.7896 16.4377 21.1416 14.3633C22.4038 13.25 23.5953 12.5981 24.5303 11.9971C25.6888 11.2522 26.2872 10.4961 25.8604 9.3916Z"
                            fill="var(--color-on-surface)"
                          />
                          <path
                            d="M25.8604 9.3916C25.4334 8.28717 24.1545 7.72398 23.0039 8.13379C21.2395 8.76233 19.5746 9.9508 18.1348 11.2207C15.8372 13.2471 13.8578 15.6316 12.0498 18.0977C11.5472 17.5641 11.0635 17.159 10.6074 16.8525C9.8933 16.3727 9.08834 16.032 8.22168 16C6.99463 16.0002 6 16.9558 6 18.1338C6.00015 19.1998 6.81474 20.0828 7.87891 20.2412C8.0768 20.3382 8.95217 20.8594 10.1816 22.9248C10.5722 23.5809 11.295 23.9902 12.082 24C12.8689 24.0098 13.6026 23.6185 14.0107 22.9727C14.328 22.4728 14.6648 21.9855 15.0049 21.501C16.8017 18.9409 18.7896 16.4377 21.1416 14.3633C22.4038 13.25 23.5953 12.5981 24.5303 11.9971C25.6888 11.2522 26.2872 10.4961 25.8604 9.3916Z"
                            fill="var(--color-surface)"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SelectionModal;
