// Image Studio Types

// Mode selection
export type ImageMode = "self-portrait" | "solo" | "together" | "duo";

// Persona (user's avatar)
export interface Persona {
  id: string;
  name: string;
  avatar: string;
}

// Character (AI character)
export interface Character {
  id: string;
  name: string;
  avatar: string;
  isRecent?: boolean;
  isOwned?: boolean;
}

// Option categories for the dropdowns
export type OptionCategory =
  | "style"
  | "shot"
  | "scene"
  | "outfit"
  | "pose"
  | "gesture"
  | "expression"
  | "effects";

// Individual option item
export interface OptionItem {
  id: string;
  label: string;
  thumbnail: string;
  category: OptionCategory;
}

// Selected options per category
export type SelectedOptions = {
  [K in OptionCategory]?: OptionItem[];
};

// Generation request
export interface GenerationRequest {
  mode: ImageMode;
  persona?: Persona;
  character?: Character;
  character2?: Character; // For duo mode
  options: SelectedOptions;
}

// Generated image
export interface GeneratedImage {
  id: string;
  url: string;
  thumbnail: string;
}

// A batch of generated images
export interface GenerationBatch {
  id: string;
  timestamp: Date;
  request: GenerationRequest;
  images: GeneratedImage[];
}

// Generation status
export type GenerationStatus = "idle" | "generating" | "complete" | "error";

// Main studio state
export interface ImageStudioState {
  // Mode
  mode: ImageMode;

  // Selections based on mode
  persona: Persona | null;
  character: Character | null;
  character2: Character | null; // For duo mode

  // Options
  selectedOptions: SelectedOptions;

  // Generation
  status: GenerationStatus;
  currentBatch: GenerationBatch | null;
  pendingRequest: GenerationRequest | null;
  history: GenerationBatch[];

  // UI state
  expandedDropdown: OptionCategory | null;
}
