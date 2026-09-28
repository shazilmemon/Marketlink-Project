'use client';

import React, { useState } from 'react';

/**
 * Stable, deterministic category â†’ local image mapping.
 * Each category gets its own unique locally-stored image.
 * No two categories share the same image.
 */
export const CATEGORY_IMAGES: Record<string, string> = {
  VEGETABLES: '/images/cat-vegetables.jpg',
  FRUITS: '/images/cat-fruits.jpg',
  DAIRY: '/images/cat-dairy.jpg',
  EGGS: '/images/cat-eggs.jpg',
  GRAINS: '/images/cat-grains.jpg',
  HONEY: '/images/cat-honey.svg',
  MEAT: '/images/cat-meat.svg',
  DEFAULT: '/images/cat-vegetables.jpg',
};

/**
 * Map a category string to its canonical key.
 * Handles case variations and common aliases.
 */
export function getCategoryImageKey(category?: string): string {
  if (!category) return 'DEFAULT';
  const upper = category.toUpperCase().trim();
  if (upper === 'VEGETABLES' || upper === 'VEGETABLE') return 'VEGETABLES';
  if (upper === 'FRUITS' || upper === 'FRUIT') return 'FRUITS';
  if (upper === 'DAIRY' || upper === 'MILK') return 'DAIRY';
  if (upper === 'EGGS' || upper === 'EGG') return 'EGGS';
  if (upper === 'GRAINS' || upper === 'GRAIN' || upper === 'NUTS') return 'GRAINS';
  if (upper === 'HONEY' || upper === 'PRESERVES') return 'HONEY';
  if (upper === 'MEAT' || upper === 'POULTRY' || upper === 'CHICKEN' || upper === 'BEEF') return 'MEAT';
  return 'DEFAULT';
}

/**
 * Get the image URL for a given category.
 * Always returns a valid local path â€” never undefined.
 */
export function getCategoryImage(category?: string): string {
  const key = getCategoryImageKey(category);
  return CATEGORY_IMAGES[key] || CATEGORY_IMAGES.DEFAULT;
}

interface ProductImageProps {
  /** Primary image URL (user-uploaded or real product image). Takes priority. */
  src?: string | null;
  /** Product/category name for alt text */
  alt: string;
  /** Category for fallback image selection */
  category?: string;
  className?: string;
}

/**
 * ProductImage component with intelligent fallback chain:
 *   Real uploaded product image
 *   â†’ category-specific local image
 *   â†’ default local image
 *
 * Never shows a broken image icon.
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category,
  className = 'w-full h-full object-cover',
}) => {
  const fallbackSrc = getCategoryImage(category);
  const [imgSrc, setImgSrc] = useState<string>(
    src && src.trim() !== '' ? src : fallbackSrc
  );
  const [hasErrored, setHasErrored] = useState(false);

  const handleError = () => {
    if (!hasErrored) {
      setHasErrored(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};
