import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import csv from 'csv-parser';
import fs from 'fs';
import { sub, format, parseISO } from 'date-fns';

const prisma = new PrismaClient();

export const handleHome = (req: Request, res: Response)=>{
  res.send('Okay Here!!!!')
}

// Função para lidar com o envio de dados do sensor
export const handleSensorData = async (req: Request, res: Response) => {
  const { equipmentId, timestamp, value } = req.body;

  try {
    // Validação básica dos dados recebidos
    if (!equipmentId || !timestamp || !value) {
      return res.status(400).send('Missing required fields');
    }

    await prisma.sensorData.create({
      data: {
        equipmentId,
        timestamp: new Date(timestamp),
        value,
      },
    });
    res.status(201).send('Data saved');
  } catch (error) {
    console.error('Error saving sensor data:', error);
    res.status(500).send('Failed to save sensor data');
  }
};

export const handleCSVUpload = async (req: Request, res: Response) => {
  if (!req.file || !req.file.path) {
    return res.status(400).send('No file uploaded');
  }

  const filePath = req.file.path;

  const results: any[] = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
        try {
          for (const row of results) {
            // Validação básica dos dados do CSV
            if (!row.equipmentId || !row.timestamp || !row.value) {
              console.warn('Skipping invalid CSV row:', row);
              continue;
            }
            console.log('this is my data: ',row)
            await prisma.sensorData.create({
              data: {
                equipmentId: row.equipmentId,
                timestamp: new Date(row.timestamp),
                value: parseFloat(row.value),
              },
            });
          }
          res.status(201).send('CSV data saved');
      } catch (error) {
        console.error('Error saving CSV data:', error);
        res.status(500).send('Failed to save CSV data');
      } finally {
        fs.unlinkSync(filePath);
      }
    });
};

export const getAverageData = async (req: Request, res: Response) => {
  const { period, equipmentId } = req.query;

  if (!equipmentId) {
    return res.status(400).send('Equipment ID is required');
  }

  if (period !== '24h' && period !== '1w' && period !== '1m') {
    return res.status(400).send('Invalid period');
  }

  try {
    const data = await prisma.sensorData.groupBy({
      by: ['equipmentId'],
      where: {
        equipmentId: equipmentId as string,
        timestamp: {
          gte: new Date(Date.now() - getTimeRange(period as string)),
        },
      },
      _avg: {
        value: true,
      },
    });

    if (!data || data.length === 0) {
      return res.status(404).send('No data found');
    }

    const averageData = data.map((item: any) => ({
      equipmentId: item.equipmentId,
      averageValue: item._avg.value,
    }));

    res.json(averageData);
  } catch (error) {
    console.error('Error fetching average data:', error);
    res.status(500).send('Failed to fetch average data');
  }
};

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


export const getAllSensorDataByPeriod = async (req: Request, res: Response) => {
  const period = req.query.period as string;
  const equipmentId = req.query.equipmentId as string;

  // Validar o período solicitado
  if (!['24h', '48h', '1w', '1m'].includes(period)) {
    return res.status(400).send('Invalid period');
  }

  // Validar o equipmentId
  if (!equipmentId) {
    return res.status(400).send('Equipment ID is required');
  }
  // Validação usando função, diferente da validação de tempo acima
  let dateFrom: Date;
  switch (period) {
    case '24h':
      dateFrom = sub(new Date(), { hours: 24 });
      break;
    case '48h':
      dateFrom = sub(new Date(), { hours: 48 });
      break;
    case '1w':
      dateFrom = sub(new Date(), { weeks: 1 });
      break;
    case '1m':
      dateFrom = sub(new Date(), { months: 1 });
      break;
    default:
      return res.status(400).send('Invalid period');
  }

  try {
    // Consultar todos os dados do sensor dentro do período e pelo equipmentId usando Prisma
    const sensorData = await prisma.sensorData.findMany({
      where: {
        equipmentId: equipmentId,
        timestamp: {
          gte: dateFrom,
        },
      },
      orderBy: {
        timestamp: 'asc', // Ordenar por timestamp
      },
    });

    // Formatar o timestamp para "dd/mm/yy" antes de enviar a resposta
    const formattedSensorData = sensorData.map(item => ({
      ...item,
      timestamp: format(new Date(item.timestamp), 'dd/MM/yy'),
    }));

    res.json(formattedSensorData);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).send('Failed to fetch sensor data');
  }
};


export const getAllEquipmentIds = async (req: Request, res: Response) => {
  try {
    // Consultar todos os equipmentId distintos
    const equipmentIds = await prisma.sensorData.findMany({
      distinct: ['equipmentId'],
      select: {
        equipmentId: true,
      },
    });

    // Mapear os resultados para um array simples de equipmentIds
    const equipmentIdList = equipmentIds.map(item => item.equipmentId);

    res.json(equipmentIdList);
  } catch (error) {
    console.error('Error fetching equipment IDs:', error);
    res.status(500).send('Failed to fetch equipment IDs');
  }
};