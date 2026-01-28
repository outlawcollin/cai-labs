"use client";

import { useState, useEffect } from "react";
import { useImageStudio } from "@/hooks/useImageStudio";
import Sidebar from "./components/Sidebar";
import OutputArea from "./components/OutputArea";
import ImageStudioNavBar from "./components/ImageStudioNavBar";
import MobileDrawer from "./components/MobileDrawer";

export default function ImageStudioPage() {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkMobile();

    // Check on resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    state,
    setMode,
    setPersona,
    setCharacter,
    setCharacter2,
    toggleDropdown,
    selectOption,
    removeOption,
    startGeneration,
    canGenerate,
  } = useImageStudio();

  const handleGenerate = () => {
    if (!canGenerate) return;
    startGeneration();

    // TODO: Replace with actual API call
    // For now, just simulate a delay
    setTimeout(() => {
      // completeGeneration would be called here with real data
    }, 3000);
  };

  // Sidebar props shared between desktop and mobile
  const sidebarProps = {
    mode: state.mode,
    onModeChange: setMode,
    persona: state.persona,
    onPersonaChange: setPersona,
    character: state.character,
    onCharacterChange: setCharacter,
    character2: state.character2,
    onCharacter2Change: setCharacter2,
    selectedOptions: state.selectedOptions,
    expandedDropdown: state.expandedDropdown,
    onToggleDropdown: toggleDropdown,
    onSelectOption: selectOption,
    onRemoveOption: removeOption,
    status: state.status,
    canGenerate,
    onGenerate: handleGenerate,
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Nav Bar */}
      <ImageStudioNavBar credits={500} isMobile={isMobile} />

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="flex flex-1">
          <Sidebar {...sidebarProps} />
          <OutputArea
            status={state.status}
            currentBatch={state.currentBatch}
            history={state.history}
            isMobile={false}
          />
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <>
          {/* Full-screen output area */}
          <OutputArea
            status={state.status}
            currentBatch={state.currentBatch}
            history={state.history}
            isMobile={true}
          />

          {/* Floating Create Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#195eff] text-white shadow-lg flex items-center justify-center"
            style={{ boxShadow: "0 4px 20px rgba(25, 94, 255, 0.4)" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Bottom Drawer with Sidebar */}
          <MobileDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onOpen={() => setDrawerOpen(true)}
          >
            <Sidebar {...sidebarProps} isMobile={true} />
          </MobileDrawer>
        </>
      )}
    </div>
  );
}
