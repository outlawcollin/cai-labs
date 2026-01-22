export type ExperimentType = 'podcasts' | 'comics' | 'streams' | 'image-studio' | 'books';

export interface Story {
  id: string;
  title: string;
  experiment: ExperimentType;
  author: string;
  imageSrc: string;
  videoUrl?: string;
  featured: boolean;
}

// Experiment display names for tags
export const experimentNames: Record<ExperimentType, string> = {
  'podcasts': 'Podcasts',
  'comics': 'Comics',
  'streams': 'Streams',
  'image-studio': 'Image Studio',
  'books': 'Books',
};

// Color mapping using darker variants from design system
export const experimentColors: Record<ExperimentType, { bg: string; text: string }> = {
  'podcasts': {
    bg: 'var(--color-hyperlink-magenta)',
    text: 'var(--color-brand-pure-white)'
  },
  'comics': {
    bg: 'var(--color-midnight-forest)',
    text: 'var(--color-brand-pure-white)'
  },
  'streams': {
    bg: 'var(--color-toasty-amber)',
    text: 'var(--color-brand-pure-white)'
  },
  'image-studio': {
    bg: 'var(--color-alt-violet)',
    text: 'var(--color-brand-pure-white)'
  },
  'books': {
    bg: 'var(--color-default-blue)',
    text: 'var(--color-brand-pure-white)'
  },
};

export const stories: Story[] = [
  // Featured stories (shown on homepage)
  {
    id: 'story-1',
    title: 'How I built a podcast about ancient Rome with AI hosts',
    experiment: 'podcasts',
    author: 'Sarah Chen',
    imageSrc: '/stories/story-01.png',
    featured: true,
  },
  {
    id: 'story-2',
    title: 'Turning my novel draft into a visual comic series',
    experiment: 'comics',
    author: 'Marcus Webb',
    imageSrc: '/stories/story-02.png',
    featured: true,
  },
  {
    id: 'story-3',
    title: 'Creating short films from my travel journal',
    experiment: 'streams',
    author: 'Aisha Patel',
    imageSrc: '/stories/story-03.png',
    featured: true,
  },
  {
    id: 'story-4',
    title: 'Generating concept art for my fantasy world',
    experiment: 'image-studio',
    author: 'Jordan Lee',
    imageSrc: '/stories/story-04.png',
    featured: true,
  },
  {
    id: 'story-5',
    title: 'Playing through Pride and Prejudice as Mr. Darcy',
    experiment: 'books',
    author: 'Emma Foster',
    imageSrc: '/stories/story-05.png',
    featured: true,
  },
  // Non-featured stories (for future stories page)
  {
    id: 'story-6',
    title: 'Building an educational podcast for my classroom',
    experiment: 'podcasts',
    author: 'David Kim',
    imageSrc: '/stories/story-06.png',
    featured: false,
  },
  {
    id: 'story-7',
    title: 'Making comics with my kids using our family stories',
    experiment: 'comics',
    author: 'Lisa Park',
    imageSrc: '/stories/story-01.png',
    featured: false,
  },
  {
    id: 'story-8',
    title: 'Visualizing my poetry as short animated clips',
    experiment: 'streams',
    author: 'Ray Santos',
    imageSrc: '/stories/story-02.png',
    featured: false,
  },
  {
    id: 'story-9',
    title: 'Creating album art for my indie band',
    experiment: 'image-studio',
    author: 'Nina Volkov',
    imageSrc: '/stories/story-03.png',
    featured: false,
  },
  {
    id: 'story-10',
    title: 'Exploring alternate endings in classic novels',
    experiment: 'books',
    author: 'Tom Harris',
    imageSrc: '/stories/story-04.png',
    featured: false,
  },
];

// Helper to get featured stories
export const getFeaturedStories = () => stories.filter(s => s.featured);
