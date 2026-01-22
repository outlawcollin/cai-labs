import { ExperimentType, experimentColors, experimentNames } from './stories';

export type CardOrientation = 'landscape' | 'portrait';

export interface CommunityCreation {
  id: string;
  imageSrc: string;
  username: string;
  experiment: ExperimentType;
  orientation: CardOrientation;
  yOffset: number;  // Vertical offset as percentage (0-70, leaving room for card height)
}

// Re-export for convenience
export { experimentColors, experimentNames };

// Band configuration for parallax effect
export interface BandConfig {
  id: string;
  speedMultiplier: number;
  cardScale: number;
  zIndex: number;
  creationIds: string[];
}

// Mock data for 18 community images with varied orientations and experiments
// Each card has yOffset for scattered vertical positioning (0-70% range)
export const communityCreations: CommunityCreation[] = [
  // Band 1 images (fastest - foreground)
  {
    id: 'cc-01',
    imageSrc: '/community/community-01.png',
    username: 'creativemind',
    experiment: 'image-studio',
    orientation: 'landscape',
    yOffset: 40,
  },
  {
    id: 'cc-05',
    imageSrc: '/community/community-05.png',
    username: 'artexplorer',
    experiment: 'podcasts',
    orientation: 'portrait',
    yOffset: 5,
  },
  {
    id: 'cc-09',
    imageSrc: '/community/community-09.png',
    username: 'dreamweaver',
    experiment: 'comics',
    orientation: 'landscape',
    yOffset: 55,
  },
  {
    id: 'cc-13',
    imageSrc: '/community/community-13.png',
    username: 'pixelmaster',
    experiment: 'streams',
    orientation: 'portrait',
    yOffset: 20,
  },
  {
    id: 'cc-17',
    imageSrc: '/community/community-17.png',
    username: 'storysmith',
    experiment: 'books',
    orientation: 'landscape',
    yOffset: 70,
  },
  {
    id: 'cc-12',
    imageSrc: '/community/community-12.png',
    username: 'taleweaver',
    experiment: 'books',
    orientation: 'portrait',
    yOffset: 35,
  },

  // Band 2 images (medium)
  {
    id: 'cc-04',
    imageSrc: '/community/community-04.png',
    username: 'visioncraft',
    experiment: 'comics',
    orientation: 'portrait',
    yOffset: 60,
  },
  {
    id: 'cc-06',
    imageSrc: '/community/community-06.png',
    username: 'audiophile',
    experiment: 'podcasts',
    orientation: 'landscape',
    yOffset: 10,
  },
  {
    id: 'cc-10',
    imageSrc: '/community/community-10.png',
    username: 'inkmaster',
    experiment: 'image-studio',
    orientation: 'portrait',
    yOffset: 45,
  },
  {
    id: 'cc-14',
    imageSrc: '/community/community-14.png',
    username: 'wordsmith',
    experiment: 'books',
    orientation: 'landscape',
    yOffset: 25,
  },
  {
    id: 'cc-18',
    imageSrc: '/community/community-18.png',
    username: 'clipcreator',
    experiment: 'streams',
    orientation: 'portrait',
    yOffset: 65,
  },
  {
    id: 'cc-16',
    imageSrc: '/community/community-16.png',
    username: 'voiceover',
    experiment: 'podcasts',
    orientation: 'landscape',
    yOffset: 15,
  },

  // Band 3 images (slowest - background)
  {
    id: 'cc-07',
    imageSrc: '/community/community-07.png',
    username: 'novelwriter',
    experiment: 'books',
    orientation: 'landscape',
    yOffset: 50,
  },
  {
    id: 'cc-08',
    imageSrc: '/community/community-08.png',
    username: 'soundwave',
    experiment: 'podcasts',
    orientation: 'portrait',
    yOffset: 0,
  },
  {
    id: 'cc-11',
    imageSrc: '/community/community-11.png',
    username: 'framemaker',
    experiment: 'comics',
    orientation: 'landscape',
    yOffset: 70,
  },
  {
    id: 'cc-15',
    imageSrc: '/community/community-15.png',
    username: 'videostar',
    experiment: 'streams',
    orientation: 'portrait',
    yOffset: 30,
  },
  {
    id: 'cc-19',
    imageSrc: '/community/community-19.png',
    username: 'artflow',
    experiment: 'image-studio',
    orientation: 'landscape',
    yOffset: 55,
  },
  {
    id: 'cc-20',
    imageSrc: '/community/community-20.png',
    username: 'sketchpro',
    experiment: 'image-studio',
    orientation: 'portrait',
    yOffset: 10,
  },
];

// Band configurations - all bands occupy same space, stacked by zIndex
// Slowest (back) to fastest (front)
export const bandConfigs: BandConfig[] = [
  {
    id: 'band-3',
    speedMultiplier: 0.4,     // Slowest - back
    cardScale: 0.7,
    zIndex: 1,
    creationIds: ['cc-07', 'cc-08', 'cc-11', 'cc-15', 'cc-19', 'cc-20'],
  },
  {
    id: 'band-2',
    speedMultiplier: 0.7,
    cardScale: 1.0,
    zIndex: 2,
    creationIds: ['cc-04', 'cc-06', 'cc-10', 'cc-14', 'cc-18', 'cc-16'],
  },
  {
    id: 'band-1',
    speedMultiplier: 1.0,     // Fastest - front
    cardScale: 1.3,
    zIndex: 3,
    creationIds: ['cc-01', 'cc-05', 'cc-09', 'cc-13', 'cc-17', 'cc-12'],
  },
];

// Helper to get creations for a band
export const getCreationsForBand = (bandId: string): CommunityCreation[] => {
  const band = bandConfigs.find(b => b.id === bandId);
  if (!band) return [];
  return communityCreations.filter(c => band.creationIds.includes(c.id));
};
