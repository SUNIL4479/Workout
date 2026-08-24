import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from './config.js';
import { getRandomUserPayload, getHeaders } from './helpers.js';

export const options = config.options;

export default function () {
  const payload = JSON.stringify(getRandomUserPayload());
  const res = http.post(`${config.baseUrl}/api/auth/signin`, payload, { headers: getHeaders() });

  check(res, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'response duration < 500ms': (r) => r.timings.duration < 500
  });

  sleep(1);
}
