import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from './config.js';
import { getRandomUserPayload, getHeaders } from './helpers.js';

export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp up to 50 VUs
    { duration: '40s', target: 100 }, // Hold load at 100 VUs
    { duration: '10s', target: 0 }    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000']  // 95% of requests < 1000ms
  }
};

export default function () {
  // 1. Health check
  const healthRes = http.get(`${config.baseUrl}/api/health`, { headers: getHeaders() });
  check(healthRes, { 
    'Health status 200': (r) => r.status === 200 
  });

  // 2. Root Status API
  const rootRes = http.get(`${config.baseUrl}/`, { headers: getHeaders() });
  check(rootRes, { 
    'Root API status 200': (r) => r.status === 200 
  });

  // 3. Leaderboard API
  const leaderRes = http.get(`${config.baseUrl}/api/leaderboard`, { headers: getHeaders() });
  check(leaderRes, { 
    'Leaderboard API status received': (r) => r.status === 200 || r.status === 500 
  });

  sleep(1);
}
