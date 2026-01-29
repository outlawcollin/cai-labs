"use client";

import { useState, useEffect } from "react";
import { useImageStudio } from "@/hooks/useImageStudio";
import Sidebar from "./components/Sidebar";
import OutputArea from "./components/OutputArea";
import ImageStudioNavBar from "./components/ImageStudioNavBar";
import ImageStudioFooter from "./components/ImageStudioFooter";
import MobileDrawer from "./components/MobileDrawer";
import { ThemeProvider } from "./context/ThemeContext";

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
    cancelGeneration,
    completeGeneration,
    canGenerate,
  } = useImageStudio();

  const handleGenerate = () => {
    if (!canGenerate) return;

    // Capture request before startGeneration resets state
    const request = {
      mode: state.mode,
      persona: state.persona ?? undefined,
      character: state.character ?? undefined,
      character2: state.character2 ?? undefined,
      options: state.selectedOptions,
    };

    startGeneration();

    // TODO: Replace with actual API call
    // Mock 6-second delay then complete with placeholder data
    const batchId = `batch-${Date.now()}`;
    setTimeout(() => {
      completeGeneration({
        id: batchId,
        timestamp: new Date(),
        request,
        images: [
          { id: `${batchId}-1`, url: "/image-studio/background/parkbench.png", thumbnail: "" },
          { id: `${batchId}-2`, url: "/image-studio/background/parkbench.png", thumbnail: "" },
          { id: `${batchId}-3`, url: "/image-studio/background/parkbench.png", thumbnail: "" },
          { id: `${batchId}-4`, url: "/image-studio/background/parkbench.png", thumbnail: "" },
        ],
      });
    }, 6000);
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
    <ThemeProvider>
      <div
        className="h-screen flex flex-col overflow-hidden"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Nav Bar */}
        <ImageStudioNavBar credits={500} isMobile={isMobile} />

        {/* Desktop Layout */}
        {!isMobile && (
          <div className="flex flex-1 px-4 gap-4 overflow-hidden">
            <Sidebar {...sidebarProps} />
            <OutputArea
              status={state.status}
              currentBatch={state.currentBatch}
              pendingRequest={state.pendingRequest}
              history={state.history}
              selectedOptions={state.selectedOptions}
              onCancel={cancelGeneration}
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
              pendingRequest={state.pendingRequest}
              history={state.history}
              selectedOptions={state.selectedOptions}
              onCancel={cancelGeneration}
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

        {/* Footer */}
        {!isMobile && <ImageStudioFooter />}
      </div>
    </ThemeProvider>
  );
}
