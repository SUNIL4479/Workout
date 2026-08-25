export function getRandomUserPayload() {
  const rand = Math.floor(Math.random() * 100000);
  return {
    email: `testuser_${rand}@fitifyload.com`,
    password: `LoadPass_${rand}!`,
    name: `Load Test User ${rand}`
  };
}

export function getHeaders(token = null) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Grafana-k6-LoadTester/1.0'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
