// Mock data for Image Studio

import type { Persona, Character, OptionCategory, OptionItem } from "./types";

export const mockPersonas: Persona[] = [
  { id: "p1", name: "Toru", avatar: "/image-studio/personas/toru.png" },
  { id: "p2", name: "Pam", avatar: "/image-studio/personas/pam.png" },
  { id: "p3", name: "Daera", avatar: "/image-studio/personas/daera.png" },
];

export const mockCharacters: Character[] = [
  { id: "c1", name: "Mimi", avatar: "/image-studio/characters/mimi.png", isRecent: true },
  { id: "c2", name: "Stormy Sky", avatar: "/image-studio/characters/stormy-sky.png", isRecent: true },
  { id: "c3", name: "Pip", avatar: "/image-studio/characters/pip.png", isRecent: true },
  { id: "c4", name: "Lira", avatar: "/image-studio/characters/lira.png", isOwned: true },
  { id: "c5", name: "Jordi", avatar: "/image-studio/characters/jordi.png", isOwned: true },
  { id: "c6", name: "CEO", avatar: "/image-studio/characters/ceo.png" },
];

// Category metadata (icons, colors for pills)
export const categoryMeta: Record<OptionCategory, { icon: string; pillColor: string }> = {
  style: { icon: "palette", pillColor: "#f28500" },   // toasty-amber
  shot: { icon: "camera", pillColor: "#00d973" },     // lucky-emerald
  scene: { icon: "mountain", pillColor: "#ffe600" },  // gold-rush
  outfit: { icon: "shirt", pillColor: "#ffadd2" },    // irl-rose
  pose: { icon: "person", pillColor: "#df91f2" },     // lowkey-lavender
  gesture: { icon: "hand", pillColor: "#7db4ff" },    // cloudy-blue
  expression: { icon: "smile", pillColor: "#d90000" },// cached-crimson
  effects: { icon: "sparkles", pillColor: "#ff4dc9" },// hot-pink
};

