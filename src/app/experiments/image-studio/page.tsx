"use client";

import { useImageStudio } from "@/hooks/useImageStudio";
import Sidebar from "./components/Sidebar";
import OutputArea from "./components/OutputArea";
import ImageStudioNavBar from "./components/ImageStudioNavBar";

export default function ImageStudioPage() {
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

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Nav Bar */}
      <ImageStudioNavBar credits={500} />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          mode={state.mode}
          onModeChange={setMode}
          persona={state.persona}
          onPersonaChange={setPersona}
          character={state.character}
          onCharacterChange={setCharacter}
          character2={state.character2}
          onCharacter2Change={setCharacter2}
          selectedOptions={state.selectedOptions}
          expandedDropdown={state.expandedDropdown}
          onToggleDropdown={toggleDropdown}
          onSelectOption={selectOption}
          onRemoveOption={removeOption}
          status={state.status}
          canGenerate={canGenerate}
          onGenerate={handleGenerate}
        />

        {/* Output Area */}
        <OutputArea
          status={state.status}
          currentBatch={state.currentBatch}
          history={state.history}
        />
      </div>
    </div>
  );
}
