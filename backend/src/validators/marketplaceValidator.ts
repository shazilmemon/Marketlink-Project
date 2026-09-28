import { z } from 'zod';

// ─── Farmer Profile ────────────────────────────────────────────────
export const farmerProfileUpdateSchema = z.object({
  body: z.object({
    businessName: z.string().min(2).max(100).optional(),
    displayName: z.string().min(2).max(100).optional(),
    bio: z.string().max(1000).optional(),
    phone: z.string().max(30).optional(),
    email: z.string().email().optional(),
    profileImage: z.string().url().optional().or(z.literal('')),
    coverImage: z.string().url().optional().or(z.literal('')),
    farmName: z.string().min(2).max(100).optional(),
    farmLocation: z
      .object({
        address: z.string().max(300).optional(),
        city: z.string().max(100).optional(),
        coordinates: z.tuple([z.number(), z.number()]).optional(),
      })
      .optional(),
    farmingPractices: z.array(z.string()).optional(),
    specialties: z.array(z.string()).optional(),
    operatingDays: z.array(z.string()).optional(),
    pickupSlots: z.array(z.string()).optional(),
  }),
});

// ─── Market ───────────────────────────────────────────────────────
export const createMarketSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(150),
    description: z.string().max(1000).optional(),
    address: z.string().min(5).max(300),
    city: z.string().min(2).max(100),
    area: z.string().max(100).optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    openingTime: z.string().default('08:00'),
    closingTime: z.string().default('14:00'),
    marketDays: z.array(z.string()).min(1),
    contactInfo: z
      .object({
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        website: z.string().url().optional().or(z.literal('')),
      })
      .optional(),
    image: z.string().url().optional().or(z.literal('')),
  }),
});

export const updateMarketSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(3).max(150).optional(),
    description: z.string().max(1000).optional(),
    address: z.string().min(5).max(300).optional(),
    city: z.string().min(2).max(100).optional(),
    area: z.string().max(100).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    openingTime: z.string().optional(),
    closingTime: z.string().optional(),
    marketDays: z.array(z.string()).min(1).optional(),
    contactInfo: z
      .object({
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        website: z.string().url().optional().or(z.literal('')),
      })
      .optional(),
    image: z.string().url().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  }),
});

// ─── Market Stall ─────────────────────────────────────────────────
export const createStallSchema = z.object({
  params: z.object({ marketId: z.string().min(1) }),
  body: z.object({
    stallName: z.string().min(2).max(100),
    stallNumber: z.string().min(1).max(20),
    locationDescription: z.string().max(300).optional(),
  }),
});

export const updateStallSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    stallName: z.string().min(2).max(100).optional(),
    stallNumber: z.string().min(1).max(20).optional(),
    locationDescription: z.string().max(300).optional(),
    isActive: z.boolean().optional(),
  }),
});

// ─── Product ──────────────────────────────────────────────────────
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
    description: z.string().max(2000).optional(),
    category: z.string().min(2).max(50),
    subcategory: z.string().max(50).optional(),
    images: z.array(z.string()).optional(),
    unit: z.enum(['kg', 'gram', 'dozen', 'piece', 'bundle', 'box', 'liter']).default('kg'),
    basePrice: z.number().min(0),
    currency: z.string().default('PKR'),
    tags: z.array(z.string()).optional(),
    origin: z.string().max(100).optional(),
    farmingPractice: z.string().max(100).optional(),
    isOrganic: z.boolean().default(true),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    description: z.string().max(2000).optional(),
    category: z.string().min(2).max(50).optional(),
    subcategory: z.string().max(50).optional(),
    images: z.array(z.string()).optional(),
    unit: z.enum(['kg', 'gram', 'dozen', 'piece', 'bundle', 'box', 'liter']).optional(),
    basePrice: z.number().min(0).optional(),
    currency: z.string().optional(),
    tags: z.array(z.string()).optional(),
    origin: z.string().max(100).optional(),
    farmingPractice: z.string().max(100).optional(),
    isOrganic: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    farmer: z.string().optional(),
    market: z.string().optional(),
    minPrice: z.string().transform(Number).optional(),
    maxPrice: z.string().transform(Number).optional(),
    availability: z.enum(['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK']).optional(),
    organic: z.enum(['true', 'false']).optional(),
    farmingPractice: z.string().optional(),
    tags: z.string().optional(),
    sort: z
      .enum(['relevance', 'newest', 'price_asc', 'price_desc', 'rating', 'popularity'])
      .default('newest'),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
  }),
});

// ─── Inventory ────────────────────────────────────────────────────
export const createInventorySchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    marketId: z.string().min(1).optional(),
    availableQuantity: z.number().min(0),
    minimumOrderQuantity: z.number().min(1).default(1),
    maximumOrderQuantity: z.number().min(1).default(100),
    price: z.number().min(0),
    currency: z.string().default('PKR'),
    inventoryDate: z.string().optional(),
    isPreOrderEnabled: z.boolean().default(true),
    availabilityStatus: z
      .enum(['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'CLOSED'])
      .default('AVAILABLE'),
  }),
});

export const updateInventorySchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    availableQuantity: z.number().min(0).optional(),
    minimumOrderQuantity: z.number().min(1).optional(),
    maximumOrderQuantity: z.number().min(1).optional(),
    price: z.number().min(0).optional(),
    currency: z.string().optional(),
    inventoryDate: z.string().optional(),
    availabilityStatus: z
      .enum(['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'CLOSED'])
      .optional(),
    isPreOrderEnabled: z.boolean().optional(),
  }),
});

// ─── Order ────────────────────────────────────────────────────────
export const createOrderSchema = z.object({
  body: z.object({
    farmerId: z.string().min(1),
    marketId: z.string().min(1).optional(),
    pickupDate: z.string().min(1, 'Pickup date is required'),
    pickupTime: z.string().default('10:00 AM'),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          inventoryId: z.string().min(1),
          quantity: z.number().min(1),
        })
      )
      .min(1),
    customerNotes: z.string().max(500).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(['CONFIRMED', 'READY_FOR_PICKUP', 'PICKED_UP', 'REJECTED']),
    farmerNotes: z.string().max(500).optional(),
  }),
});

export const cancelOrderSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    cancellationReason: z.string().max(500).optional(),
  }),
});

// ─── Review ───────────────────────────────────────────────────────
export const createReviewSchema = z.object({
  params: z.object({ productId: z.string().min(1) }),
  body: z.object({
    orderId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(150).optional(),
    comment: z.string().min(10).max(1500),
  }),
});

export const moderateReviewSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(['PUBLISHED', 'HIDDEN', 'REMOVED']),
  }),
});
