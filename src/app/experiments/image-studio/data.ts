// Mock data for Image Studio

import type { Persona, Character, OptionCategory, OptionItem } from "./types";

export const mockPersonas: Persona[] = [
  { id: "p1", name: "Toru", avatar: "/personas/toru.png" },
  { id: "p2", name: "Pam", avatar: "/personas/pam.png" },
  { id: "p3", name: "Daera", avatar: "/personas/daera.png" },
];

export const mockCharacters: Character[] = [
  { id: "c1", name: "Mimi", avatar: "/characters/mimi.png", isRecent: true },
  { id: "c2", name: "Stormy Sky", avatar: "/characters/stormy-sky.png", isRecent: true },
  { id: "c3", name: "Pip", avatar: "/characters/pip.png", isRecent: true },
  { id: "c4", name: "Lira", avatar: "/characters/lira.png", isOwned: true },
  { id: "c5", name: "Jordi", avatar: "/characters/jordi.png", isOwned: true },
  { id: "c6", name: "CEO", avatar: "/characters/ceo.png" },
];

// Category metadata (icons, colors for pills)
export const categoryMeta: Record<OptionCategory, { icon: string; pillColor: string }> = {
  style: { icon: "palette", pillColor: "#195eff" },
  shot: { icon: "camera", pillColor: "#f62350" },
  scene: { icon: "mountain", pillColor: "#1ebe53" },
  outfit: { icon: "shirt", pillColor: "#f28500" },
  pose: { icon: "person", pillColor: "#ff4dc9" },
  gesture: { icon: "hand", pillColor: "#00d9d9" },
  expression: { icon: "smile", pillColor: "#b460eb" },
  effects: { icon: "sparkles", pillColor: "#ff4dc9" },
};

// Mock options for each category
export const mockOptions: Record<OptionCategory, OptionItem[]> = {
  style: [
    { id: "st1", label: "Match avatar", thumbnail: "/options/style/match-avatar.png", category: "style" },
    { id: "st2", label: "Anime", thumbnail: "/options/style/anime.png", category: "style" },
    { id: "st3", label: "Realistic", thumbnail: "/options/style/realistic.png", category: "style" },
    { id: "st4", label: "Cartoon", thumbnail: "/options/style/cartoon.png", category: "style" },
    { id: "st5", label: "Watercolor", thumbnail: "/options/style/watercolor.png", category: "style" },
    { id: "st6", label: "Oil painting", thumbnail: "/options/style/oil-painting.png", category: "style" },
  ],
  shot: [
    { id: "sh1", label: "Close Up", thumbnail: "/options/shot/close-up.png", category: "shot" },
    { id: "sh2", label: "Medium", thumbnail: "/options/shot/medium.png", category: "shot" },
    { id: "sh3", label: "Wide", thumbnail: "/options/shot/wide.png", category: "shot" },
    { id: "sh4", label: "Full Body", thumbnail: "/options/shot/full-body.png", category: "shot" },
    { id: "sh5", label: "Portrait", thumbnail: "/options/shot/portrait.png", category: "shot" },
  ],
  scene: [
    { id: "sc1", label: "Indoors", thumbnail: "/options/scene/indoors.png", category: "scene" },
    { id: "sc2", label: "Outdoors", thumbnail: "/options/scene/outdoors.png", category: "scene" },
    { id: "sc3", label: "Fantasy", thumbnail: "/options/scene/fantasy.png", category: "scene" },
    { id: "sc4", label: "Urban", thumbnail: "/options/scene/urban.png", category: "scene" },
    { id: "sc5", label: "Nature", thumbnail: "/options/scene/nature.png", category: "scene" },
  ],
  outfit: [
    { id: "ou1", label: "Casual", thumbnail: "/options/outfit/casual.png", category: "outfit" },
    { id: "ou2", label: "Formal", thumbnail: "/options/outfit/formal.png", category: "outfit" },
    { id: "ou3", label: "Fantasy", thumbnail: "/options/outfit/fantasy.png", category: "outfit" },
    { id: "ou4", label: "Sporty", thumbnail: "/options/outfit/sporty.png", category: "outfit" },
  ],
  pose: [
    { id: "po1", label: "Standing", thumbnail: "/options/pose/standing.png", category: "pose" },
    { id: "po2", label: "Sitting", thumbnail: "/options/pose/sitting.png", category: "pose" },
    { id: "po3", label: "Action", thumbnail: "/options/pose/action.png", category: "pose" },
    { id: "po4", label: "Fighting Stance", thumbnail: "/options/pose/fighting-stance.png", category: "pose" },
  ],
  gesture: [
    { id: "ge1", label: "Wave", thumbnail: "/options/gesture/wave.png", category: "gesture" },
    { id: "ge2", label: "Point", thumbnail: "/options/gesture/point.png", category: "gesture" },
    { id: "ge3", label: "Peace", thumbnail: "/options/gesture/peace.png", category: "gesture" },
    { id: "ge4", label: "Thumbs up", thumbnail: "/options/gesture/thumbs-up.png", category: "gesture" },
  ],
  expression: [
    { id: "ex1", label: "Happy", thumbnail: "/options/expression/happy.png", category: "expression" },
    { id: "ex2", label: "Sad", thumbnail: "/options/expression/sad.png", category: "expression" },
    { id: "ex3", label: "Angry", thumbnail: "/options/expression/angry.png", category: "expression" },
    { id: "ex4", label: "Surprised", thumbnail: "/options/expression/surprised.png", category: "expression" },
    { id: "ex5", label: "Neutral", thumbnail: "/options/expression/neutral.png", category: "expression" },
  ],
  effects: [
    { id: "ef1", label: "None", thumbnail: "/options/effects/none.png", category: "effects" },
    { id: "ef2", label: "Glow", thumbnail: "/options/effects/glow.png", category: "effects" },
    { id: "ef3", label: "Sparkles", thumbnail: "/options/effects/sparkles.png", category: "effects" },
    { id: "ef4", label: "Dramatic lighting", thumbnail: "/options/effects/dramatic.png", category: "effects" },
  ],
};

// Placeholder images for generation results
export const placeholderImages = [
  "/generated/placeholder-1.png",
  "/generated/placeholder-2.png",
  "/generated/placeholder-3.png",
  "/generated/placeholder-4.png",
];
