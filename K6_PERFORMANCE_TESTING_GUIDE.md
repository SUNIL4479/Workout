# Grafana k6 API Performance & Load Testing Master Guide

A comprehensive, beginner-to-advanced enterprise manual for performance engineering, API load testing, SLA validation, and GitHub Actions integration using Grafana k6.

---

## Table of Contents
1. What is Load Testing?
2. Installing k6 (Windows)
3. Running a Test
4. Baseline Load Test (100 Virtual Users / 1 Minute)
5. Sample API Load Test Script
6. Understanding Results (Metric Deep-Dive)
7. Requests Per Second (RPS)
8. Response Time Analysis & Percentiles
9. Performance Benchmarks & Industry Standards
10. Common Performance Bottlenecks
11. Testing Multi-Step User Journeys & Full CRUD APIs
12. Environment Variables (`__ENV`)
13. HTML Report Generation
14. Live Monitoring with Grafana & InfluxDB
15. GitHub Actions Integration
16. Production GitHub Actions Workflow (YAML)
17. Enterprise Best Practices
18. Standard Project Folder Structure
19. 30 Comprehensive k6 & Performance Testing Interview Questions & Detailed Answers
20. Summary Cheat Sheet

---

## 1. What is Load Testing?

### Performance Testing Overview
Performance Testing evaluates how a system performs in terms of responsiveness, stability, scalability, and resource utilization under a particular workload.

### Types of Performance Testing
```
    ┌─────────────────────────────────────────────────────────┐
    │                 PERFORMANCE TESTING                     │
    └──────────┬──────────────┬──────────────┬────────────────┘
               │              │              │
        ┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐┌────────▼───────┐
        │ Load Test   ││ Stress Test ││ Spike Test  ││  Soak Test   │
        │(Expected VUs││(Beyond Limit││(Sudden Burst││(Long Duration│
        │  e.g. 100)  ││ e.g. 1000)  ││ e.g. 500)   ││ e.g. 24 hrs) │
        └─────────────┘└─────────────┘└─────────────┘└───────────────┘
```

- **Load Testing:** Tests the system under expected peak traffic (e.g., 100 concurrent users for 1 minute). Ensures SLA response times remain fast.
- **Stress Testing:** Pushes the system beyond normal limits to find the breaking point and observe how gracefully it recovers.
- **Spike Testing:** Simulates a sudden, massive surge in users (e.g., flash sale opening) to verify system resilience under extreme bursts.
- **Soak Testing (Endurance):** Runs moderate load over an extended period (e.g., 12–24 hours) to detect memory leaks, connection pool exhaustion, or degradation.

### Why API Load Testing Matters
APIs power modern web, mobile, and microservice architectures. Unmanaged performance bottlenecks lead to degraded user experience, server crashes, and lost revenue during high-traffic events.

---

## 2. Installing k6 (Windows)

### Step 1: Install using WinGet
Open PowerShell as Administrator and run:
```powershell
# Search for Grafana k6 package
winget search k6

# Install Grafana k6
winget install GrafanaLabs.k6
```

### Step 2: Verify Installation
```bash
k6 version
```
**Expected Output:** `k6 v0.50.0 (or newer)`

---

## 3. Running a Test

To run a k6 test script:
```bash
k6 run load-tests/load_test_scenario.js
```

---

## 4. Baseline Load Test

### 100 Virtual Users (VUs) for 1 Minute

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '1m',
};

export default function () {
  const res = http.get('http://localhost:5000/api/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

### Key Concepts
- **Virtual Users (VUs):** Simulated concurrent user threads executing the test script loop simultaneously.
- **Duration:** The total time window for running the test.
- **Iteration:** A single complete execution of the `default` function by one VU.
- **Check:** An assertion that evaluates conditions without halting execution.
- **Sleep:** Simulated user "think time" between actions.

---

## 5. Sample API Load Test Script

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },
    { duration: '40s', target: 100 },
    { duration: '10s', target: 0 }
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
    http_req_duration: ['p(95)<300'] // 95% of requests < 300ms
  }
};

