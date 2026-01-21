import { useRef, useEffect, useCallback, useState } from "react";

interface HitMapData {
  width: number;
  height: number;
  gridSize: number;
  gridWidth: number;
  gridHeight: number;
  grid: Uint8Array | null;
}

// Cache for loaded hit maps
const hitMapCache = new Map<string, HitMapData>();
const loadingPromises = new Map<string, Promise<HitMapData>>();

// Alpha threshold for considering a pixel "hittable"
const ALPHA_THRESHOLD = 10;

// Dilation radius - expands hit areas to reduce edge glitches
// This fills in small gaps and softens edges
const DILATION_RADIUS = 2;

/**
 * Apply morphological dilation to expand hit areas
 * This fills in small gaps and makes edges less glitchy
 */
function dilateGrid(
  grid: Uint8Array<ArrayBuffer>,
  gridWidth: number,
  gridHeight: number,
  radius: number
): Uint8Array<ArrayBuffer> {
  const dilated = new Uint8Array(grid.length) as Uint8Array<ArrayBuffer>;

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      // Check if any cell within radius is hittable
      let isHit = false;

      for (let dy = -radius; dy <= radius && !isHit; dy++) {
        for (let dx = -radius; dx <= radius && !isHit; dx++) {
          const nx = gx + dx;
          const ny = gy + dy;

          // Skip out of bounds
          if (nx < 0 || nx >= gridWidth || ny < 0 || ny >= gridHeight) continue;

          // Use circular dilation (check distance)
          if (dx * dx + dy * dy <= radius * radius) {
            if (grid[ny * gridWidth + nx] === 1) {
              isHit = true;
            }
          }
        }
      }

      dilated[gy * gridWidth + gx] = isHit ? 1 : 0;
    }
  }

  return dilated;
}

/**
 * Load an image and generate its hit map using canvas
 */
async function generateHitMap(imageSrc: string): Promise<HitMapData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const { width, height } = img;
      const gridSize = 4; // 4x4 pixel grid per hit map cell
      const gridWidth = Math.ceil(width / gridSize);
      const gridHeight = Math.ceil(height / gridSize);

      // Create offscreen canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      // Generate downsampled grid (1 byte per cell, 1 = hittable, 0 = transparent)
      let grid = new Uint8Array(gridWidth * gridHeight);

      for (let gy = 0; gy < gridHeight; gy++) {
        for (let gx = 0; gx < gridWidth; gx++) {
          // Check if any pixel in this grid cell is opaque enough
          let hasOpaquePixel = false;

          for (let py = 0; py < gridSize && !hasOpaquePixel; py++) {
            for (let px = 0; px < gridSize && !hasOpaquePixel; px++) {
              const x = gx * gridSize + px;
              const y = gy * gridSize + py;

              if (x < width && y < height) {
                const idx = (y * width + x) * 4;
                const alpha = pixels[idx + 3];

                if (alpha > ALPHA_THRESHOLD) {
                  hasOpaquePixel = true;
                }
              }
            }
          }

          grid[gy * gridWidth + gx] = hasOpaquePixel ? 1 : 0;
        }
      }

      // Apply dilation to expand hit areas and fill small gaps
      if (DILATION_RADIUS > 0) {
        grid = dilateGrid(grid, gridWidth, gridHeight, DILATION_RADIUS);
      }

      resolve({
        width,
        height,
        gridSize,
        gridWidth,
        gridHeight,
        grid,
      });
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageSrc}`));
    };

    img.src = imageSrc;
  });
}

/**
 * Load or retrieve cached hit map for an image
 */
async function loadHitMap(imageSrc: string): Promise<HitMapData> {
  // Check cache first
  const cached = hitMapCache.get(imageSrc);
  if (cached) {
    return cached;
  }

  // Check if already loading
  const existing = loadingPromises.get(imageSrc);
  if (existing) {
    return existing;
  }

  // Start loading
  const promise = generateHitMap(imageSrc);
  loadingPromises.set(imageSrc, promise);

  try {
    const hitMap = await promise;
    hitMapCache.set(imageSrc, hitMap);
    loadingPromises.delete(imageSrc);
    return hitMap;
  } catch (error) {
    loadingPromises.delete(imageSrc);
    // Return a fallback that treats everything as hittable
    return {
      width: 100,
      height: 100,
      gridSize: 4,
      gridWidth: 25,
      gridHeight: 25,
      grid: null, // null means "all hittable"
    };
  }
}

interface UseHitMapOptions {
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  enabled?: boolean;
}

interface HitTestResult {
  isHit: boolean;
  isLoaded: boolean;
}

/**
 * Hook for pixel-perfect hit detection on transparent PNGs
 *
 * Returns a hitTest function that checks if a point (relative to the image element)
 * is over an opaque pixel.
 */
export function useHitMap({
  imageSrc,
  imageWidth,
  imageHeight,
  enabled = true,
}: UseHitMapOptions) {
  const hitMapRef = useRef<HitMapData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load hit map when image source changes
  useEffect(() => {
    if (!enabled) {
      setIsLoaded(true);
      return;
    }

    let cancelled = false;

    loadHitMap(imageSrc).then((hitMap) => {
      if (!cancelled) {
        hitMapRef.current = hitMap;
        setIsLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [imageSrc, enabled]);

  /**
   * Test if a point (in element coordinates) hits an opaque pixel
   */
  const hitTest = useCallback(
    (elementX: number, elementY: number): HitTestResult => {
      if (!enabled) {
        return { isHit: true, isLoaded: true };
      }

      const hitMap = hitMapRef.current;

      if (!hitMap) {
        // Not loaded yet, assume hit
        return { isHit: true, isLoaded: false };
      }

      if (!hitMap.grid) {
        // Fallback mode, treat all as hittable
        return { isHit: true, isLoaded: true };
      }

      // Convert element coordinates to image coordinates
      // Account for any scaling between displayed size and actual image size
      const scaleX = hitMap.width / imageWidth;
      const scaleY = hitMap.height / imageHeight;

      const imageX = Math.floor(elementX * scaleX);
      const imageY = Math.floor(elementY * scaleY);

      // Convert to grid coordinates
      const gridX = Math.floor(imageX / hitMap.gridSize);
      const gridY = Math.floor(imageY / hitMap.gridSize);

      // Bounds check
      if (gridX < 0 || gridX >= hitMap.gridWidth || gridY < 0 || gridY >= hitMap.gridHeight) {
        return { isHit: false, isLoaded: true };
      }

      // Check grid cell
      const gridIndex = gridY * hitMap.gridWidth + gridX;
      const isHit = hitMap.grid[gridIndex] === 1;

      return { isHit, isLoaded: true };
    },
    [imageWidth, imageHeight, enabled]
  );

  return {
    hitTest,
    isLoaded,
  };
}

export default useHitMap;
