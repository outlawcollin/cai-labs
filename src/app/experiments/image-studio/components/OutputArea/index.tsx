"use client";

import type { GenerationStatus, GenerationBatch } from "../../types";
import EmptyState from "./EmptyState";
import { ImageCard } from "../shared/ImageCard";
import GenerationBatchComponent from "./GenerationBatch";

interface OutputAreaProps {
  status: GenerationStatus;
  currentBatch: GenerationBatch | null;
  history: GenerationBatch[];
  onReshoot?: (batch: GenerationBatch) => void;
  onUseDetails?: (batch: GenerationBatch) => void;
}

export default function OutputArea({
  status,
  currentBatch,
  history,
  onReshoot,
  onUseDetails,
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
        <div className="h-full flex flex-col items-center justify-center">
          {/* Loading placeholder - 4 loading cards */}
          <div className="flex gap-3 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <ImageCard key={i} isLoading />
            ))}
          </div>
          <p style={{ color: "var(--color-on-surface-variant)" }}>
            Generating your shots...
          </p>
        </div>
      )}

      {showResults && (
        <div className="p-8">
          {/* Current batch */}
          {currentBatch && (
            <div className="mb-8">
              <GenerationBatchComponent
                batch={currentBatch}
                onReshoot={() => onReshoot?.(currentBatch)}
                onUseDetails={() => onUseDetails?.(currentBatch)}
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
