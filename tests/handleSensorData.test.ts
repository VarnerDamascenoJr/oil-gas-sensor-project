// src/tests/handleSensorData.test.ts
import { Request, Response } from 'express';
import { handleSensorData } from '../controllers/sensorDataController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('handleSensorData', () => {
  afterEach(async () => {
    await prisma.sensorData.deleteMany(); // Limpa os dados após cada teste
  });

  it('should save sensor data', async () => {
    const req = { body: { equipmentId: 'EQ-123', timestamp: new Date(), value: 10 } } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    await handleSensorData(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith('Data saved');
  });

  it('should return 400 if missing required fields', async () => {
    const req = { body: {} } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    await handleSensorData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Missing required fields');
  });
});