"use client";

import { useState } from "react";
import type {
  ImageMode,
  Persona,
  Character,
  OptionCategory,
  OptionItem,
  SelectedOptions,
  GenerationStatus,
} from "../../types";
import { mockPersonas, mockCharacters } from "../../data";
import ModeSelector from "./ModeSelector";
import PersonaPicker from "./PersonaPicker";
import CharacterPicker from "./CharacterPicker";
import SelectionModal from "../shared/SelectionModal";
import Tooltip from "../shared/Tooltip";
import OptionsDropdown from "./OptionsDropdown";
import CreateButton from "./CreateButton";

interface SidebarProps {
  // Mode
  mode: ImageMode;
  onModeChange: (mode: ImageMode) => void;

  // Selections
  persona: Persona | null;
  onPersonaChange: (persona: Persona | null) => void;
  character: Character | null;
  onCharacterChange: (character: Character | null) => void;
  character2: Character | null;
  onCharacter2Change: (character: Character | null) => void;

  // Options
  selectedOptions: SelectedOptions;
  expandedDropdown: OptionCategory | null;
  onToggleDropdown: (category: OptionCategory) => void;
  onSelectOption: (option: OptionItem) => void;
  onRemoveOption: (category: OptionCategory, optionId: string) => void;

  // Generation
  status: GenerationStatus;
  canGenerate: boolean;
  onGenerate: () => void;

  // Mobile
  isMobile?: boolean;
}

export default function Sidebar({
  mode,
  onModeChange,
  persona,
  onPersonaChange,
  character,
  onCharacterChange,
  character2,
  onCharacter2Change,
  selectedOptions,
  expandedDropdown,
  onToggleDropdown,
  onSelectOption,
  onRemoveOption,
  status,
  canGenerate,
  onGenerate,
  isMobile = false,
}: SidebarProps) {
  // Modal state
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const [character2ModalOpen, setCharacter2ModalOpen] = useState(false);

  // Determine which pickers to show based on mode
  const showPersonaPicker = mode === "self-portrait" || mode === "together";
  const showCharacterPicker = mode === "solo" || mode === "together" || mode === "duo";
  const showCharacter2Picker = mode === "duo";

  const isGenerating = status === "generating";

  return (
    <div
      className={`${isMobile ? "w-full h-full" : "w-[400px] rounded-4xl overflow-hidden"} flex flex-col shrink-0`}
      style={{
        backgroundColor: isMobile ? "transparent" : "var(--color-surface)",
        border: isMobile ? "none" : "1px solid var(--color-outline-variant)",
      }}
    >
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 scrollbar-hide" style={isMobile ? { overscrollBehaviorY: "contain" } : undefined}>
        {/* Title */}
        <div className="py-4">
          <h1
            className="text-[28px] font-medium leading-tight"
            style={{ color: "var(--color-on-brand)" }}
          >
            create your shot.
          </h1>
        </div>

        {/* Mode Selector Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-lg font-medium"
              style={{ color: "var(--color-on-surface)" }}
            >
              who&apos;s in the image
            </span>
            <Tooltip content="select who appears in your generated image" position="right" />
          </div>

          <ModeSelector mode={mode} onModeChange={onModeChange} isMobile={isMobile} />

          {/* Persona Picker */}
          {showPersonaPicker && (
            <div className="mt-4">
              <PersonaPicker
                selectedPersona={persona}
                onSelect={onPersonaChange}
                onBrowse={() => setPersonaModalOpen(true)}
                isMobile={isMobile}
              />
            </div>
          )}

          {/* Character Picker */}
          {showCharacterPicker && (
            <div className="mt-4">
              <CharacterPicker
                label={showCharacter2Picker ? "select character 1" : "select character"}
                selectedCharacter={character}
                onSelect={onCharacterChange}
                onBrowse={() => setCharacterModalOpen(true)}
                isMobile={isMobile}
              />
            </div>
          )}

          {/* Character 2 Picker (Duo mode) */}
          {showCharacter2Picker && (
            <div className="mt-4">
              <CharacterPicker
                label="select character 2"
                selectedCharacter={character2}
                onSelect={onCharacter2Change}
                onBrowse={() => setCharacter2ModalOpen(true)}
                isMobile={isMobile}
              />
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-medium"
              style={{ color: "var(--color-on-surface)" }}
            >
              details
            </span>
            <Tooltip content="customize style, pose, and other options" position="right" />
          </div>

          {/* Options dropdowns */}
          {(["style", "shot", "scene", "outfit", "pose", "gesture", "expression", "effects"] as OptionCategory[]).map(
            (category, index, arr) => (
              <OptionsDropdown
                key={category}
                category={category}
                isExpanded={expandedDropdown === category}
                selectedOptions={selectedOptions[category] || []}
                onToggle={() => onToggleDropdown(category)}
                onSelectOption={onSelectOption}
                onRemoveOption={(optionId) => onRemoveOption(category, optionId)}
                hideBorder={index === arr.length - 1}
              />
            )
          )}
        </div>
      </div>

      {/* Action Bar - Sticky at bottom */}
      <div
        className="p-4 shrink-0"
        style={{ borderTop: "1px solid var(--color-outline-variant)" }}
      >
        <CreateButton
          onClick={onGenerate}
          disabled={!canGenerate}
          isGenerating={isGenerating}
          creditCost={50}
        />
      </div>

      {/* Modals */}
      <SelectionModal
        isOpen={personaModalOpen}
        onClose={() => setPersonaModalOpen(false)}
        title="Select a persona"
        items={mockPersonas}
        selectedId={persona?.id}
        onSelect={(item) => {
          onPersonaChange(item as Persona);
          setPersonaModalOpen(false);
        }}
      />

      <SelectionModal
        isOpen={characterModalOpen}
        onClose={() => setCharacterModalOpen(false)}
        title="Select a character"
        items={mockCharacters}
        selectedId={character?.id}
        onSelect={(item) => {
          onCharacterChange(item as Character);
          setCharacterModalOpen(false);
        }}
        tabs={[
          { id: "recent", label: "Recent" },
          { id: "yours", label: "Your Characters" },
          { id: "discover", label: "Discover" },
        ]}
      />

      <SelectionModal
        isOpen={character2ModalOpen}
        onClose={() => setCharacter2ModalOpen(false)}
        title="Select a character"
        items={mockCharacters}
        selectedId={character2?.id}
        onSelect={(item) => {
          onCharacter2Change(item as Character);
          setCharacter2ModalOpen(false);
        }}
        tabs={[
          { id: "recent", label: "Recent" },
          { id: "yours", label: "Your Characters" },
          { id: "discover", label: "Discover" },
        ]}
      />
    </div>
  );
}
