import request from 'supertest';
import app from '../../../app';

describe('CSV Upload Integration Tests', () => {
  it('should have at least one test', () => {
    expect(true).toBe(true);
  });
  
  it('should upload CSV and save data', async () => {
    const filePath = '../../../../file-test.csv';

    const response = await request(app)
      .post('/data/csv')
      .attach('file', filePath);

    expect(response.status).toBe(201);
    expect(response.text).toBe('CSV data saved');
  });


})