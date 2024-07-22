import { handleSensorData } from '../../../sensorDataController';
import { Request, Response } from 'express';
import { prismaMock } from '../../../__mocks__/prismaClient';
import { jest } from '@jest/globals';

// Configuração do mock do PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

// Função para criar o mock do Request
const mockRequest = (body: any = {}): Partial<Request> => ({
  body,
}) as Partial<Request>;

// Função para criar o mock do Response
const mockResponse = (): jest.Mocked<Response> => {
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as jest.Mocked<Response>;
  return res;
};

describe('handleSensorData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save sensor data and respond with 201', async () => {
    const req = mockRequest({
      equipmentId: 'EQ-12495',
      timestamp: '2024-07-18T00:00:00Z',
      value: 27.42,
    }) as Request;
    const res = mockResponse();

    // Mock para o método create
    prismaMock.sensorData.create.mockResolvedValue({
      id: 1,
      equipmentId: 'EQ-12495',
      timestamp: new Date('2024-07-18T00:00:00Z'),
      value: 27.42,
    });

    await handleSensorData(req, res);

    expect(prismaMock.sensorData.create).toHaveBeenCalledWith({
      data: {
        equipmentId: 'EQ-12495',
        timestamp: new Date('2024-07-18T00:00:00Z'),
        value: 27.42,
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith('Data saved');
  });

  it('should respond with 400 if required fields are missing', async () => {
    const req = mockRequest({
      equipmentId: 'EQ-12495',
      value: 27.42,
    }) as Request;
    const res = mockResponse();

    await handleSensorData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Missing required fields');
  });

  it('should respond with 500 if there is an error', async () => {
    const req = mockRequest({
      equipmentId: 'EQ-12495',
      timestamp: '2024-07-18T00:00:00Z',
      value: 27.42,
    }) as Request;
    const res = mockResponse();

    prismaMock.sensorData.create.mockRejectedValue(new Error('Database error'));

    await handleSensorData(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Failed to save sensor data');
  });
});