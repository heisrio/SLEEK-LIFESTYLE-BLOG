import type { Category } from './types';

export const BRAND_NAME = 'KULTURE';

export const CATEGORIES: Category[] = [
  'Beauty',
  'Style',
  'Culture',
  'Music',
  'Wellness',
  'News',
];

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  Beauty: 'Rituals, skin, scent, and unapologetic glow.',
  Style: 'The silhouettes and references moving the room.',
  Culture: 'Ideas, people, and the pulse beneath the surface.',
  Music: 'Sound, movement, and the stories around them.',
  Wellness: 'Softness, strength, and making space for yourself.',
  News: 'The moments we are keeping our eyes on.',
};

export const CATEGORY_ACCENTS: Record<Category, string> = {
  Beauty: 'rose',
  Style: 'violet',
  Culture: 'gold',
  Music: 'blue',
  Wellness: 'sage',
  News: 'red',
};

export const DEFAULT_FEATURE_IMAGE =
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1800&q=90';
