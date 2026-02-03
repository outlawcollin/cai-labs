import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { BookData } from "../data";
import Book, { SPINE_W, COVER_W, SPREAD_W, BookState } from "./Book";

interface BookshelfProps {
  books: BookData[];
  isMobile: boolean;
  onBookDetails?: (book: BookData | null) => void;
}

const GAP = 100;
const FADE_W = 60;
const EASE_BRAND: [number, number, number, number] = [0.93, 0, 0.07, 1];

const widthForState: Record<BookState, number> = {
  closed: SPINE_W,
  cover: COVER_W,
  details: SPREAD_W,
};

export default function Bookshelf({
  books,
  isMobile,
  onBookDetails,
}: BookshelfProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openState, setOpenState] = useState<"cover" | "details">("cover");
  const [centeredIndex, setCenteredIndex] = useState(Math.floor(books.length / 2));
  const [viewportW, setViewportW] = useState(0);

  // Track viewport width
  useEffect(() => {
    const update = () => setViewportW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getBookState = useCallback(
    (index: number): BookState => {
      if (openIndex !== index) return "closed";
      return openState;
    },
    [openIndex, openState]
  );

  // Notify parent when details state changes
  useEffect(() => {
    if (openIndex !== null && openState === "details") {
      onBookDetails?.(books[openIndex]);
    } else {
      onBookDetails?.(null);
    }
  }, [openIndex, openState, books, onBookDetails]);

  // Close on Escape
  useEffect(() => {
    if (openIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openState === "details") {
          // Details → cover
          setOpenState("cover");
        } else {
          // Cover → closed
          setOpenIndex(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openIndex]);

  // Compute translateX to center the target book
  const translateX = useMemo(() => {
    if (viewportW === 0) return 0;

    const targetIndex =
      openIndex !== null ? openIndex : centeredIndex;

    let offset = 0;
    for (let i = 0; i < targetIndex; i++) {
      offset += widthForState[getBookState(i)] + GAP;
    }
    offset += widthForState[getBookState(targetIndex)] / 2;

    return -(offset - viewportW / 2);
  }, [viewportW, openIndex, openState, books.length, getBookState, centeredIndex]);

  function handleSpineClick(index: number) {
    if (openIndex === index) {
      setOpenIndex(null);
      setOpenState("cover");
    } else {
      setOpenIndex(index);
      setOpenState("cover");
      setCenteredIndex(index);
    }
  }

  function handleCoverClick(index: number) {
    if (openIndex === index && openState === "cover") {
      setOpenState("details");
    }
  }

  function handleClose() {
    // Revert from details to cover (keep book open and centered)
    setOpenState("cover");
  }

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        display: "flex",
        alignItems: "center",
        overflowX: "clip",
      }}
    >
      {/* Left gradient fade */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: FADE_W,
          background:
            "linear-gradient(to right, var(--color-background), transparent)",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      {/* Right gradient fade */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: FADE_W,
          background:
            "linear-gradient(to left, var(--color-background), transparent)",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      {/* Animated track — hidden until viewport measured */}
      {viewportW > 0 && (
      <motion.div
        initial={false}
        animate={{ x: translateX }}
        transition={{ duration: 0.8, ease: EASE_BRAND }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: GAP,
          willChange: "transform",
        }}
      >
        {books.map((book, i) => (
          <Book
            key={book.slug}
            book={book}
            state={getBookState(i)}
            onSpineClick={() => handleSpineClick(i)}
            onCoverClick={() => handleCoverClick(i)}
            onClose={handleClose}
            isMobile={isMobile}
          />
        ))}
      </motion.div>
      )}
    </div>
  );
}
