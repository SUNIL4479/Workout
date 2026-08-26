export const config = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  options: {
    stages: [
      { duration: '10s', target: 50 },  // Ramp up to 50 VUs
      { duration: '40s', target: 100 }, // Steady load at 100 VUs
      { duration: '10s', target: 0 }    // Ramp down to 0 VUs
    ],
    thresholds: {
      http_req_failed: ['rate<0.01'],        // Less than 1% failure rate
      http_req_duration: ['p(95)<500'],      // 95% of requests must complete under 500ms
      http_reqs: ['count>1000']              // Must execute over 1,000 total requests
    }
  }
};
