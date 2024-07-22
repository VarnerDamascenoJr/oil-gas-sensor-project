// src/tests/handleCSVUpload.test.ts
import { Request, Response } from 'express';
import { handleCSVUpload } from '../controllers/csvUploadController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('handleCSVUpload', () => {
  afterEach(() => {
    // Limpa os arquivos temporários ou dados de teste
  });

  it('should save CSV data', async () => {
    const req = { file: { path: 'dummy/path/test.csv' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    await handleCSVUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith('CSV data saved');
  });

  it('should return 500 on error', async () => {
    const req = { file: { path: 'dummy/path/test.csv' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    // Simulando um erro no processamento do CSV
    jest.spyOn(prisma.sensorData, 'create').mockRejectedValueOnce(new Error('Database error'));

    await handleCSVUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Failed to save CSV data');
  });
});