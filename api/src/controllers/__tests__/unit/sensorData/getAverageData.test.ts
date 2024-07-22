import { getAverageData } from '../../../sensorDataController';
import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { jest } from '@jest/globals';


const getTimeRange = (period: string) => {
  switch (period) {
    case '24h':
      return 24 * 60 * 60 * 1000;
    case '48h':
      return 48 * 60 * 60 * 1000;
    case '1w':
      return 7 * 24 * 60 * 60 * 1000;
    case '1m':
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
};

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      sensorData: {
        groupBy: jest.fn(),
      },
    })),
  };
});

const prismaMock = new PrismaClient() as jest.Mocked<PrismaClient>;


type SensorDataAvgAggregateOutputType = {
  value: number | null;
};

type SensorDataCountAggregateOutputType = {
  id: number;
  equipmentId: number;
  timestamp: number;
  value: number;
  _all: number;
};

type SensorDataSumAggregateOutputType = {
  value: number | null;
};

type SensorDataMinAggregateOutputType = {
  value: number | null;
};

type SensorDataMaxAggregateOutputType = {
  value: number | null;
};

// Tipo para a saída do groupBy
type SensorDataGroupByOutputType = {
  equipmentId: string;
  id: number;
  timestamp: Date;
  value: number;
  _count: SensorDataCountAggregateOutputType;
  _avg: SensorDataAvgAggregateOutputType;
  _sum: SensorDataSumAggregateOutputType;
  _min: SensorDataMinAggregateOutputType;
  _max: SensorDataMaxAggregateOutputType;
};


const mockData: SensorDataGroupByOutputType[] = [
  {
    equipmentId: 'EQ-12495',
    id: 1,
    timestamp: new Date(), // Data de timestamp
    value: 27.42,
    _count: {
      id: 1,
      equipmentId: 1,
      timestamp: 1,
      value: 1,
      _all: 1,
    },
    _avg: {
      value: 27.42,
    },
    _sum: {
      value: 27.42,
    },
    _min: {
      value: 27.42,
    },
    _max: {
      value: 27.42,
    },
  },
];

// Função para criar o mock do Request
const mockRequest = (query: any): Partial<Request> => ({
  query,
});

// Função para criar o mock do Response
const mockResponse = (): jest.Mocked<Response> => {
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as jest.Mocked<Response>;
  return res;
};

describe('getAverageData', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpa todos os mocks antes de cada teste
  });


  it('should mock Prisma groupBy correctly', async () => {
    prismaMock.sensorData.groupBy.mockResolvedValue(mockData);
  
    const result = await prismaMock.sensorData.groupBy({
      by: ['equipmentId'],
      where: {
        equipmentId: 'EQ-12495',
        timestamp: {
          gte: new Date(Date.now() - getTimeRange('1w')),
        },
      },
      _avg: {
        value: true,
      },
    });
  
    expect(result).toEqual(mockData);
  });


  it('should return average data for a valid period and equipment ID', async () => {
    const req = mockRequest({ period: '1w', equipmentId: 'EQ-12495' }) as Request;
    const res = mockResponse();
  

    prismaMock.sensorData.groupBy.mockResolvedValue(mockData);
  
    await getAverageData(req, res);
  
   
    //console.log(prismaMock.sensorData.groupBy.mock.calls);
  

    expect(prismaMock.sensorData.groupBy).toHaveBeenCalledWith(expect.objectContaining({
      by: ['equipmentId'],
      where: {
        equipmentId: 'EQ-12495',
        timestamp: {
          gte: expect.any(Date),
        },
      },
      _avg: {
        value: true,
      },
    }));
  
    expect(res.json).toHaveBeenCalledWith([
      { equipmentId: 'EQ-12495', averageValue: 27.42 },
    ]);
  });

  
  it('should respond with status 400 if equipment ID is missing', async () => {
    const req = mockRequest({ period: '24h' }) as Request;
    const res = mockResponse();

    await getAverageData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Equipment ID is required');
  });

  it('should respond with status 400 if period is invalid', async () => {
    const req = mockRequest({ period: 'invalid', equipmentId: 'EQ-12495' }) as Request;
    const res = mockResponse();

    await getAverageData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Invalid period');
  });

  it('should respond with status 500 if there is an error', async () => {
    const req = mockRequest({ period: '24h', equipmentId: 'EQ-12495' }) as Request;
    const res = mockResponse();

    prismaMock.sensorData.groupBy.mockRejectedValue(new Error('Database error'));

    await getAverageData(req, res);

    expect(res.status).toHaveBeenCalledWith(404); 
    expect(res.send).toHaveBeenCalledWith('No data found');
  });
});