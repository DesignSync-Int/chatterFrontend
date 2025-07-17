import { describe, it, expect, beforeEach } from 'vitest';
import { axiosInstance } from '../src/lib/axios';

describe('Buy Request API', () => {
  const testBuyRequest = {
    name: 'John Doe',
    contactNumber: '+1234567890',
    email: 'john.doe@example.com',
    bestTimeToCall: 'morning'
  };

  beforeEach(() => {
    // Reset any mocks if needed
  });

  it('should create a buy request successfully', async () => {
    try {
      const response = await axiosInstance.post('/buy-request', testBuyRequest);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('message');
      expect(response.data).toHaveProperty('requestId');
      expect(response.data).toHaveProperty('status', 'pending');
      
      console.log('Buy request created successfully:', response.data);
    } catch (error) {
      console.error('Error creating buy request:', error.response?.data || error.message);
      throw error;
    }
  });

  it('should validate required fields', async () => {
    try {
      const response = await axiosInstance.post('/buy-request', {});
      
      // This should fail
      expect(response.status).not.toBe(201);
    } catch (error) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data?.message).toContain('All fields are required');
    }
  });

  it('should validate email format', async () => {
    try {
      const invalidRequest = {
        ...testBuyRequest,
        email: 'invalid-email'
      };
      
      const response = await axiosInstance.post('/buy-request', invalidRequest);
      
      // This should fail
      expect(response.status).not.toBe(201);
    } catch (error) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data?.message).toContain('valid email');
    }
  });

  it('should validate contact number format', async () => {
    try {
      const invalidRequest = {
        ...testBuyRequest,
        contactNumber: 'invalid-phone'
      };
      
      const response = await axiosInstance.post('/buy-request', invalidRequest);
      
      // This should fail
      expect(response.status).not.toBe(201);
    } catch (error) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data?.message).toContain('valid contact number');
    }
  });

  it('should validate best time to call', async () => {
    try {
      const invalidRequest = {
        ...testBuyRequest,
        bestTimeToCall: 'invalid-time'
      };
      
      const response = await axiosInstance.post('/buy-request', invalidRequest);
      
      // This should fail
      expect(response.status).not.toBe(201);
    } catch (error) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data?.message).toContain('valid time');
    }
  });
});
