import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from './config.js';
import { getHeaders } from './helpers.js';

export const options = config.options;

export default function () {
  const resGet = http.get(`${config.baseUrl}/api/leaderboard`, { headers: getHeaders() });
  check(resGet, {
    'GET /api/leaderboard status is 200': (r) => r.status === 200,
    'GET response time < 300ms': (r) => r.timings.duration < 300
  });

  sleep(0.5);
}
