/**
 * MarketLink - Database Seed Script
 * Seeds 2 Markets, 3 Farmers, 5 Products, and 1 Admin (SRS Compliant)
 */

import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

import { User } from '../../models/User';
import { FarmerProfile } from '../../models/FarmerProfile';
import { Market } from '../../models/Market';
import { MarketStall } from '../../models/MarketStall';
import { Product } from '../../models/Product';
import { Order } from '../../models/Order';
import { Review } from '../../models/Review';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marketlink';

const generateSlug = (name: string, suffix: string) =>
  `${name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}-${suffix}`;

export async function runSeed() {
  console.log('🌱 Connecting to MongoDB for seeding...');
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    }
    console.log('✅ MongoDB Connected');
  } catch (err: any) {
    console.log('⚠️ MongoDB is currently offline or unreachable. Seed script will run when MongoDB service is started.');
    return;
  }

  const passwordHash = await bcrypt.hash('Seed@1234', 12);

  // 1. Create 1 Admin, 3 Farmers, 1 Customer
  console.log('👤 Seeding Users (1 Admin, 3 Farmers, 1 Customer)...');

  const [admin, farmer1, farmer2, farmer3, customer1] = await Promise.all([
    User.findOneAndUpdate(
      { email: 'admin@marketlink.dev' },
      {
        name: 'MarketLink Admin',
        username: 'admin',
        email: 'admin@marketlink.dev',
        passwordHash,
        role: 'ADMIN',
        contactNumber: '+1-555-0199',
        address: '100 Admin Way, San Francisco, CA',
        isEmailVerified: true,
        isActive: true,
        authProviders: [{ provider: 'email' }],
      },
      { upsert: true, new: true }
    ),
    User.findOneAndUpdate(
      { email: 'farmer1@marketlink.dev' },
      {
        name: 'Ali Khan',
        username: 'alikhan',
        email: 'farmer1@marketlink.dev',
        passwordHash,
        role: 'FARMER',
        contactNumber: '+1-555-0101',
        address: 'Oakland Heritage Farm, CA',
        isEmailVerified: true,
        isActive: true,
        verificationStatus: 'VERIFIED',
        authProviders: [{ provider: 'email' }],
      },
      { upsert: true, new: true }
    ),
    User.findOneAndUpdate(
      { email: 'farmer2@marketlink.dev' },
      {
        name: 'Fatima Malik',
        username: 'fatimamalik',
        email: 'farmer2@marketlink.dev',
        passwordHash,
        role: 'FARMER',
        contactNumber: '+1-555-0102',
        address: 'Pure Soil Orchards, WA',
        isEmailVerified: true,
        isActive: true,
        verificationStatus: 'VERIFIED',
        authProviders: [{ provider: 'email' }],
      },
      { upsert: true, new: true }
    ),
    User.findOneAndUpdate(
      { email: 'farmer3@marketlink.dev' },
      {
        name: 'Marcus Vance',
        username: 'marcusvance',
        email: 'farmer3@marketlink.dev',
        passwordHash,
        role: 'FARMER',
        contactNumber: '+1-555-0103',
        address: 'Sunnyside Apiaries, CA',
        isEmailVerified: true,
        isActive: true,
        verificationStatus: 'VERIFIED',
        authProviders: [{ provider: 'email' }],
      },
      { upsert: true, new: true }
    ),
    User.findOneAndUpdate(
      { email: 'customer1@marketlink.dev' },
      {
        name: 'Sara Ahmed',
        username: 'saraahmed',
        email: 'customer1@marketlink.dev',
        passwordHash,
        role: 'CUSTOMER',
        contactNumber: '+1-555-0104',
        address: '500 Market St, San Jose, CA',
        isEmailVerified: true,
        isActive: true,
        authProviders: [{ provider: 'email' }],
      },
      { upsert: true, new: true }
    ),
  ]);

  console.log('✅ Users seeded successfully');

  // 2. Create 2 Markets
  console.log('🏪 Seeding 2 Markets...');
  const [market1, market2] = await Promise.all([
    Market.findOneAndUpdate(
      { slug: 'downtown-farmers-market' },
      {
        name: 'Downtown Farmers Market',
        slug: 'downtown-farmers-market',
        description: 'Premier regional organic farmers market open every weekend.',
        address: '1200 SW Park Ave, Oakland, CA',
        city: 'Oakland',
        area: 'Downtown',
        latitude: 37.8044,
        longitude: -122.2712,
        location: { type: 'Point', coordinates: [-122.2712, 37.8044] },
        openingTime: '08:00 AM',
        closingTime: '02:00 PM',
        marketDays: ['Saturday', 'Sunday'],
        contactInfo: { phone: '+1-555-MARKET1', email: 'downtown@marketlink.dev' },
        isActive: true,
        createdBy: admin!._id,
      },
      { upsert: true, new: true }
    ),
    Market.findOneAndUpdate(
      { slug: 'sunnyside-community-market' },
      {
        name: 'Sunnyside Community Market',
        slug: 'sunnyside-community-market',
        description: 'Community organic produce market featuring 25+ local growers.',
        address: '4500 California Ave SW, Seattle, WA',
        city: 'Seattle',
        area: 'Sunnyside',
        latitude: 47.6062,
        longitude: -122.3321,
        location: { type: 'Point', coordinates: [-122.3321, 47.6062] },
        openingTime: '09:00 AM',
        closingTime: '03:00 PM',
        marketDays: ['Sunday'],
        contactInfo: { phone: '+1-555-MARKET2', email: 'sunnyside@marketlink.dev' },
        isActive: true,
        createdBy: admin!._id,
      },
      { upsert: true, new: true }
    ),
  ]);

  console.log('✅ 2 Markets seeded successfully');

  // 3. Create 3 Farmer Profiles
  console.log('🌾 Seeding 3 Farmer Profiles...');
  const [fp1, fp2, fp3] = await Promise.all([
    FarmerProfile.findOneAndUpdate(
      { userId: farmer1!._id },
      {
        userId: farmer1!._id,
        businessName: 'Green Harvest Farms LLC',
        displayName: 'Ali Khan',
        farmName: 'Oakland Heritage Farm',
        bio: 'Family-owned organic vegetable farm cultivating heirloom produce.',
        phone: '+1-555-0101',
        email: 'farmer1@marketlink.dev',
        farmLocation: { address: 'Raiwind Valley', city: 'Oakland', coordinates: [-122.2712, 37.8044] },
        latitude: 37.8044,
        longitude: -122.2712,
        marketsServed: ['Downtown Farmers Market'],
        operatingDays: ['Saturday', 'Sunday'],
        pickupSlots: ['08:00 AM - 11:00 AM', '11:00 AM - 02:00 PM'],
        farmingPractices: ['Certified Organic', 'Drip Irrigation'],
        specialties: ['Heirloom Tomatoes', 'Organic Leafy Greens'],
        verificationStatus: 'VERIFIED',
        stallNumber: 'A-01',
        marketIds: [market1!._id],
        averageRating: 4.8,
        reviewCount: 15,
        isActive: true,
      },
      { upsert: true, new: true }
    ),
    FarmerProfile.findOneAndUpdate(
      { userId: farmer2!._id },
      {
        userId: farmer2!._id,
        businessName: 'Pure Soil Orchards',
        displayName: 'Fatima Malik',
        farmName: 'Pure Soil Orchards',
        bio: 'Premium organic stone fruit and apple orchards.',
        phone: '+1-555-0102',
        email: 'farmer2@marketlink.dev',
        farmLocation: { address: 'Cascade Foothills', city: 'Seattle', coordinates: [-122.3321, 47.6062] },
        latitude: 47.6062,
        longitude: -122.3321,
        marketsServed: ['Sunnyside Community Market'],
        operatingDays: ['Sunday'],
        pickupSlots: ['09:00 AM - 12:00 PM', '12:00 PM - 03:00 PM'],
        farmingPractices: ['Natural Pest Management', 'Regenerative Agriculture'],
        specialties: ['Honeycrisp Apples', 'Fresh Peaches'],
        verificationStatus: 'VERIFIED',
        stallNumber: 'B-04',
        marketIds: [market2!._id],
        averageRating: 4.9,
        reviewCount: 22,
        isActive: true,
      },
      { upsert: true, new: true }
    ),
    FarmerProfile.findOneAndUpdate(
      { userId: farmer3!._id },
      {
        userId: farmer3!._id,
        businessName: 'Cascade Apiaries & Produce',
        displayName: 'Marcus Vance',
        farmName: 'Cascade Apiaries',
        bio: 'Artisan wildflower honey and pasture-raised eggs.',
        phone: '+1-555-0103',
        email: 'farmer3@marketlink.dev',
        farmLocation: { address: 'Valley Crest', city: 'San Jose', coordinates: [-121.8863, 37.3382] },
        latitude: 37.3382,
        longitude: -121.8863,
        marketsServed: ['Downtown Farmers Market', 'Sunnyside Community Market'],
        operatingDays: ['Saturday', 'Sunday'],
        pickupSlots: ['08:00 AM - 12:00 PM'],
        farmingPractices: ['Raw Unfiltered Honey', 'Pasture Raised'],
        specialties: ['Wildflower Honey', 'Organic Eggs'],
        verificationStatus: 'VERIFIED',
        stallNumber: 'C-10',
        marketIds: [market1!._id, market2!._id],
        averageRating: 5.0,
        reviewCount: 30,
        isActive: true,
      },
      { upsert: true, new: true }
    ),
  ]);

  console.log('✅ 3 Farmer Profiles seeded successfully');

  // Update user favorite references
  await User.findByIdAndUpdate(customer1!._id, {
    favoriteFarmers: [fp1!._id, fp3!._id],
  });

  // 4. Create 5 Products
  console.log('📦 Seeding 5 Products...');
  const productData = [
    {
      farmerId: farmer1!._id,
      marketId: market1!._id,
      name: 'Heirloom Organic Tomatoes',
      slug: generateSlug('Heirloom Organic Tomatoes', 'p1'),
      description: 'Juicy, vine-ripened organic heirloom tomatoes grown in compost-rich soil.',
      category: 'VEGETABLES',
      unit: 'lb',
      basePrice: 4.5,
      stockQuantity: 45,
      isSoldOut: false,
      isOrganic: true,
      isSurplus: true,
      images: ['https://themewagon.github.io/milky/img/product-1.jpg'],
    },
    {
      farmerId: farmer2!._id,
      marketId: market2!._id,
      name: 'Fresh Crisp Honeycrisp Apples',
      slug: generateSlug('Fresh Crisp Honeycrisp Apples', 'p2'),
      description: 'Sweet, extra-crisp hand-picked organic apples.',
      category: 'FRUITS',
      unit: 'lb',
      basePrice: 3.8,
      stockQuantity: 60,
      isSoldOut: false,
      isOrganic: true,
      isSurplus: false,
      images: ['https://themewagon.github.io/milky/img/product-2.jpg'],
    },
    {
      farmerId: farmer3!._id,
      marketId: market1!._id,
      name: 'Wildflower Farm Raw Honey',
      slug: generateSlug('Wildflower Farm Raw Honey', 'p3'),
      description: '100% pure unfiltered raw wildflower honey harvested locally.',
      category: 'HONEY',
      unit: 'jar (16oz)',
      basePrice: 12.0,
      stockQuantity: 20,
      isSoldOut: false,
      isOrganic: true,
      isSurplus: false,
      images: ['https://themewagon.github.io/milky/img/product-3.jpg'],
    },
    {
      farmerId: farmer1!._id,
      marketId: market1!._id,
      name: 'Organic Farm Fresh Spinach',
      slug: generateSlug('Organic Farm Fresh Spinach', 'p4'),
      description: 'Dark green, iron-rich organic spinach bundles.',
      category: 'VEGETABLES',
      unit: 'bundle',
      basePrice: 3.0,
      stockQuantity: 30,
      isSoldOut: false,
      isOrganic: true,
      isSurplus: true,
      images: ['https://themewagon.github.io/milky/img/product-4.jpg'],
    },
    {
      farmerId: farmer3!._id,
      marketId: market2!._id,
      name: 'Pasture-Raised Organic Eggs',
      slug: generateSlug('Pasture-Raised Organic Eggs', 'p5'),
      description: 'Grade A organic eggs from free-roasting pasture hens.',
      category: 'DAIRY',
      unit: 'dozen',
      basePrice: 7.5,
      stockQuantity: 25,
      isSoldOut: false,
      isOrganic: true,
      isSurplus: false,
      images: ['https://themewagon.github.io/milky/img/service-1.jpg'],
    },
  ];

  const seededProducts = await Promise.all(
    productData.map((p) =>
      Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true })
    )
  );

  console.log('✅ 5 Products seeded successfully');

  // Update customer favorite products
  await User.findByIdAndUpdate(customer1!._id, {
    favoriteProducts: [seededProducts[0]!._id, seededProducts[2]!._id],
  });

  // 5. Create Sample Order & Review
  console.log('🛒 Seeding Sample Order & Review...');
  const sampleOrder = await Order.findOneAndUpdate(
    { orderNumber: 'ML-9901-SEED' },
    {
      orderNumber: 'ML-9901-SEED',
      customerId: customer1!._id,
      farmerId: farmer1!._id,
      marketId: market1!._id,
      pickupDate: new Date(Date.now() + 86400000),
      pickupTime: '10:00 AM',
      items: [
        {
          productId: seededProducts[0]!._id,
          productNameSnapshot: seededProducts[0]!.name,
          quantity: 3,
          unit: seededProducts[0]!.unit,
          unitPrice: seededProducts[0]!.basePrice,
          subtotal: 13.5,
        },
      ],
      subtotal: 13.5,
      total: 13.5,
      status: 'placed',
      customerNotes: 'Please select ripe tomatoes for morning pickup.',
    },
    { upsert: true, new: true }
  );

  await Review.findOneAndUpdate(
    { userId: customer1!._id, productId: seededProducts[0]!._id },
    {
      userId: customer1!._id,
      productId: seededProducts[0]!._id,
      farmerId: farmer1!._id,
      orderId: sampleOrder!._id,
      rating: 5,
      comment: 'Exceptionally fresh organic tomatoes! Outstanding harvest quality.',
      farmerReply: 'Thank you Sara! Harvested fresh this morning for your stall pickup.',
      status: 'PUBLISHED',
    },
    { upsert: true, new: true }
  );

  console.log('✅ Sample Order & Review seeded successfully');
  console.log('\n🎉 ALL SEED DATA SUCCESSFULLY CREATED! Summary:');
  console.log(' - 1 Admin (admin@marketlink.dev / Seed@1234)');
  console.log(' - 3 Farmers (farmer1, farmer2, farmer3 @marketlink.dev / Seed@1234)');
  console.log(' - 2 Markets (Downtown Farmers Market, Sunnyside Community Market)');
  console.log(' - 5 Products (Tomatoes, Apples, Honey, Spinach, Eggs)');
  console.log(' - 1 Customer (customer1@marketlink.dev / Seed@1234) + 1 Sample Order & Review');
}

if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