export default function () {
  const url = 'http://localhost:5000/api/auth/signin';
  const payload = JSON.stringify({
    email: `user_${Math.floor(Math.random() * 1000)}@example.com`,
    password: 'Password123!'
  });
  const params = {
    headers: { 'Content-Type': 'application/json' }
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'response duration < 500ms': (r) => r.timings.duration < 500
  });

  sleep(1);
}
```

---

## 6. Understanding Results (Metric Deep-Dive)

| Metric | Meaning |
|---|---|
| `http_reqs` | Total number of HTTP requests issued by k6 |
| `iterations` | Total completed test loop iterations |
| `vus` | Active virtual users at test end |
| `vus_max` | Maximum configured virtual users |
| `data_received` | Total payload data downloaded (bytes) |
| `data_sent` | Total payload data uploaded (bytes) |
| `checks` | Percentage and count of passed vs failed checks |
| `http_req_duration` | Total time taken for request (DNS + Connect + TLS + Send + Wait + Receive) |
| `http_req_waiting` | Time spent waiting for response from server (TTFB) |
| `http_req_failed` | Percentage of failed HTTP requests |

---

## 7. Requests Per Second (RPS)

- **Example:** `120 req/sec` means the API processed 120 requests per second.
- **Good:** >100 req/sec with low response times.
- **Average:** 30–100 req/sec.
- **Poor:** <10 req/sec under heavy concurrency.

---

## 8. Response Time Analysis & Percentiles

- `avg`: Mean response time across all requests.
- `min`: Fastest single response time.
- `med` (P50): 50% of requests were faster than this value.
- `p90`: 90% of requests were faster than this value.
- `p95`: 95% of requests were faster than this value.
- `max`: Slowest single response time.

---

## 9. Performance Benchmarks

| Metric | Excellent | Good | Acceptable | Poor |
|---|---|---|---|---|
| Avg Latency | < 100ms | 100 - 300ms | 300 - 800ms | > 800ms |
| P95 Latency | < 250ms | 250 - 500ms | 500 - 1200ms | > 1200ms |
| Error Rate | 0.00% | < 0.5% | < 2.0% | > 2.0% |

---

## 10. Common Performance Bottlenecks

- **Database:** Missing indexes, slow unindexed queries, table locks, insufficient connection pool.
- **API Code:** Synchronous blocking calls, unoptimized nested loops, inefficient serialization.
- **Memory & CPU:** High memory usage causing garbage collection pauses or CPU throttling.
- **Caching:** Uncached frequent queries (missing Redis / Memcached).

---

## 11. Testing Multi-Step User Journeys & Full CRUD APIs

```javascript
import http from 'k6/http';
import { check, group, sleep } from 'k6';

