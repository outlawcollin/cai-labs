"use client";

import { useState, useCallback } from "react";
import type {
  ImageMode,
  Persona,
  Character,
  OptionCategory,
  OptionItem,
  SelectedOptions,
  GenerationStatus,
  GenerationBatch,
  ImageStudioState,
} from "@/app/experiments/image-studio/types";

interface UseImageStudioReturn {
  // State
  state: ImageStudioState;

  // Mode actions
  setMode: (mode: ImageMode) => void;

  // Selection actions
  setPersona: (persona: Persona | null) => void;
  setCharacter: (character: Character | null) => void;
  setCharacter2: (character: Character | null) => void;

  // Options actions
  toggleDropdown: (category: OptionCategory) => void;
  selectOption: (option: OptionItem) => void;
  removeOption: (category: OptionCategory, optionId: string) => void;
  clearCategoryOptions: (category: OptionCategory) => void;

  // Generation actions
  startGeneration: () => void;
  cancelGeneration: () => void;
  completeGeneration: (batch: GenerationBatch) => void;

  // Derived state
  canGenerate: boolean;
  selectedOptionsCount: number;
}

const initialState: ImageStudioState = {
  mode: "self-portrait",
  persona: null,
  character: null,
  character2: null,
  selectedOptions: {},
  status: "idle",
  currentBatch: null,
  history: [],
  expandedDropdown: null,
};

export function useImageStudio(): UseImageStudioReturn {
  const [state, setState] = useState<ImageStudioState>(initialState);

  // Mode actions
  const setMode = useCallback((mode: ImageMode) => {
    setState((prev) => ({
      ...prev,
      mode,
      // Clear character2 if not duo mode
      character2: mode === "duo" ? prev.character2 : null,
      // Clear character if self-portrait
      character: mode === "self-portrait" ? null : prev.character,
      // Clear persona if solo or duo
      persona: mode === "solo" || mode === "duo" ? null : prev.persona,
    }));
  }, []);

  // Selection actions
  const setPersona = useCallback((persona: Persona | null) => {
    setState((prev) => ({ ...prev, persona }));
  }, []);

  const setCharacter = useCallback((character: Character | null) => {
    setState((prev) => ({ ...prev, character }));
  }, []);

  const setCharacter2 = useCallback((character: Character | null) => {
    setState((prev) => ({ ...prev, character2: character }));
  }, []);

  // Options actions
  const toggleDropdown = useCallback((category: OptionCategory) => {
    setState((prev) => ({
      ...prev,
      expandedDropdown: prev.expandedDropdown === category ? null : category,
    }));
  }, []);

  const selectOption = useCallback((option: OptionItem) => {
    setState((prev) => {
      const categoryOptions = prev.selectedOptions[option.category] || [];
      const exists = categoryOptions.some((o) => o.id === option.id);

      if (exists) {
        // Remove if already selected
        return {
          ...prev,
          selectedOptions: {
            ...prev.selectedOptions,
            [option.category]: categoryOptions.filter((o) => o.id !== option.id),
          },
        };
      } else {
        // Add to selection
        return {
          ...prev,
          selectedOptions: {
            ...prev.selectedOptions,
            [option.category]: [...categoryOptions, option],
          },
        };
      }
    });
  }, []);

  const removeOption = useCallback((category: OptionCategory, optionId: string) => {
    setState((prev) => ({
      ...prev,
      selectedOptions: {
        ...prev.selectedOptions,
        [category]: (prev.selectedOptions[category] || []).filter(
          (o) => o.id !== optionId
        ),
      },
    }));
  }, []);

  const clearCategoryOptions = useCallback((category: OptionCategory) => {
    setState((prev) => ({
      ...prev,
      selectedOptions: {
        ...prev.selectedOptions,
        [category]: [],
      },
    }));
  }, []);

  // Generation actions
  const startGeneration = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "generating",
    }));
  }, []);

  const cancelGeneration = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "idle",
    }));
  }, []);

  const completeGeneration = useCallback((batch: GenerationBatch) => {
    setState((prev) => ({
      ...prev,
      status: "complete",
      currentBatch: batch,
      history: [batch, ...prev.history],
    }));
  }, []);

  // Derived state
  const canGenerate = (() => {
    const { mode, persona, character, character2, status } = state;

    if (status === "generating") return false;

    switch (mode) {
      case "self-portrait":
        return persona !== null;
      case "solo":
        return character !== null;
      case "together":
        return persona !== null && character !== null;
      case "duo":
        return character !== null && character2 !== null;
      default:
        return false;
    }
  })();

  const selectedOptionsCount = Object.values(state.selectedOptions).reduce(
    (total, options) => total + (options?.length || 0),
    0
  );

  return {
    state,
    setMode,
    setPersona,
    setCharacter,
    setCharacter2,
    toggleDropdown,
    selectOption,
    removeOption,
    clearCategoryOptions,
    startGeneration,
    cancelGeneration,
    completeGeneration,
    canGenerate,
    selectedOptionsCount,
  };
}

export default useImageStudio;
