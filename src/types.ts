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

export interface DBArticle {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url: string | null;
  category: string;
  source_url?: string | null;
  published_at: string;
  created_at: string;
  view_count: number;
}


export interface MarketplaceBaseItem {
  id: string;
  title: string;
  price: string;
  priceVal: number;
  location: string;
  badge: string;
  img: string;
}

export interface AutomotiveItem extends MarketplaceBaseItem {
  year: number;
  model: string;
}

export interface RealEstateItem extends MarketplaceBaseItem {
  type: 'Buy' | 'Rent' | 'Commercial';
  bedrooms: number;
}

export interface CareerItem extends MarketplaceBaseItem {
  sector: string;
}

export type MarketplaceItem = AutomotiveItem | RealEstateItem | CareerItem;

export interface GovService {
  id: string;
  title: string;
  icon: string;
  description: string;
}

