"use client";

import type {
  GenerationStatus,
  GenerationBatch,
  GenerationRequest,
  SelectedOptions,
} from "../../types";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import GenerationBatchComponent from "./GenerationBatch";

interface OutputAreaProps {
  status: GenerationStatus;
  currentBatch: GenerationBatch | null;
  pendingRequest: GenerationRequest | null;
  history: GenerationBatch[];
  selectedOptions: SelectedOptions;
  onCancel: () => void;
  onReshoot?: (batch: GenerationBatch) => void;
  onUseDetails?: (batch: GenerationBatch) => void;
  isMobile?: boolean;
}

export default function OutputArea({
  status,
  currentBatch,
  pendingRequest,
  history,
  onCancel,
  onReshoot,
  onUseDetails,
  isMobile = false,
}: OutputAreaProps) {
  const isGenerating = status === "generating";
  const showEmptyState = status === "idle" && history.length === 0 && !currentBatch;
  const hasContent = currentBatch || history.length > 0 || isGenerating;

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto scrollbar-hide"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {showEmptyState && <EmptyState />}

      {hasContent && (
        <div className={`flex flex-col ${isMobile ? "pb-24" : ""}`}>
          {/* Loading state at the top when generating */}
          {isGenerating && pendingRequest && (
            <LoadingState
              mode={pendingRequest.mode}
              persona={pendingRequest.persona ?? null}
              character={pendingRequest.character ?? null}
              character2={pendingRequest.character2 ?? null}
              selectedOptions={pendingRequest.options}
              onCancel={onCancel}
              isMobile={isMobile}
            />
          )}

          {/* Current batch (most recent completed generation) */}
          {currentBatch && (
            <GenerationBatchComponent
              batch={currentBatch}
              onReshoot={() => onReshoot?.(currentBatch)}
              onUseDetails={() => onUseDetails?.(currentBatch)}
              isMobile={isMobile}
            />
          )}

          {/* Previous generations */}
          {history
            .filter((batch) => !currentBatch || batch.id !== currentBatch.id)
            .map((batch) => (
              <GenerationBatchComponent
                key={batch.id}
                batch={batch}
                onReshoot={() => onReshoot?.(batch)}
                onUseDetails={() => onUseDetails?.(batch)}
                isMobile={isMobile}
              />
            ))}
        </div>
      )}
    </div>
  );
}
