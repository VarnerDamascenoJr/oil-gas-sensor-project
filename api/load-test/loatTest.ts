import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 },   // 100 users
    { duration: '1m', target: 200 },   // 200 users
    { duration: '1m', target: 500 },   // 500 users
    { duration: '1m', target: 1000 },  // 1000 users
    { duration: '1m', target: 0 },     // ramp down to 0 users
  ],
  thresholds: {
    // 95% das requisições devem completar em menos de 500ms
    'http_req_duration': ['p(95)<500'], 
  },
  ext: {
    influxdb: {
      url: 'http://localhost:8086',
      database: 'k6'
    }
  }
};

const BASE_URL = 'http://localhost:8080/data';

const endpoints = [
  '/sensor-data?period=24h&equipmentId=EQ-12495',
  '/sensor-data?period=48h&equipmentId=EQ-12495',
  '/sensor-data?period=1w&equipmentId=EQ-12495',
  '/sensor-data?period=1m&equipmentId=EQ-12495',
];

export default function () {
  endpoints.forEach((endpoint) => {
    let url = `${BASE_URL}${endpoint}`;
    http.get(url);
    sleep(1);
  });
}
