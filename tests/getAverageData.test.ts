// src/tests/getAverageData.test.ts
import { Request, Response } from 'express';
import { getAverageData } from '../controllers/sensorDataController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('getAverageData', () => {
  it('should return average data for valid period', async () => {
    const req = { query: { period: '24h' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getAverageData(req, res);

    expect(res.status).toHaveBeenCalledWith(200); // Assuming you return 200 for successful response
    expect(res.json).toHaveBeenCalled(); // Validate the response structure as needed
  });

  it('should return 400 for invalid period', async () => {
    const req = { query: { period: 'invalid' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    await getAverageData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Invalid period');
  });
});