"use client";

import type {
  GenerationStatus,
  GenerationBatch,
  ImageMode,
  Persona,
  Character,
  SelectedOptions,
} from "../../types";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import GenerationBatchComponent from "./GenerationBatch";

interface OutputAreaProps {
  status: GenerationStatus;
  currentBatch: GenerationBatch | null;
  history: GenerationBatch[];
  // Generation context for loading state
  mode: ImageMode;
  persona: Persona | null;
  character: Character | null;
  character2: Character | null;
  selectedOptions: SelectedOptions;
  onCancel: () => void;
  onReshoot?: (batch: GenerationBatch) => void;
  onUseDetails?: (batch: GenerationBatch) => void;
  isMobile?: boolean;
}

export default function OutputArea({
  status,
  currentBatch,
  history,
  mode,
  persona,
  character,
  character2,
  selectedOptions,
  onCancel,
  onReshoot,
  onUseDetails,
  isMobile = false,
}: OutputAreaProps) {
  // Show empty state when idle and no history
  const showEmptyState = status === "idle" && history.length === 0;

  // Show loading state when generating
  const showLoadingState = status === "generating";

  // Show results when we have a current batch or history
  const showResults = !showEmptyState && !showLoadingState;

  return (
    <div
      className="flex-1 h-[calc(100vh-54px)] overflow-y-auto"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {showEmptyState && <EmptyState />}

      {showLoadingState && (
        <LoadingState
          mode={mode}
          persona={persona}
          character={character}
          character2={character2}
          selectedOptions={selectedOptions}
          onCancel={onCancel}
          isMobile={isMobile}
        />
      )}

      {showResults && (
        <div className={isMobile ? "p-4" : "p-8"}>
          {/* Current batch */}
          {currentBatch && (
            <div className="mb-8">
              <GenerationBatchComponent
                batch={currentBatch}
                onReshoot={() => onReshoot?.(currentBatch)}
                onUseDetails={() => onUseDetails?.(currentBatch)}
                isMobile={isMobile}
              />
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div>
              {!currentBatch && (
                <h2
                  className="text-lg font-medium mb-4"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  History
                </h2>
              )}
              {history.map((batch, index) => (
                <div key={batch.id} className="mb-8">
                  {/* Skip the first one if it's the current batch */}
                  {(currentBatch && index === 0) ? null : (
                    <GenerationBatchComponent
                      batch={batch}
                      onReshoot={() => onReshoot?.(batch)}
                      onUseDetails={() => onUseDetails?.(batch)}
                      isMobile={isMobile}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