// Mock options for each category
export const mockOptions: Record<OptionCategory, OptionItem[]> = {
  style: [
    { id: "st1", label: "3D", thumbnail: "/image-studio/details/style/ghost_3d.jpg", category: "style" },
    { id: "st2", label: "Anime", thumbnail: "/image-studio/details/style/ghost_anime.jpg", category: "style" },
    { id: "st3", label: "Chibi", thumbnail: "/image-studio/details/style/ghost_chibi.jpg", category: "style" },
    { id: "st4", label: "Comic", thumbnail: "/image-studio/details/style/ghost_comic.jpg", category: "style" },
    { id: "st5", label: "Ghibli", thumbnail: "/image-studio/details/style/ghost_ghibli.jpg", category: "style" },
    { id: "st6", label: "Pixel", thumbnail: "/image-studio/details/style/ghost_pixel.jpg", category: "style" },
    { id: "st7", label: "Realistic", thumbnail: "/image-studio/details/style/ghost_realistic.jpg", category: "style" },
    { id: "st8", label: "Sketch", thumbnail: "/image-studio/details/style/ghost_sketch.jpg", category: "style" },
  ],
  shot: [
    { id: "sh1", label: "Close Up", thumbnail: "/image-studio/details/shot/close-up.png", category: "shot" },
    { id: "sh2", label: "Mid Shot", thumbnail: "/image-studio/details/shot/mid-shot.png", category: "shot" },
    { id: "sh3", label: "Full Body", thumbnail: "/image-studio/details/shot/full-body.png", category: "shot" },
    { id: "sh4", label: "Long Shot", thumbnail: "/image-studio/details/shot/long-shot.png", category: "shot" },
    { id: "sh5", label: "High Angle", thumbnail: "/image-studio/details/shot/high-angle.png", category: "shot" },
    { id: "sh6", label: "Side Profile", thumbnail: "/image-studio/details/shot/Side Profile 3.png", category: "shot" },
    { id: "sh7", label: "Over Shoulder", thumbnail: "/image-studio/details/shot/Over Shoulder 4.png", category: "shot" },
    { id: "sh8", label: "Low Angle", thumbnail: "/image-studio/details/shot/Low Angle.png", category: "shot" },
  ],
  scene: [
    { id: "sc1", label: "Arcade", thumbnail: "/image-studio/details/scene/Scene_Arcade 2.png", category: "scene" },
    { id: "sc2", label: "Beach", thumbnail: "/image-studio/details/scene/Scene_Beach 2.png", category: "scene" },
    { id: "sc3", label: "Park", thumbnail: "/image-studio/details/scene/Scene_Park 2.png", category: "scene" },
    { id: "sc4", label: "Ruins", thumbnail: "/image-studio/details/scene/Scene_Ruins 2.png", category: "scene" },
    { id: "sc5", label: "Spaceship", thumbnail: "/image-studio/details/scene/Scene_Spaceship 2.png", category: "scene" },
    { id: "sc6", label: "Casino", thumbnail: "/image-studio/details/scene/Scene_Casino 2.png", category: "scene" },
    { id: "sc7", label: "Stage", thumbnail: "/image-studio/details/scene/Scene_Stage 2.png", category: "scene" },
    { id: "sc8", label: "Bedroom", thumbnail: "/image-studio/details/scene/bedroom.png", category: "scene" },
    { id: "sc9", label: "Cafe", thumbnail: "/image-studio/details/scene/cafe.png", category: "scene" },
    { id: "sc10", label: "Gym", thumbnail: "/image-studio/details/scene/gym.png", category: "scene" },
    { id: "sc11", label: "Locker Room", thumbnail: "/image-studio/details/scene/locker room.png", category: "scene" },
  ],
  outfit: [
    { id: "ou1", label: "Casual", thumbnail: "/image-studio/details/outfit/casual.png", category: "outfit" },
    { id: "ou2", label: "Fantasy", thumbnail: "/image-studio/details/outfit/fantasy.png", category: "outfit" },
    { id: "ou3", label: "Pajamas", thumbnail: "/image-studio/details/outfit/pajamas.png", category: "outfit" },
    { id: "ou4", label: "Sportswear", thumbnail: "/image-studio/details/outfit/sportswear.png", category: "outfit" },
    { id: "ou5", label: "Streetwear", thumbnail: "/image-studio/details/outfit/streetwear.png", category: "outfit" },
    { id: "ou6", label: "Formal", thumbnail: "/image-studio/details/outfit/formal.png", category: "outfit" },
    { id: "ou7", label: "Formalwear", thumbnail: "/image-studio/details/outfit/formalwear.png", category: "outfit" },
    { id: "ou8", label: "School", thumbnail: "/image-studio/details/outfit/school.png", category: "outfit" },
    { id: "ou9", label: "Swimwear", thumbnail: "/image-studio/details/outfit/swimwear.png", category: "outfit" },
    { id: "ou10", label: "Traditional", thumbnail: "/image-studio/details/outfit/traditional.png", category: "outfit" },
  ],
  pose: [
    { id: "po1", label: "Standing", thumbnail: "/image-studio/details/pose/Standing 4.png", category: "pose" },
    { id: "po2", label: "Sitting", thumbnail: "/image-studio/details/pose/Sitting 4.png", category: "pose" },
    { id: "po3", label: "Walking", thumbnail: "/image-studio/details/pose/Walking 4.png", category: "pose" },
    { id: "po4", label: "Running", thumbnail: "/image-studio/details/pose/Running 4.png", category: "pose" },
    { id: "po5", label: "Jumping", thumbnail: "/image-studio/details/pose/Jumping 4.png", category: "pose" },
    { id: "po6", label: "Kneeling", thumbnail: "/image-studio/details/pose/Kneeling 4.png", category: "pose" },
    { id: "po7", label: "Squatting", thumbnail: "/image-studio/details/pose/Squatting 4.png", category: "pose" },
    { id: "po8", label: "Cross Legged", thumbnail: "/image-studio/details/pose/Cross Legged 4.png", category: "pose" },
    { id: "po9", label: "Lying Down", thumbnail: "/image-studio/details/pose/Lying Down 4.png", category: "pose" },
    { id: "po10", label: "Leaning", thumbnail: "/image-studio/details/pose/Leaning 4.png", category: "pose" },
    { id: "po11", label: "Back Turned", thumbnail: "/image-studio/details/pose/Back Turned 4.png", category: "pose" },
    { id: "po12", label: "Floating", thumbnail: "/image-studio/details/pose/Floating 4.png", category: "pose" },
    { id: "po13", label: "Fighting Stance", thumbnail: "/image-studio/details/pose/Fighting Stance 4.png", category: "pose" },
    { id: "po14", label: "Powering Up", thumbnail: "/image-studio/details/pose/Powering Up 4.png", category: "pose" },
  ],
  gesture: [
    { id: "ge1", label: "Peace", thumbnail: "/image-studio/details/gesture/peace.png", category: "gesture" },
    { id: "ge2", label: "Thumbs Up", thumbnail: "/image-studio/details/gesture/thumbs up.png", category: "gesture" },
    { id: "ge3", label: "Heart Hands", thumbnail: "/image-studio/details/gesture/heart hands.png", category: "gesture" },
    { id: "ge4", label: "Salute", thumbnail: "/image-studio/details/gesture/salute.png", category: "gesture" },
    { id: "ge5", label: "Finger Gun", thumbnail: "/image-studio/details/gesture/finger gun.png", category: "gesture" },
    { id: "ge6", label: "Pointing", thumbnail: "/image-studio/details/gesture/ponting.png", category: "gesture" },
    { id: "ge7", label: "Shushing", thumbnail: "/image-studio/details/gesture/shushing.png", category: "gesture" },
    { id: "ge8", label: "Thinking", thumbnail: "/image-studio/details/gesture/thinking.png", category: "gesture" },
    { id: "ge9", label: "Waving", thumbnail: "/image-studio/details/gesture/waving.png", category: "gesture" },
  ],
  expression: [
    { id: "ex1", label: "Angry", thumbnail: "/image-studio/details/expression/angry.png", category: "expression" },
    { id: "ex2", label: "Crying", thumbnail: "/image-studio/details/expression/crying.png", category: "expression" },
    { id: "ex3", label: "Excited", thumbnail: "/image-studio/details/expression/excited.png", category: "expression" },
    { id: "ex4", label: "Laughing", thumbnail: "/image-studio/details/expression/laughing.png", category: "expression" },
    { id: "ex5", label: "Nervous", thumbnail: "/image-studio/details/expression/nervous.png", category: "expression" },
    { id: "ex6", label: "Shy", thumbnail: "/image-studio/details/expression/shy.png", category: "expression" },
    { id: "ex7", label: "Smiling", thumbnail: "/image-studio/details/expression/smiling.png", category: "expression" },
    { id: "ex8", label: "Smirking", thumbnail: "/image-studio/details/expression/smirking.png", category: "expression" },
    { id: "ex9", label: "Surprised", thumbnail: "/image-studio/details/expression/surprised.png", category: "expression" },
    { id: "ex10", label: "Thinking", thumbnail: "/image-studio/details/expression/thinking.png", category: "expression" },
  ],
  effects: [
    { id: "ef1", label: "Rain", thumbnail: "/image-studio/details/effects/rain.png", category: "effects" },
    { id: "ef2", label: "Sparkles", thumbnail: "/image-studio/details/effects/sparkles.png", category: "effects" },
    { id: "ef3", label: "Hearts", thumbnail: "/image-studio/details/effects/hearts.png", category: "effects" },
    { id: "ef4", label: "Lightning", thumbnail: "/image-studio/details/effects/lightning.png", category: "effects" },
    { id: "ef5", label: "Smoke", thumbnail: "/image-studio/details/effects/smoke.png", category: "effects" },
  ],
};

// Placeholder images for generation results
export const placeholderImages = [
  "/image-studio/background/parkbench.png",
  "/image-studio/background/parkbench.png",
  "/image-studio/background/parkbench.png",
  "/image-studio/background/parkbench.png",
];

// Default selected options (empty - no defaults)
export const defaultOptions: Record<OptionCategory, OptionItem[]> = {
  style: [],
  shot: [],
  scene: [],
  outfit: [],
  pose: [],
  gesture: [],
  expression: [],
  effects: [],
};
