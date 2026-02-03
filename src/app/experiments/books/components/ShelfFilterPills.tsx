interface ShelfFilterPillsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: "all", label: "All books", style: "filled" as const },
  { id: "progress", label: "In progress", style: "outlined" as const },
  { id: "add", label: "Add a book", style: "text" as const },
];

export default function ShelfFilterPills({
  activeFilter,
  onFilterChange,
}: ShelfFilterPillsProps) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      style={{ paddingTop: 24, paddingBottom: 64 }}
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;

        if (filter.style === "filled") {
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className="cursor-pointer"
              style={{
                height: 38,
                paddingLeft: 18,
                paddingRight: 18,
                borderRadius: 40,
                border: "none",
                background: isActive
                  ? "var(--color-inverse-surface)"
                  : "var(--color-surface-variant)",
                color: isActive
                  ? "var(--color-inverse-on-surface)"
                  : "var(--color-on-surface)",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 500,
                transition: "background 200ms var(--ease-brand, ease), color 200ms var(--ease-brand, ease)",
              }}
            >
              {filter.label}
            </button>
          );
        }

        if (filter.style === "outlined") {
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className="cursor-pointer"
              style={{
                height: 38,
                paddingLeft: 18,
                paddingRight: 18,
                borderRadius: 40,
                border: "1px solid var(--color-outline-variant)",
                background: "transparent",
                color: "var(--color-on-surface)",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 500,
                transition: "background 200ms var(--ease-brand, ease)",
              }}
            >
              {filter.label}
            </button>
          );
        }

        // text style with icon
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className="flex items-center gap-2 cursor-pointer"
            style={{
              height: 38,
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: "var(--color-on-surface)",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {/* Chat/add icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
