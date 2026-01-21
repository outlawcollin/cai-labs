export interface ImageConfig {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
}

export interface LayerConfig {
  id: string;
  speed: number;
  zIndex: number;
  images: ImageConfig[];
}

// Container dimensions (from Figma)
export const CONTAINER_WIDTH = 1920;
export const CONTAINER_HEIGHT = 1080;

// Layer configurations with positions from Figma
export const layers: LayerConfig[] = [
  {
    id: "background",
    speed: 0.01,
    zIndex: 0,
    images: [
      { src: "/images/hero/hero-bg.png", x: -60, y: -60, width: 2040, height: 1200 },
    ],
  },
  {
    id: "L5",
    speed: 0.02,
    zIndex: 1,
    images: [
      { src: "/images/hero/img-13.png", x: 1043, y: 105, width: 374, height: 210 },
    ],
  },
  {
    id: "L4",
    speed: 0.04,
    zIndex: 2,
    images: [
      { src: "/images/hero/img-10.png", x: 1153, y: 706, width: 286, height: 286 },
      { src: "/images/hero/img-11.png", x: 388, y: -16, width: 393, height: 297 },
      { src: "/images/hero/img-12.png", x: 1296, y: 76, width: 276, height: 351 },
    ],
  },
  {
    id: "L3",
    speed: 0.06,
    zIndex: 3,
    images: [
      { src: "/images/hero/img-7.png", x: 1665, y: -39, width: 253, height: 344 },
      { src: "/images/hero/img-8.png", x: 486, y: 726, width: 321, height: 409 },
      { src: "/images/hero/img-9.png", x: 219, y: 154, width: 338, height: 508 },
    ],
  },
  {
    id: "L2",
    speed: 0.1,
    zIndex: 4,
    images: [
      { src: "/images/hero/img-4.png", x: 931, y: 787, width: 306, height: 255 },
      { src: "/images/hero/img-5.png", x: -120, y: 80, width: 421, height: 407 },
      { src: "/images/hero/img-6.png", x: 1323, y: 205, width: 559, height: 839 },
    ],
  },
  {
    id: "L1",
    speed: 0.15,
    zIndex: 5,
    images: [
      { src: "/images/hero/img-1.png", x: -269, y: 254, width: 1010, height: 1516 },
      { src: "/images/hero/img-2.png", x: 1240, y: 408, width: 799, height: 1198 },
      { src: "/images/hero/img-3.png", x: 834, y: -24, width: 329, height: 329 },
    ],
  },
];
