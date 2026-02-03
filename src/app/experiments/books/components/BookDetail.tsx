import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookData } from "../data";
import BookDetailLeftPage from "./BookDetailLeftPage";
import BookDetailRightPage from "./BookDetailRightPage";
import CommunityRewrites from "./CommunityRewrites";

interface BookDetailProps {
  book: BookData | null;
  onClose: () => void;
  isMobile: boolean;
}

export default function BookDetail({
  book,
  onClose,
  isMobile,
}: BookDetailProps) {
  // Close on Escape
  useEffect(() => {
    if (!book) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [book, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (book) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [book]);

  return (
    <AnimatePresence>
      {book && (
        <motion.div
          key="book-detail-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowY: "auto",
            background: "rgba(0,0,0,0.7)",
          }}
          onClick={(e) => {
            // Close on scrim click (not on children)
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Up arrow / close button */}
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              color: "#ffffff",
              marginTop: isMobile ? 60 : 80,
              marginBottom: 16,
              flexShrink: 0,
              backdropFilter: "blur(8px)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </motion.button>

          {/* Book spread */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{
              duration: 0.5,
              ease: [0, 0, 0.07, 1.25], // --ease-brand-bounce
            }}
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              width: isMobile ? "calc(100% - 32px)" : "min(800px, 90vw)",
              maxWidth: 800,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
              flexShrink: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <BookDetailLeftPage book={book} isMobile={isMobile} />
            <BookDetailRightPage book={book} isMobile={isMobile} />
          </motion.div>

          {/* Community Rewrites section */}
          <div
            style={{
              width: isMobile ? "100%" : "min(800px, 90vw)",
              maxWidth: 800,
              flexShrink: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CommunityRewrites
              rewrites={book.communityRewrites}
              isMobile={isMobile}
            />
          </div>

          {/* Bottom padding */}
          <div style={{ height: 64, flexShrink: 0 }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
