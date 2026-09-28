import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { FarmerProfile } from '../models/FarmerProfile';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { DemandForecast } from '../models/DemandForecast';
import { connectDatabase } from '../config/database';

jest.setTimeout(30000);

describe('Phase 5 AI Demand Forecasting Integration Tests', () => {
  let customerCookie: string;
  let farmerCookie: string;
  let farmerUserId: string;
  let farmerProfileId: string;
  let productId: string;
  let forecastId: string;

  beforeAll(async () => {
    await connectDatabase();

    // 1. Register customer
    const custReg = await request(app).post('/api/v1/auth/register').send({
      name: 'Forecasting Customer',
      email: 'customer.forecasting@example.com',
      password: 'Password123!',
      role: 'CUSTOMER',
    });
    customerCookie = custReg.headers['set-cookie']?.[0] || '';

    // 2. Register farmer
    const farmReg = await request(app).post('/api/v1/auth/register').send({
      name: 'Forecasting Farmer',
      email: 'farmer.forecasting@example.com',
      password: 'Password123!',
      role: 'CUSTOMER',
    });
    farmerUserId = farmReg.body?.data?.user?._id || farmReg.body?.data?.user?.id;

    if (farmerUserId) {
      await User.findByIdAndUpdate(farmerUserId, { role: 'FARMER' });
      const fp = await FarmerProfile.create({
        userId: farmerUserId,
        farmName: 'Organic Forecast Orchards',
        slug: 'organic-forecast-orchards',
        locationName: 'Napa Valley',
        isVerified: true,
      });
      farmerProfileId = fp._id.toString();

      // Create product
      const prod = await Product.create({
        farmerProfileId: fp._id,
        name: 'Organic Heirloom Strawberries',
        category: 'FRUITS',
        price: 6.5,
        unit: 'lb',
        isActive: true,
      });
      productId = prod._id.toString();

      // Seed 5 historical completed (PICKED_UP) orders for forecasting data sufficiency
      const baseDate = new Date();
      for (let i = 10; i >= 1; i--) {
        const orderDate = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
        await Order.create({
          orderNumber: `ML-FC-${i}`,
          customerId: farmReg.body?.data?.user?._id || new mongoose.Types.ObjectId(),
          farmerProfileId: fp._id,
          items: [{ productId: prod._id, quantity: 10 + i, unitPrice: 6.5, subtotal: (10 + i) * 6.5 }],
          totalAmount: (10 + i) * 6.5,
          status: 'PICKED_UP',
          createdAt: orderDate,
        });
      }
    }

    const farmLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'farmer.forecasting@example.com',
      password: 'Password123!',
    });
    farmerCookie = farmLogin.headers['set-cookie']?.[0] || '';
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({ email: { $regex: 'forecasting@example.com$' } });
      if (farmerProfileId) await FarmerProfile.findByIdAndDelete(farmerProfileId);
      if (productId) await Product.findByIdAndDelete(productId);
      await Order.deleteMany({ orderNumber: { $regex: '^ML-FC-' } });
      await DemandForecast.deleteMany({ farmerProfileId });
    }
  });

  it('1. CUSTOMER should be DENIED access to demand forecasting endpoints (RBAC Guard)', async () => {
    const res = await request(app)
      .get('/api/v1/forecasting/farmer')
      .set('Cookie', [customerCookie]);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('2. FARMER should generate a demand forecast for a valid product', async () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);

    const res = await request(app)
      .post('/api/v1/forecasting/farmer/generate')
      .set('Cookie', [farmerCookie])
      .send({
        productId,
        targetDate: targetDate.toISOString(),
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.predictedQuantity).toBeGreaterThan(0);
    expect(res.body.data.lowerBound).toBeDefined();
    expect(res.body.data.upperBound).toBeDefined();
    expect(res.body.data.demandLevel).toBeDefined();
    expect(res.body.data.confidenceLevel).toBeDefined();
    expect(res.body.data.modelName).toBeDefined();
    forecastId = res.body.data._id;
  });

  it('3. FARMER should retrieve their list of generated forecasts', async () => {
    const res = await request(app)
      .get('/api/v1/forecasting/farmer')
      .set('Cookie', [farmerCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('4. FARMER should retrieve single forecast details by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/forecasting/farmer/${forecastId}`)
      .set('Cookie', [farmerCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(forecastId);
  });

  it('5. FARMER should generate bulk forecasts for multiple products', async () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);

    const res = await request(app)
      .post('/api/v1/forecasting/farmer/generate-bulk')
      .set('Cookie', [farmerCookie])
      .send({
        productIds: [productId],
        targetDate: targetDate.toISOString(),
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('6. Should return INSUFFICIENT_DATA status when historical observations are under threshold', async () => {
    // Create a product with 0 historical sales
    const newProd = await Product.create({
      farmerProfileId,
      name: 'Rare Organic Persimmons',
      category: 'FRUITS',
      price: 8.0,
      unit: 'lb',
      isActive: true,
    });

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);

    const res = await request(app)
      .post('/api/v1/forecasting/farmer/generate')
      .set('Cookie', [farmerCookie])
      .send({
        productId: newProd._id.toString(),
        targetDate: targetDate.toISOString(),
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('INSUFFICIENT_DATA');
    expect(res.body.data.insufficientDataReason).toContain('Not enough historical sales observations');

    await Product.findByIdAndDelete(newProd._id);
  });
});
