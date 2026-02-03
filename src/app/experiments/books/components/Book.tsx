import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BookData } from "../data";
import BookDetailLeftPage from "./BookDetailLeftPage";
import BookDetailRightPage from "./BookDetailRightPage";

/* ---------- Types ---------- */
export type BookState = "closed" | "cover" | "details";

/* ---------- Constants ---------- */
const SPINE_W = 72;
const BOOK_H = 475;
const COVER_W = Math.round(BOOK_H * (1388 / 2112)); // ~312
const BODY_W = SPINE_W + COVER_W; // ~384
const PAGE_W = COVER_W;
const SPREAD_W = PAGE_W * 2; // ~624

const EASE_BRAND: [number, number, number, number] = [0.93, 0, 0.07, 1];
const DURATION = 1;
const FLIP_DURATION = 0.8;

const containerWidth: Record<BookState, number> = {
  closed: SPINE_W,
  cover: COVER_W,
  details: SPREAD_W,
};

const bodyRotation: Record<BookState, number> = {
  closed: 90,
  cover: 0,
  details: -180,
};

const sceneLeft: Record<BookState, number> = {
  closed: 0,
  cover: -SPINE_W,
  details: -SPINE_W,
};

/* ---------- Props ---------- */
interface BookProps {
  book: BookData;
  state: BookState;
  onSpineClick: () => void;
  onCoverClick: () => void;
  onClose: () => void;
  isMobile: boolean;
}

/* ---------- Component ---------- */
export default function Book({
  book,
  state,
  onSpineClick,
  onCoverClick,
  onClose,
  isMobile,
}: BookProps) {
  const isDetails = state === "details";
  const isClosed = state === "closed";
  const showPages = state === "cover" || state === "details";

  return (
    <motion.div
      initial={false}
      animate={{ width: containerWidth[state] }}
      transition={{ duration: isDetails ? FLIP_DURATION : DURATION, ease: EASE_BRAND }}
      style={{
        height: BOOK_H,
        position: "relative",
        flexShrink: 0,
        overflow: "visible",
      }}
    >
      {/* ── 3D Book (spine + cover locked together) ── */}
      <motion.div
        initial={false}
        animate={{ left: sceneLeft[state], opacity: isDetails ? 0 : 1 }}
        transition={{ duration: isDetails ? FLIP_DURATION : DURATION, ease: EASE_BRAND }}
        style={{
          perspective: 1200,
          position: "absolute",
          left: 0,
          top: 0,
          width: BODY_W,
          height: BOOK_H,
          pointerEvents: "none",
          willChange: "left",
        }}
      >
        <motion.div
          onClick={isClosed ? onSpineClick : state === "cover" ? onCoverClick : undefined}
          initial={false}
          animate={{ rotateY: bodyRotation[state] }}
          transition={{
            duration: isDetails ? FLIP_DURATION : DURATION,
            ease: EASE_BRAND,
          }}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: `${SPINE_W}px center`,
            width: BODY_W,
            height: BOOK_H,
            position: "relative",
            cursor: isDetails ? "default" : "pointer",
            pointerEvents: isDetails ? "none" : "auto",
            willChange: "transform",
          }}
        >
          {/* Cover face — flat front */}
          <div
            style={{
              position: "absolute",
              left: SPINE_W,
              top: 0,
              width: COVER_W,
              height: BOOK_H,
              backfaceVisibility: "hidden",
              borderRadius: "0 6px 6px 0",
              overflow: "hidden",
              background: book.accentColor,
              boxShadow: "0 2px 24px rgba(0,0,0,0.12)",
            }}
          >
            <Image
              src="/books/covers/romeo.png"
              alt={book.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Spine face — perpendicular, visible when body at -90deg */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: SPINE_W,
              height: BOOK_H,
              transform: "rotateY(-90deg)",
              transformOrigin: "right center",
              backfaceVisibility: "hidden",
              borderRadius: "4px 0 0 4px",
              overflow: "hidden",
              background: darken(book.accentColor, 0.3),
              boxShadow: "0 2px 24px rgba(0,0,0,0.12)",
            }}
          >
            <Image
              src="/books/spines/romeo.png"
              alt={`${book.title} spine`}
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Interior pages — visible in details state ── */}
      {showPages && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isDetails ? 1 : 0 }}
          transition={{ duration: 0.4, delay: isDetails ? 0.2 : 0, ease: EASE_BRAND }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: SPREAD_W,
            height: BOOK_H,
            display: "flex",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 2px 24px rgba(0,0,0,0.12)",
            zIndex: 1,
            pointerEvents: isDetails ? "auto" : "none",
          }}
        >
          <div style={{ width: PAGE_W, height: BOOK_H, overflow: "hidden" }}>
            <BookDetailLeftPage book={book} isMobile={false} compact />
          </div>
          <div style={{ width: PAGE_W, height: BOOK_H, overflow: "hidden" }}>
            <BookDetailRightPage book={book} isMobile={false} compact />
          </div>
        </motion.div>
      )}

      {/* ── Close button — visible in details state ── */}
      <AnimatePresence>
        {isDetails && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            onClick={onClose}
            className="cursor-pointer"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "rgba(62, 39, 51, 0.08)",
              color: "#3e2733",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export { SPINE_W, BOOK_H, COVER_W, SPREAD_W, PAGE_W };

/* ---------- Color utility ---------- */

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function darken(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const f = 1 - amount;
  return `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`;
}
