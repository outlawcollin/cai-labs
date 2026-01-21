"use client";

import { useCallback, useRef, useState } from "react";

interface SpawnRequest {
  clickX: number;
  clickY: number;
  timestamp: number;
}

interface UseSpawnQueueConfig {
  onSpawnReady: (clickX: number, clickY: number) => void;
  cooldownMs?: number;
  maxQueueSize?: number;
}

export function useSpawnQueue({
  onSpawnReady,
  cooldownMs = 450,
  maxQueueSize = 5,
}: UseSpawnQueueConfig) {
  const [queueLength, setQueueLength] = useState(0);
  const queueRef = useRef<SpawnRequest[]>([]);
  const isProcessingRef = useRef(false);
  const lastSpawnTimeRef = useRef(0);
  const onSpawnReadyRef = useRef(onSpawnReady);
  onSpawnReadyRef.current = onSpawnReady;

  // Process the next item in the queue
  const processQueue = useCallback(() => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      return;
    }

    const now = Date.now();
    const timeSinceLastSpawn = now - lastSpawnTimeRef.current;

    if (timeSinceLastSpawn < cooldownMs) {
      // Schedule next attempt
      setTimeout(processQueue, cooldownMs - timeSinceLastSpawn);
      return;
    }

    isProcessingRef.current = true;
    const spawn = queueRef.current.shift();
    setQueueLength(queueRef.current.length);

    if (spawn) {
      lastSpawnTimeRef.current = now;
      onSpawnReadyRef.current(spawn.clickX, spawn.clickY);

      // Schedule processing of next item after cooldown
      setTimeout(() => {
        isProcessingRef.current = false;
        processQueue();
      }, cooldownMs);
    } else {
      isProcessingRef.current = false;
    }
  }, [cooldownMs]);

  // Queue a new spawn request
  const queueSpawn = useCallback((clickX: number, clickY: number) => {
    // Don't queue if already at max
    if (queueRef.current.length >= maxQueueSize) {
      return false;
    }

    queueRef.current.push({
      clickX,
      clickY,
      timestamp: Date.now(),
    });
    setQueueLength(queueRef.current.length);

    // Start processing if not already
    processQueue();

    return true;
  }, [maxQueueSize, processQueue]);

  // Check if a spawn can be triggered immediately (no cooldown)
  const canSpawnImmediately = useCallback(() => {
    const now = Date.now();
    return now - lastSpawnTimeRef.current >= cooldownMs && queueRef.current.length === 0;
  }, [cooldownMs]);

  // Clear the queue
  const clearQueue = useCallback(() => {
    queueRef.current = [];
    setQueueLength(0);
  }, []);

  return {
    queueSpawn,
    queueLength,
    canSpawnImmediately,
    clearQueue,
    isProcessing: isProcessingRef.current,
  };
}
