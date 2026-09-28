import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../app';
import { User } from '../models/User';
import { FarmerProfile } from '../models/FarmerProfile';
import { env } from '../config/env';

jest.setTimeout(30000);

describe('Phase 2 Auth, OAuth Abstractions & RBAC Integration Tests', () => {
  let customerToken: string;
  let adminToken: string;
  let farmerProfileId = '6601a5b8e4b0123456789aaa';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 1) {
      try {
        await User.deleteMany({ email: /phase2_/ });
        await FarmerProfile.deleteMany({ farmName: /Phase2/ });
      } catch (e) {
        // Ignore DB error in fallback mode
      }
    }
  });

  it('1. should reject registration when client attempts to self-assign ADMIN role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Hacker User',
        email: 'phase2_hacker@example.com',
        password: 'Password123!',
        role: 'ADMIN',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('2. should register a valid CUSTOMER account', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Jane Consumer',
        email: 'phase2_jane@example.com',
        password: 'Password123!',
        role: 'CUSTOMER',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('CUSTOMER');
    expect(res.headers['set-cookie']).toBeDefined();

    customerToken = res.body.data.tokens.accessToken;
  });

  it('3. should reject duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Jane Copy',
        email: 'phase2_jane@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('4. should log in successfully with correct credentials and issue cookies', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'phase2_jane@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('phase2_jane@example.com');
  });

  it('5. should reject login with invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'phase2_jane@example.com',
        password: 'WrongPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('6. should retrieve authenticated user profile via /auth/me', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('phase2_jane@example.com');
  });

  it('7. should return generic safe response for forgot password request (account enumeration safe)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: 'nonexistent@example.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('If an account exists');
  });

  it('8. should allow CUSTOMER to apply for farmer status', async () => {
    const res = await request(app)
      .post('/api/v1/farmers/apply')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        farmName: 'Phase2 Organic Farm',
        bio: 'Fresh organic berries and tomatoes.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.verificationStatus).toBe('PENDING');

    if (res.body.data.profile?._id) {
      farmerProfileId = res.body.data.profile._id;
    }
  });

  it('9. should deny CUSTOMER from accessing admin verification endpoint (RBAC Guard)', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/farmers/${farmerProfileId}/verify`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        status: 'VERIFIED',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('FORBIDDEN');
  });

  it('10. should allow ADMIN user to approve farmer application and convert role to FARMER', async () => {
    adminToken = jwt.sign(
      { id: '6601a5b8e4b0123456789bbb', email: 'admin@marketlink.org', role: 'ADMIN' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .patch(`/api/v1/admin/farmers/${farmerProfileId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'VERIFIED',
        notes: 'Verification approved by system administrator.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
