"use client";

import { useState, useRef, useEffect } from "react";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  children: React.ReactNode;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  onOpen,
  children,
}: MobileDrawerProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);

  // Body scroll lock when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle drag start
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    startYRef.current = clientY;
  };

  // Handle drag move
  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    const delta = clientY - startYRef.current;
    // Only allow dragging down (positive delta) when open
    // or dragging up (negative delta) when closed
    if (isOpen && delta > 0) {
      setDragY(delta);
    } else if (!isOpen && delta < 0) {
      setDragY(delta);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Threshold to trigger open/close
    const threshold = 100;

    if (isOpen && dragY > threshold) {
      onClose();
    } else if (!isOpen && dragY < -threshold) {
      onOpen();
    }

    setDragY(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  // Global mouse move/up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isOpen, dragY]);

  // Calculate transform
  const getTransform = () => {
    if (isDragging) {
      if (isOpen) {
        // Dragging down from open state
        return `translateY(${Math.max(0, dragY)}px)`;
      } else {
        // Dragging up from closed state - show peek
        const peekAmount = Math.min(0, dragY);
        return `translateY(calc(100% - 80px + ${peekAmount}px))`;
      }
    }
    return isOpen ? "translateY(0)" : "translateY(calc(100% - 80px))";
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl"
        style={{
          backgroundColor: "var(--color-surface)",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.15)",
          height: "85vh",
          transform: getTransform(),
          transition: isDragging ? "none" : "transform 0.3s ease-out",
          overscrollBehavior: "none",
        }}
      >
        {/* Header with drag handle and close button */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0 cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none" }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Drag handle bar */}
          <div className="flex-1 flex justify-center">
            <div
              className="w-10 h-1 rounded-full"
              style={{ backgroundColor: "var(--color-surface-variant)" }}
            />
          </div>

        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ overscrollBehaviorY: "contain" }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
