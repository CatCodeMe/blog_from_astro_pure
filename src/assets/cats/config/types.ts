import type { ImageMetadata } from 'astro'

/**
 * Interface for cat photo data
 */
export interface CatPhoto {
  name: string
  image: ImageMetadata
  breed: string
  date: string
}

/**
 * Type for cat photos grouped by year
 */
export type CatPhotosByYear = Record<number, CatPhoto[]>
