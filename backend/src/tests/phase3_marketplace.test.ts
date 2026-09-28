import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { FarmerProfile } from '../models/FarmerProfile';
import { Market } from '../models/Market';
import { MarketStall } from '../models/MarketStall';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';
import { Order } from '../models/Order';
import { connectDatabase } from '../config/database';

jest.setTimeout(30000);

describe('Phase 3 Core Marketplace Integration Tests', () => {
  let customerCookie: string;
  let farmerCookie: string;
  let adminCookie: string;

  let farmerUserId: string;
  let farmerProfileId: string;
  let createdMarketId: string;
  let createdStallId: string;
  let createdProductId: string;
  let createdInventoryId: string;
  let createdOrderId: string;

  beforeAll(async () => {
    await connectDatabase();
    // 1. Register & login customer
    const custReg = await request(app).post('/api/v1/auth/register').send({
      name: 'Customer Test',
      email: 'customer.phase3@example.com',
      password: 'Password123!',
      role: 'CUSTOMER',
    });
    customerCookie = custReg.headers['set-cookie']?.[0] || '';

    // 2. Register & login farmer
    const farmReg = await request(app).post('/api/v1/auth/register').send({
      name: 'Farmer John',
      email: 'farmer.john@example.com',
      password: 'Password123!',
      role: 'CUSTOMER',
    });
    farmerCookie = farmReg.headers['set-cookie']?.[0] || '';
    farmerUserId = farmReg.body?.data?.user?._id || farmReg.body?.data?.user?.id;

    // Promote farmer user to FARMER role and create profile directly
    await User.findByIdAndUpdate(farmerUserId, { role: 'FARMER' });
    const fp = await FarmerProfile.create({
      userId: farmerUserId,
      farmName: 'Green Acres Organics',
      slug: 'green-acres-organics',
      locationName: 'Oakland Valley',
      latitude: 37.8,
      longitude: -122.2,
      bio: 'Family owned organic farm',
      isVerified: true,
      verificationStatus: 'APPROVED',
    });
    farmerProfileId = fp._id.toString();

    // Re-login farmer to update session/cookie if needed
    const farmLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'farmer.john@example.com',
      password: 'Password123!',
    });
    farmerCookie = farmLogin.headers['set-cookie']?.[0] || '';

    // 3. Register & login admin
    const adminReg = await request(app).post('/api/v1/auth/register').send({
      name: 'Admin User',
      email: 'admin.phase3@example.com',
      password: 'Password123!',
      role: 'CUSTOMER',
    });
    const adminUserId = adminReg.body?.data?.user?._id || adminReg.body?.data?.user?.id;
    await User.findByIdAndUpdate(adminUserId, { role: 'ADMIN' });
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin.phase3@example.com',
      password: 'Password123!',
    });
    adminCookie = adminLogin.headers['set-cookie']?.[0] || '';
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: '@example.com$' } });
    if (farmerProfileId) await FarmerProfile.findByIdAndDelete(farmerProfileId);
    if (createdMarketId) await Market.findByIdAndDelete(createdMarketId);
    if (createdStallId) await MarketStall.findByIdAndDelete(createdStallId);
    if (createdProductId) await Product.findByIdAndDelete(createdProductId);
    if (createdInventoryId) await Inventory.findByIdAndDelete(createdInventoryId);
    if (createdOrderId) await Order.findByIdAndDelete(createdOrderId);
    await mongoose.connection.close();
  });

  it('1. should list public farmers', async () => {
    const res = await request(app).get('/api/v1/farmers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('2. ADMIN should create a physical market', async () => {
    const res = await request(app)
      .post('/api/v1/markets')
      .set('Cookie', [adminCookie])
      .send({
        name: 'Downtown Farmers Market',
        slug: 'downtown-farmers-market',
        address: '123 Main St, Oakland, CA',
        city: 'Oakland',
        state: 'CA',
        zipCode: '94612',
        operatingDays: ['Saturday', 'Sunday'],
        operatingHours: '8:00 AM - 2:00 PM',
        description: 'Premier regional farmers market',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdMarketId = res.body.data._id;
  });

  it('3. ADMIN should create a stall assigned to farmer in market', async () => {
    const res = await request(app)
      .post(`/api/v1/markets/${createdMarketId}/stalls`)
      .set('Cookie', [adminCookie])
      .send({
        farmerProfileId: farmerProfileId,
        stallNumber: 'A-12',
        dayOfWeek: 'Saturday',
        locationDetails: 'North Entrance',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdStallId = res.body.data._id;
  });

  it('4. FARMER should create a product listing', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Cookie', [farmerCookie])
      .send({
        name: 'Fresh Organic Heirloom Tomatoes',
        category: 'VEGETABLES',
        description: 'Sun-ripened organic heirloom tomatoes grown without synthetic pesticides.',
        price: 4.5,
        unit: 'lb',
        isSurplus: true,
        harvestDate: new Date().toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdProductId = res.body.data._id;
  });

  it('5. FARMER should create inventory record for product', async () => {
    const res = await request(app)
      .post('/api/v1/inventory')
      .set('Cookie', [farmerCookie])
      .send({
        productId: createdProductId,
        quantityAvailable: 50,
        lowStockThreshold: 10,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdInventoryId = res.body.data._id;
  });

  it('6. CUSTOMER should search and filter products', async () => {
    const res = await request(app).get('/api/v1/products?category=VEGETABLES&search=Tomatoes');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('7. CUSTOMER should create a pre-order', async () => {
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 2);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', [customerCookie])
      .send({
        farmerProfileId: farmerProfileId,
        items: [
          {
            productId: createdProductId,
            quantity: 5,
          },
        ],
        pickupDate: pickupDate.toISOString(),
        paymentMethod: 'CASH_ON_PICKUP',
        customerNotes: 'Please pack in eco box',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBeDefined();
    expect(res.body.data.totalAmount).toBe(22.5); // 5 * 4.5
    createdOrderId = res.body.data._id;
  });

  it('8. FARMER should update order status to CONFIRMED', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/${createdOrderId}/status`)
      .set('Cookie', [farmerCookie])
      .send({
        status: 'CONFIRMED',
        farmerNotes: 'Order accepted, see you Saturday!',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CONFIRMED');
  });

  it('9. FARMER should update order status to READY_FOR_PICKUP', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/${createdOrderId}/status`)
      .set('Cookie', [farmerCookie])
      .send({
        status: 'READY_FOR_PICKUP',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('READY_FOR_PICKUP');
  });

  it('10. FARMER should update order status to PICKED_UP', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/${createdOrderId}/status`)
      .set('Cookie', [farmerCookie])
      .send({
        status: 'PICKED_UP',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PICKED_UP');
  });

  it('11. CUSTOMER should add product to favorites', async () => {
    const res = await request(app)
      .post('/api/v1/favorites')
      .set('Cookie', [customerCookie])
      .send({ productId: createdProductId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('12. CUSTOMER should submit a review for picked up order', async () => {
    const res = await request(app)
      .post(`/api/v1/products/${createdProductId}/reviews`)
      .set('Cookie', [customerCookie])
      .send({
        rating: 5,
        comment: 'Fresh, delicious tomatoes! High quality harvest.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
  });
});
