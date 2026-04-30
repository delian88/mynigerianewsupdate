/**
 * Core types for MYNIGERIA.NEWS
 */

export enum Category {
  NEWS = 'News',
  MARKETPLACE = 'Marketplace',
  GOVERNMENT = 'Government',
  DATA = 'Data & Intelligence',
  MULTIMEDIA = 'Multimedia',
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  timestamp: string;
  author: string;
  isBreaking?: boolean;
}

export interface ListingItem {
  id: string;
  title: string;
  price: string;
  location: string;
  type: 'cars' | 'property' | 'jobs';
  image: string;
  badge?: string;
}

export interface GovService {
  id: string;
  title: string;
  icon: string;
  description: string;
}
