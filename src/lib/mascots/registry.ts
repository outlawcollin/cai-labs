// Mascot Registry - Central definition for all mascot variants

export interface MascotEyes {
  neutral: string;
  blink: string;
  wide: string;
  happy?: string;
  dizzy?: string;
  sleepy?: string;
}

export interface MascotEffects {
  hearts?: string;
  stars?: string;
}

export interface MascotConfig {
  eyeOffsetMax: number;      // Max pixels eyes can move (3-6 typical)
  eyeYOffset?: number;       // Vertical adjustment if eyes sit high/low
  blinkDuration: number;     // How long blink lasts in ms (80-120)
  scale?: number;            // Size multiplier if needed
}

export interface MascotAssets {
  id: string;
  name: string;
  base: string;
  eyes: MascotEyes;
  effects?: MascotEffects;
  config: MascotConfig;
  // Fallback to single image for non-expressive mascots
  fallbackImage?: string;
}

// Registry of all available mascots
const mascotRegistry: Record<string, MascotAssets> = {
  'mascot-02': {
    id: 'mascot-02',
    name: 'Blue Blob',
    base: '/mascots/mascot-02/Mascot_02_Base.png',
    eyes: {
      neutral: '/mascots/mascot-02/Mascot_02_Eyes_Neutral.png',
      blink: '/mascots/mascot-02/Mascot_02_Eyes_Blink.png',
      wide: '/mascots/mascot-02/Mascot_02_Eyes_Wide.png',
    },
    config: {
      eyeOffsetMax: 5,
      blinkDuration: 100,
    },
  },
  'mascot-04': {
    id: 'mascot-04',
    name: 'Green Friend',
    base: '/mascots/mascot-04/Mascot_04_Base.png',
    eyes: {
      neutral: '/mascots/mascot-04/Mascot_04_Eyes_Neutral.png',
      blink: '/mascots/mascot-04/Mascot_04_Eyes_Blink.png',
      wide: '/mascots/mascot-04/Mascot_04_Eyes_Wide.png',
    },
    config: {
      eyeOffsetMax: 5,
      blinkDuration: 100,
    },
  },
  'mascot-11': {
    id: 'mascot-11',
    name: 'Purple Pal',
    base: '/mascots/mascot-11/Mascot_11_Base.png',
    eyes: {
      neutral: '/mascots/mascot-11/Mascot_11_Eyes_Neutral.png',
      blink: '/mascots/mascot-11/Mascot_11_Eyes_Blink.png',
      wide: '/mascots/mascot-11/Mascot_11_Eyes_Wide.png',
    },
    config: {
      eyeOffsetMax: 5,
      blinkDuration: 100,
    },
  },
  'mascot-21': {
    id: 'mascot-21',
    name: 'Yellow Bird',
    base: '/mascots/mascot-21/Mascot_21_Base.png',
    eyes: {
      neutral: '/mascots/mascot-21/Mascot_21_Eyes_Neutral.png',
      blink: '/mascots/mascot-21/Mascot_21_Eyes_Blink.png',
      wide: '/mascots/mascot-21/Mascot_21_Eyes_Wide.png',
    },
    config: {
      eyeOffsetMax: 5,
      blinkDuration: 100,
    },
  },
  'mascot-22': {
    id: 'mascot-22',
    name: 'Orange Buddy',
    base: '/mascots/mascot-22/Mascot_22_Base.png',
    eyes: {
      neutral: '/mascots/mascot-22/Mascot_22_Eyes_Neutral.png',
      blink: '/mascots/mascot-22/Mascot_22_Eyes_Blink.png',
      wide: '/mascots/mascot-22/Mascot_22_Eyes_Wide.png',
    },
    config: {
      eyeOffsetMax: 5,
      blinkDuration: 100,
    },
  },
};

// IDs of expressive mascots (those with layered assets)
const expressiveMascotIds = ['mascot-02', 'mascot-04', 'mascot-11', 'mascot-21', 'mascot-22'];

// All mascot IDs for random selection
const allMascotIds = ['mascot-02', 'mascot-04', 'mascot-11', 'mascot-21', 'mascot-22'];

// Track last spawned mascot to avoid consecutive duplicates
let lastSpawnedMascotId: string | null = null;

export function getMascot(id: string): MascotAssets | undefined {
  return mascotRegistry[id];
}

export function getRandomMascot(): MascotAssets {
  // Filter out the last spawned mascot to avoid consecutive duplicates
  const availableIds = lastSpawnedMascotId
    ? allMascotIds.filter(id => id !== lastSpawnedMascotId)
    : allMascotIds;

  const randomIndex = Math.floor(Math.random() * availableIds.length);
  const randomId = availableIds[randomIndex];

  // Track this as the last spawned
  lastSpawnedMascotId = randomId;

  return mascotRegistry[randomId];
}

export function getAllMascotIds(): string[] {
  return allMascotIds;
}

export function getExpressiveMascotIds(): string[] {
  return expressiveMascotIds;
}

export function isExpressiveMascot(id: string): boolean {
  return expressiveMascotIds.includes(id);
}

// Preload all mascot images for performance
export function preloadMascotAssets(): void {
  const allMascots = getAllMascotIds();
  allMascots.forEach(id => {
    const assets = getMascot(id);
    if (!assets) return;

    const imagesToLoad = [
      assets.base,
      ...Object.values(assets.eyes),
      ...(assets.effects ? Object.values(assets.effects) : []),
    ];

    // Remove duplicates (for legacy mascots)
    const uniqueImages = [...new Set(imagesToLoad)];

    uniqueImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  });
}