export default function () {
  group('1. Authentication', function () {
    const res = http.post('http://localhost:5000/api/auth/signin', JSON.stringify({ email: 'user@example.com', password: 'password' }), { headers: { 'Content-Type': 'application/json' } });
    check(res, { 'Logged in': (r) => r.status === 200 || r.status === 401 });
  });

  group('2. Fetch Leaderboard', function () {
    const res = http.get('http://localhost:5000/api/leaderboard');
    check(res, { 'Fetched leaderboard': (r) => r.status === 200 });
  });

  sleep(1);
}
```

---

## 12. Environment Variables (`__ENV`)

Run script with custom parameters:
```bash
k6 run -e BASE_URL=https://api.fitify.com -e VUS=50 load-tests/load_test_scenario.js
```

Inside JS script:
```javascript
const baseUrl = __ENV.BASE_URL || 'http://localhost:5000';
```

---

## 13. HTML Report Generation

Generate summary HTML:
```bash
k6 run --out json=reports/results.json load-tests/load_test_scenario.js
```

---

## 14. Live Monitoring with Grafana & InfluxDB

```bash
# Send real-time k6 metrics to InfluxDB
k6 run --out influxdb=http://localhost:8086/k6db load-tests/load_test_scenario.js
```
Connect Grafana dashboard to InfluxDB datasource to visualize real-time RPS, Latency percentiles, and active VUs.

---

## 15. GitHub Actions Integration

See [.github/workflows/load-test.yml](file:///.github/workflows/load-test.yml) for full automated workflow.

---

## 16. Production GitHub Actions Workflow (YAML)

File: `.github/workflows/load-test.yml`

---

## 17. Enterprise Best Practices

1. Never target production without explicit authorization and rate-limiting safeguards.
2. Use parameterized test data to prevent caching artifacts.
3. Always include realistic user think time (`sleep`).
4. Set strict SLA thresholds in script options.

---

## 18. Standard Project Folder Structure

```
fitness app/
├── load-tests/
│   ├── config.js
│   ├── helpers.js
│   ├── login.js
│   ├── users.js
│   └── load_test_scenario.js
├── .github/
│   └── workflows/
│       └── load-test.yml
└── K6_PERFORMANCE_TESTING_GUIDE.md
```

---

## 19. 30 Comprehensive k6 & Performance Testing Interview Questions & Detailed Answers

1. **Q: What is Grafana k6?**  
   *A:* k6 is an open-source Developer-centric load testing tool written in Go with JavaScript ES6 runtime support, optimized for high performance and low resource footprint.

2. **Q: How does k6 differ from Apache JMeter?**  
   *A:* k6 uses lightweight Go routines rather than heavy Java threads per VU, consuming significantly less memory and CPU while providing code-first scriptable configuration.

3. **Q: What are Virtual Users (VUs)?**  
   *A:* VUs are isolated execution contexts running script loops concurrently to simulate real user traffic.

4. **Q: What are Thresholds in k6?**  
   *A:* Pass/fail criteria defined on test metrics (e.g., `http_req_duration: ['p(95)<300']`). If violated, k6 exits with non-zero code to fail CI pipelines.

5. **Q: What are Checks in k6?**  
   *A:* Boolean assertions evaluating responses without halting test execution (unlike unit test assertions).

6. **Q: How do you ramp up VUs over time?**  
   *A:* By configuring `stages` inside script options.

7. **Q: What is TTFB in performance testing?**  
   *A:* Time To First Byte (`http_req_waiting`), measuring latency from request send to receiving first response byte from server.

8. **Q: How do you pass environment variables to k6?**  
   *A:* Using the `-e KEY=VALUE` flag and accessing via `__ENV.KEY`.

9. **Q: What is the purpose of `sleep()` in k6?**  
   *A:* To simulate realistic human pacing ("think time") between user actions.

10. **Q: How do you group requests logically in k6?**  
    *A:* By wrapping request steps in the `group()` function.

11. **Q: How do you track custom metrics in k6?**  
    *A:* Using k6 metric primitives: `Counter`, `Gauge`, `Trend`, and `Rate`.

12. **Q: What is the difference between P90, P95, and P99 latency?**  
    *A:* They indicate the latency ceiling under which 90%, 95%, or 99% of all requests fell.

13. **Q: How do you run k6 tests in headless CI/CD pipelines?**  
    *A:* By executing `k6 run` inside GitHub Actions, GitLab CI, or Jenkins using docker/native binaries.

14. **Q: How do you simulate POST requests with JSON payloads?**  
    *A:* By passing `JSON.stringify(data)` and setting `Content-Type: application/json` headers.

15. **Q: What is Spike Testing?**  
    *A:* Testing system behavior during sudden, dramatic bursts in traffic.

16. **Q: How do you handle authentication tokens across dependent requests?**  
    *A:* Extract the token from the response JSON body of the login request and set it in subsequent request headers.

17. **Q: What is Soak Testing?**  
    *A:* Running continuous load for hours to uncover memory leaks and system degradation.

18. **Q: What causes `http_req_failed` to increase during load tests?**  
    *A:* Server timeouts, 500 internal server errors, unhandled exceptions, database deadlock, or connection pool exhaustion.

19. **Q: What is RPS?**  
    *A:* Requests Per Second—the rate at which the API server processes incoming requests.

20. **Q: How do you handle random test data generation?**  
    *A:* By using helper utilities to dynamically generate unique strings/emails per iteration.

21. **Q: Can k6 test WebSocket connections?**  
    *A:* Yes, via the native `k6/ws` module.

22. **Q: Can k6 test gRPC services?**  
    *A:* Yes, using the `k6/net/grpc` module.

23. **Q: What is the difference between Load Testing and Stress Testing?**  
    *A:* Load testing evaluates performance under expected usage; stress testing determines breaking points under extreme overload.

24. **Q: How do you parameterize test data from CSV files?**  
    *A:* Using `papaparse` or `open()` function in k6 to load external files.

25. **Q: How do you export k6 test results for visualization?**  
    *A:* Output to JSON, InfluxDB, Prometheus, Datadog, or Grafana Cloud.

26. **Q: What is connection pool starvation?**  
    *A:* When all database/HTTP connections are occupied, forcing incoming requests to wait in line.

27. **Q: How does CPU throttling impact load test results?**  
    *A:* It inflates response times artificially due to client-side CPU bottlenecks.

28. **Q: Why should client-side think time be randomized?**  
    *A:* To avoid unnatural "micro-bursts" where VUs fire requests in locked step.

29. **Q: How do you configure SLA gates in GitHub Actions?**  
    *A:* By setting script `thresholds`; if violated, k6 returns non-zero status code and fails the pipeline step.

30. **Q: What is the recommended strategy for continuous load testing?**  
    *A:* Execute automated baseline load tests in staging after every major build to catch performance regressions early.

---

## 20. Summary Cheat Sheet

### Common Commands
```bash
# Run local test script
k6 run script.js

# Run test with custom VUs and Duration
k6 run --vus 50 --duration 30s script.js

# Run with environment variables
k6 run -e BASE_URL=http://localhost:5000 script.js

# Export metrics to JSON
k6 run --out json=results.json script.js
```

### SLA Latency Benchmarks
- **P95 Latency:** `< 300ms` (Target Production SLA)
- **Error Rate:** `< 1%`
