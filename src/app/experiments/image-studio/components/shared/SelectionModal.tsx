"use client";

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
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
  activeTab,
}: SelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, searchQuery]);

  // Handle item selection
  const handleSelect = (item: SelectableItem) => {
    onSelect(item);
    onClose();
  };

  // Reset search when modal closes
  const handleClose = () => {
    setSearchQuery("");
    setHoveredId(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="flex flex-col" style={{ maxHeight: "70vh" }}>
        {/* Search Input */}
        <div className="mb-4">
          <SearchInput
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Optional Tabs */}
        {tabs && tabs.length > 0 && (
          <div
            className="flex gap-2 mb-4 pb-3"
            style={{ borderBottom: "1px solid var(--color-outline)" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                style={{
                  backgroundColor:
                    activeTab === tab.id
                      ? "var(--color-primary)"
                      : "transparent",
                  color:
                    activeTab === tab.id
                      ? "var(--color-on-primary)"
                      : "var(--color-on-surface-variant)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Item List */}
        <div
          className="flex-1 overflow-y-auto -mx-5 px-5"
          style={{ maxHeight: "400px" }}
        >
          {filteredItems.length === 0 ? (
            <div
              className="py-8 text-center"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              No results found
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredItems.map((item) => {
                const isSelected = item.id === selectedId;
                const isHovered = item.id === hoveredId;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="flex items-center gap-4 w-full rounded-xl transition-colors duration-200"
                    style={{
                      height: "76px",
                      padding: "10px 12px",
                      backgroundColor: isHovered
                        ? "var(--color-surface-container)"
                        : "transparent",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="flex-shrink-0 rounded-lg overflow-hidden"
                      style={{
                        width: "56px",
                        height: "56px",
                        backgroundColor: "var(--color-surface-container)",
                      }}
                    >
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-xl"
                          style={{ color: "var(--color-on-surface-variant)" }}
                        >
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <span
                      className="flex-1 text-left font-medium"
                      style={{ color: "var(--color-on-surface)" }}
                    >
                      {item.name}
                    </span>

                    {/* Selected Checkmark or Hover Select Button */}
                    {isSelected ? (
                      <div
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 12L10 17L19 8"
                            stroke="var(--color-on-primary)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    ) : isHovered ? (
                      <span
                        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: "var(--color-primary)",
                          color: "var(--color-on-primary)",
                        }}
                      >
                        Select
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default SelectionModal;
