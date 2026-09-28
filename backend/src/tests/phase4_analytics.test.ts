import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { FarmerProfile } from '../models/FarmerProfile';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { connectDatabase } from '../config/database';

jest.setTimeout(30000);

describe('Phase 4 Analytics & Smart Vendor Insights Integration Tests', () => {
  let customerCookie: string;
  let farmerCookie: string;
  let farmerUserId: string;
  let farmerProfileId: string;
  let createdProductId: string;
  let createdOrderId: string;

  beforeAll(async () => {
    await connectDatabase();

    // 1. Register customer
    const custReg = await request(app).post('/api/v1/auth/register').send({
      name: 'Analytics Customer',
      email: 'customer.analytics@example.com',
      password: 'Password123!',
      role: 'CUSTOMER',
    });
    customerCookie = custReg.headers['set-cookie']?.[0] || '';

    // 2. Register farmer
    const farmReg = await request(app).post('/api/v1/auth/register').send({
      name: 'Analytics Farmer',
      email: 'farmer.analytics@example.com',
      password: 'Password123!',
      role: 'CUSTOMER',
    });
    farmerUserId = farmReg.body?.data?.user?._id || farmReg.body?.data?.user?.id;

    if (farmerUserId) {
      await User.findByIdAndUpdate(farmerUserId, { role: 'FARMER' });
      const fp = await FarmerProfile.create({
        userId: farmerUserId,
        farmName: 'Valley Analytics Organic Farm',
        slug: 'valley-analytics-organic-farm',
        locationName: 'Sonoma Valley',
        isVerified: true,
      });
      farmerProfileId = fp._id.toString();

      // Create dummy product & order for analytics
      const prod = await Product.create({
        farmerProfileId: fp._id,
        name: 'Organic Honeycrisp Apples',
        category: 'FRUITS',
        price: 5.0,
        unit: 'lb',
        isActive: true,
      });
      createdProductId = prod._id.toString();

      const ord = await Order.create({
        orderNumber: 'ML-TEST-99',
        customerId: farmReg.body?.data?.user?._id || new mongoose.Types.ObjectId(),
        farmerProfileId: fp._id,
        items: [{ productId: prod._id, quantity: 4, unitPrice: 5.0, subtotal: 20.0 }],
        totalAmount: 20.0,
        status: 'PICKED_UP',
        pickupDate: new Date(),
      });
      createdOrderId = ord._id.toString();
    }

    const farmLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'farmer.analytics@example.com',
      password: 'Password123!',
    });
    farmerCookie = farmLogin.headers['set-cookie']?.[0] || '';
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({ email: { $regex: 'analytics@example.com$' } });
      if (farmerProfileId) await FarmerProfile.findByIdAndDelete(farmerProfileId);
      if (createdProductId) await Product.findByIdAndDelete(createdProductId);
      if (createdOrderId) await Order.findByIdAndDelete(createdOrderId);
    }
  });

  it('1. CUSTOMER should be DENIED access to farmer analytics (RBAC Guard)', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/farmer/overview')
      .set('Cookie', [customerCookie]);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('2. FARMER should retrieve their own overview analytics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/farmer/overview?preset=30d')
      .set('Cookie', [farmerCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currentMetrics).toBeDefined();
    expect(res.body.data.currentMetrics.totalOrders).toBeGreaterThanOrEqual(0);
  });

  it('3. FARMER should retrieve sales time series analytics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/farmer/sales?preset=30d&groupBy=day')
      .set('Cookie', [farmerCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.data)).toBe(true);
  });

  it('4. FARMER should retrieve order status breakdown', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/farmer/orders?preset=30d')
      .set('Cookie', [farmerCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.breakdown)).toBe(true);
  });

  it('5. FARMER should retrieve product performance metrics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/farmer/products?preset=30d')
      .set('Cookie', [farmerCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.topProducts).toBeDefined();
  });

  it('6. FARMER should retrieve deterministic Smart Vendor Insights', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/farmer/insights?preset=30d')
      .set('Cookie', [farmerCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('7. FARMER should export analytics CSV report', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/farmer/export?preset=30d')
      .set('Cookie', [farmerCookie]);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('MarketLink — Farmer Analytics Export');
  });
});
