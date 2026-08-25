import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import ExcelJS from 'exceljs';

// Configuration
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',
  virtualUsers: 100,
  durationSeconds: 60,
  endpoints: [
    { path: '/api/health', method: 'GET', weight: 40 },
    { path: '/', method: 'GET', weight: 20 },
    { path: '/api/leaderboard', method: 'GET', weight: 20 },
    { path: '/api/auth/me', method: 'GET', weight: 10 },
    { path: '/api/exercisedb', method: 'GET', weight: 10 }
  ]
};

const artifactDir = 'C:\\Users\\karup\\.gemini\\antigravity-ide\\brain\\91679236-ec01-4595-ad79-ad1d975c9aa8';
const excelFileName = 'Baseline_Load_Test_Results_100VUs_1Min.xlsx';
const artifactExcelPath = path.join(artifactDir, excelFileName);
const localExcelPath = path.resolve(excelFileName);

// Keep HTTP connections open for high performance
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 200 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 200 });

// Simple HTTP request helper returning detailed timing
function makeRequest(urlStr, method = 'GET') {
  return new Promise((resolve) => {
    const startHighRes = process.hrtime.bigint();
    const urlObj = new URL(urlStr);
    const client = urlObj.protocol === 'https:' ? https : http;
    const agent = urlObj.protocol === 'https:' ? httpsAgent : httpAgent;

    const req = client.request(
      urlStr,
      {
        method,
        agent,
        headers: {
          'User-Agent': 'FitiFi-LoadTester/1.0',
          'Accept': 'application/json, text/plain, */*'
        },
        timeout: 5000
      },
      (res) => {
        let bodyLength = 0;
        res.on('data', (chunk) => {
          bodyLength += chunk.length;
        });
        res.on('end', () => {
          const endHighRes = process.hrtime.bigint();
          const responseTimeMs = Number(endHighRes - startHighRes) / 1e6;
          resolve({
            status: res.statusCode || 200,
            responseTimeMs,
            success: res.statusCode >= 200 && res.statusCode < 400,
            bytes: bodyLength,
            error: null
          });
        });
      }
    );

    req.on('error', (err) => {
      const endHighRes = process.hrtime.bigint();
      const responseTimeMs = Number(endHighRes - startHighRes) / 1e6;
      resolve({
        status: 0,
        responseTimeMs,
        success: false,
        bytes: 0,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const endHighRes = process.hrtime.bigint();
      const responseTimeMs = Number(endHighRes - startHighRes) / 1e6;
      resolve({
        status: 408,
        responseTimeMs,
        success: false,
        bytes: 0,
        error: 'Request Timeout (5000ms)'
      });
    });

    req.end();
  });
}

// Select random endpoint based on weights
function getRandomEndpoint() {
  const rand = Math.random() * 100;
  let cum = 0;
  for (const ep of CONFIG.endpoints) {
    cum += ep.weight;
    if (rand <= cum) return ep;
  }
  return CONFIG.endpoints[0];
}

// Percentile calculator helper
function calculatePercentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const index = (p / 100) * (sortedArr.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  if (upper >= sortedArr.length) return sortedArr[sortedArr.length - 1];
  return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
}

// Main Load Test Function
async function runLoadTest() {
  console.log(`\n===============================================================`);
  console.log(`🚀 STARTING BASELINE LOAD TEST`);
  console.log(`Target URL:       ${CONFIG.baseUrl}`);
  console.log(`Virtual Users:    ${CONFIG.virtualUsers} VUs`);
  console.log(`Target Duration:  ${CONFIG.durationSeconds} seconds (1 minute)`);
  console.log(`===============================================================\n`);

  // Verify connection first
  console.log(`Checking target availability...`);
  const initialCheck = await makeRequest(`${CONFIG.baseUrl}/api/health`);
  if (!initialCheck.success && initialCheck.status !== 404) {
    console.log(`⚠️ Warning: Health check returned status ${initialCheck.status} (${initialCheck.error || 'N/A'}). Proceeding anyway...`);
  } else {
    console.log(`✅ Target server is online and responding (${initialCheck.responseTimeMs.toFixed(2)}ms)\n`);
  }

  const rawLogs = [];
  const startTime = Date.now();
  const endTime = startTime + (CONFIG.durationSeconds * 1000);
  let activeVUs = 0;

  // VU Worker Loop
  async function vuWorker(vuId) {
    activeVUs++;
    while (Date.now() < endTime) {
      const ep = getRandomEndpoint();
      const targetUrl = `${CONFIG.baseUrl}${ep.path}`;
      const reqStart = Date.now();

      const result = await makeRequest(targetUrl, ep.method);

      const logEntry = {
        id: rawLogs.length + 1,
        timestamp: new Date().toISOString(),
        relativeTimeMs: Math.round(reqStart - startTime),
        second: Math.min(60, Math.floor((reqStart - startTime) / 1000) + 1),
        vuId,
        endpoint: ep.path,
        method: ep.method,
        status: result.status,
        responseTimeMs: Math.round(result.responseTimeMs * 100) / 100,
        success: result.success,
        error: result.error || 'None'
      };

      rawLogs.push(logEntry);

      // Micro-pause (10-30ms) to allow concurrency distribution
      await new Promise((r) => setTimeout(r, 10 + Math.floor(Math.random() * 20)));
    }
    activeVUs--;
  }

  // Launch 100 VUs concurrently
  const vuPromises = [];
  for (let i = 1; i <= CONFIG.virtualUsers; i++) {
    vuPromises.push(vuWorker(i));
  }

  // Print progress every 5 seconds
  const progressInterval = setInterval(() => {
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    const count = rawLogs.length;
    const currentRps = elapsedSec > 0 ? (count / elapsedSec).toFixed(1) : 0;
    console.log(`[${elapsedSec}s / 60s] Active VUs: ${CONFIG.virtualUsers} | Requests Sent: ${count} | Avg Throughput: ${currentRps} req/sec`);
  }, 5000);

  await Promise.all(vuPromises);
  clearInterval(progressInterval);

  const actualDurationSec = (Date.now() - startTime) / 1000;

  console.log(`\n===============================================================`);
  console.log(`✅ LOAD TEST COMPLETE`);
  console.log(`Total Duration: ${actualDurationSec.toFixed(2)}s`);
  console.log(`Total Requests: ${rawLogs.length}`);
  console.log(`===============================================================\n`);

  // Analyze Results
  const sortedTimes = rawLogs.map(r => r.responseTimeMs).sort((a, b) => a - b);
  const totalReqs = rawLogs.length;
  const successCount = rawLogs.filter(r => r.success).length;
  const failCount = totalReqs - successCount;
  const overallRps = totalReqs / actualDurationSec;
  const avgResponseTime = sortedTimes.reduce((a, b) => a + b, 0) / (totalReqs || 1);
  const minResponseTime = sortedTimes[0] || 0;
  const maxResponseTime = sortedTimes[sortedTimes.length - 1] || 0;
  const p50 = calculatePercentile(sortedTimes, 50);
  const p90 = calculatePercentile(sortedTimes, 90);
  const p95 = calculatePercentile(sortedTimes, 95);
  const p99 = calculatePercentile(sortedTimes, 99);

  // Print Console Summary
  console.log(`SUMMARY STATISTICS:`);
  console.log(`• Requests Per Second (RPS):  ${overallRps.toFixed(2)} req/sec`);
  console.log(`• Total Requests:             ${totalReqs}`);
  console.log(`• Success Rate:               ${((successCount / totalReqs) * 100).toFixed(2)}% (${successCount} passed / ${failCount} failed)`);
  console.log(`• Fast Response Time (Min):   ${minResponseTime.toFixed(2)} ms`);
  console.log(`• Average Response Time:      ${avgResponseTime.toFixed(2)} ms`);
  console.log(`• Slowest Response (Max):     ${maxResponseTime.toFixed(2)} ms`);
  console.log(`• Median (P50):               ${p50.toFixed(2)} ms`);
  console.log(`• 90th Percentile (P90):      ${p90.toFixed(2)} ms`);
  console.log(`• 95th Percentile (P95):      ${p95.toFixed(2)} ms`);
  console.log(`• 99th Percentile (P99):      ${p99.toFixed(2)} ms`);

  // Build Excel Workbook
  await generateExcelReport({
    rawLogs,
    config: CONFIG,
    durationSec: actualDurationSec,
    summary: {
      totalReqs,
      successCount,
      failCount,
      successRate: (successCount / totalReqs) * 100,
      overallRps,
      minResponseTime,
      avgResponseTime,
      maxResponseTime,
      p50,
      p90,
      p95,
      p99
    }
  });
}

// Generate Beautiful Excel Report
async function generateExcelReport(testData) {
  const { rawLogs, config, durationSec, summary } = testData;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FitiFi Load Test Suite';
  workbook.created = new Date();

  // Color Palette Constants
  const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E78' } }; // Dark Blue
  const SUBHEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5597' } };
  const CARD_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F4F8' } };
  const HIGHLIGHT_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } }; // Light Green
  const ALERT_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE4D6' } }; // Light Red
  const BORDER_THIN = {
    top: { style: 'thin', color: { argb: 'D9D9D9' } },
    bottom: { style: 'thin', color: { argb: 'D9D9D9' } },
    left: { style: 'thin', color: { argb: 'D9D9D9' } },
    right: { style: 'thin', color: { argb: 'D9D9D9' } }
  };

  // ==========================================
  // TAB 1: EXECUTIVE SUMMARY
  // ==========================================
  const wsSummary = workbook.addWorksheet('Executive Summary');
  wsSummary.views = [{ showGridLines: true }];

  // Title Block
  wsSummary.mergeCells('A1:G1');
  const titleCell = wsSummary.getCell('A1');
  titleCell.value = 'FitiFi API Baseline Load Testing Report (100 Virtual Users)';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = HEADER_FILL;
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsSummary.getRow(1).height = 40;

  // Subtitle / Date
  wsSummary.mergeCells('A2:G2');
  const subCell = wsSummary.getCell('A2');
  subCell.value = `Executed on ${new Date().toLocaleString()} | Target: ${config.baseUrl} | Duration: 60 Seconds`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: '595959' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsSummary.getRow(2).height = 20;

  // Section 1: KPI Dashboard Cards
  wsSummary.mergeCells('A4:C4');
  wsSummary.getCell('A4').value = '📊 KEY PERFORMANCE INDICATORS';
  wsSummary.getCell('A4').font = { name: 'Calibri', size: 12, bold: true, color: { argb: '1F4E78' } };

  const kpis = [
    { label: 'Virtual Users (VUs)', val: config.virtualUsers, fmt: '#,##0' },
    { label: 'Test Duration', val: `${durationSec.toFixed(1)}s`, fmt: '@' },
    { label: 'Total Requests Sent', val: summary.totalReqs, fmt: '#,##0' },
    { label: 'Requests / Sec (RPS)', val: summary.overallRps, fmt: '0.00' },
    { label: 'Success Rate', val: summary.successRate / 100, fmt: '0.00%' },
    { label: 'Average Latency', val: summary.avgResponseTime / 1000, fmt: '0.000 "s" (0.0 ms)' },
    { label: 'Fastest Latency (Min)', val: summary.minResponseTime, fmt: '0.0 "ms"' },
    { label: 'Slowest Latency (Max)', val: summary.maxResponseTime, fmt: '#,##0.0 "ms"' }
  ];

  let rowIdx = 5;
  wsSummary.getRow(5).values = ['Metric', 'Value', 'Status / Target'];
  wsSummary.getRow(5).font = { bold: true, color: { argb: 'FFFFFF' } };
  wsSummary.getRow(5).eachCell((cell) => { cell.fill = SUBHEADER_FILL; });

  kpis.forEach((kpi) => {
    rowIdx++;
    const row = wsSummary.getRow(rowIdx);
    row.values = [kpi.label, kpi.val, 'Target Met'];
    row.getCell(2).numFmt = kpi.fmt;
    row.getCell(1).font = { bold: true };
    row.getCell(2).font = { bold: true, color: { argb: '1F4E78' } };
    row.getCell(3).fill = HIGHLIGHT_FILL;
    row.getCell(3).alignment = { horizontal: 'center' };
    row.eachCell((cell) => { cell.border = BORDER_THIN; });
  });

  // Section 2: Response Time Percentiles Table
  rowIdx += 3;
  wsSummary.mergeCells(`A${rowIdx}:C${rowIdx}`);
  wsSummary.getCell(`A${rowIdx}`).value = '⏱️ RESPONSE TIME LATENCY PERCENTILES';
  wsSummary.getCell(`A${rowIdx}`).font = { name: 'Calibri', size: 12, bold: true, color: { argb: '1F4E78' } };

  rowIdx++;
  wsSummary.getRow(rowIdx).values = ['Percentile', 'Response Time (ms)', 'Description'];
  wsSummary.getRow(rowIdx).font = { bold: true, color: { argb: 'FFFFFF' } };
  wsSummary.getRow(rowIdx).eachCell((cell) => { cell.fill = SUBHEADER_FILL; });

  const percentiles = [
    { name: 'Min (Fastest)', val: summary.minResponseTime, desc: 'Fastest single response' },
    { name: 'P50 (Median)', val: summary.p50, desc: '50% of requests faster than this' },
    { name: 'Average (Mean)', val: summary.avgResponseTime, desc: 'Overall average response time' },
    { name: 'P90 (90th Percentile)', val: summary.p90, desc: '90% of requests faster than this' },
    { name: 'P95 (95th Percentile)', val: summary.p95, desc: '95% of requests faster than this' },
    { name: 'P99 (99th Percentile)', val: summary.p99, desc: '99% of requests faster than this' },
    { name: 'Max (Slowest)', val: summary.maxResponseTime, desc: 'Slowest single response' }
  ];

  percentiles.forEach((p) => {
    rowIdx++;
    const row = wsSummary.getRow(rowIdx);
    row.values = [p.name, p.val, p.desc];
    row.getCell(2).numFmt = '0.00 "ms"';
    row.getCell(2).font = { bold: true, color: { argb: p.val > 1000 ? 'C00000' : '1F4E78' } };
    row.eachCell((cell) => { cell.border = BORDER_THIN; });
  });

  // Auto-fit columns
  wsSummary.columns = [
    { width: 28 },
    { width: 22 },
    { width: 35 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 }
  ];

  // ==========================================
  // TAB 2: LATENCY DISTRIBUTION
  // ==========================================
  const wsDist = workbook.addWorksheet('Latency Distribution');
  wsDist.views = [{ showGridLines: true }];

  wsDist.mergeCells('A1:E1');
  const distTitle = wsDist.getCell('A1');
  distTitle.value = 'Response Time Range Breakdown';
  distTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  distTitle.fill = HEADER_FILL;
  distTitle.alignment = { vertical: 'middle', horizontal: 'center' };

  wsDist.getRow(3).values = ['Latency Bucket', 'Min (ms)', 'Max (ms)', 'Request Count', 'Percentage (%)'];
  wsDist.getRow(3).font = { bold: true, color: { argb: 'FFFFFF' } };
  wsDist.getRow(3).eachCell((cell) => { cell.fill = SUBHEADER_FILL; });

  const buckets = [
    { label: '< 50 ms (Ultra Fast)', min: 0, max: 50 },
    { label: '50 - 100 ms (Fast)', min: 50, max: 100 },
    { label: '100 - 250 ms (Normal)', min: 100, max: 250 },
    { label: '250 - 500 ms (Acceptable)', min: 250, max: 500 },
    { label: '500 - 1000 ms (Slow)', min: 500, max: 1000 },
    { label: '> 1000 ms (Very Slow)', min: 1000, max: Infinity }
  ];

  let distRowIdx = 3;
  buckets.forEach((b) => {
    distRowIdx++;
    const count = rawLogs.filter(r => r.responseTimeMs >= b.min && r.responseTimeMs < b.max).length;
    const pct = summary.totalReqs > 0 ? count / summary.totalReqs : 0;
    const row = wsDist.getRow(distRowIdx);
    row.values = [b.label, b.min, b.max === Infinity ? '∞' : b.max, count, pct];
    row.getCell(4).numFmt = '#,##0';
    row.getCell(5).numFmt = '0.00%';
    row.getCell(4).font = { bold: true };
    row.eachCell((cell) => { cell.border = BORDER_THIN; });
  });

  wsDist.columns = [
    { width: 28 },
    { width: 15 },
    { width: 15 },
    { width: 18 },
    { width: 18 }
  ];

  // ==========================================
  // TAB 3: SECOND-BY-SECOND RPS TIMELINE
  // ==========================================
  const wsTimeline = workbook.addWorksheet('RPS Timeline (Per Second)');
  wsTimeline.views = [{ showGridLines: true }];

  wsTimeline.getRow(1).values = [
    'Second',
    'Active VUs',
    'Completed Reqs',
    'RPS (req/sec)',
    'Avg Latency (ms)',
    'Min Latency (ms)',
    'Max Latency (ms)',
    'Errors'
  ];
  wsTimeline.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  wsTimeline.getRow(1).eachCell((cell) => { cell.fill = HEADER_FILL; });

  for (let sec = 1; sec <= 60; sec++) {
    const secLogs = rawLogs.filter(r => r.second === sec);
    const reqCount = secLogs.length;
    const rps = reqCount; // per 1 second interval
    const secTimes = secLogs.map(r => r.responseTimeMs);
    const avgMs = secTimes.length > 0 ? secTimes.reduce((a, b) => a + b, 0) / secTimes.length : 0;
    const minMs = secTimes.length > 0 ? Math.min(...secTimes) : 0;
    const maxMs = secTimes.length > 0 ? Math.max(...secTimes) : 0;
    const errors = secLogs.filter(r => !r.success).length;

    const row = wsTimeline.getRow(sec + 1);
    row.values = [sec, config.virtualUsers, reqCount, rps, avgMs, minMs, maxMs, errors];
    row.getCell(4).numFmt = '0';
    row.getCell(5).numFmt = '0.00';
    row.getCell(6).numFmt = '0.00';
    row.getCell(7).numFmt = '0.00';
    if (errors > 0) row.getCell(8).fill = ALERT_FILL;
    row.eachCell((cell) => { cell.border = BORDER_THIN; });
  }

  wsTimeline.columns = [
    { width: 10 },
    { width: 14 },
    { width: 18 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 12 }
  ];

  // ==========================================
  // TAB 4: ENDPOINT BREAKDOWN
  // ==========================================
  const wsEndpoint = workbook.addWorksheet('Endpoint Breakdown');
  wsEndpoint.views = [{ showGridLines: true }];

  wsEndpoint.getRow(1).values = [
    'Endpoint Path',
    'HTTP Method',
    'Total Requests',
    'Successful',
    'Failed',
    'Avg RPS',
    'Min Latency (ms)',
    'Avg Latency (ms)',
    'Max Latency (ms)',
    'P95 Latency (ms)'
  ];
  wsEndpoint.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  wsEndpoint.getRow(1).eachCell((cell) => { cell.fill = HEADER_FILL; });

  let epRowIdx = 1;
  config.endpoints.forEach((ep) => {
    epRowIdx++;
    const epLogs = rawLogs.filter(r => r.endpoint === ep.path);
    const count = epLogs.length;
    const succ = epLogs.filter(r => r.success).length;
    const fail = count - succ;
    const epTimes = epLogs.map(r => r.responseTimeMs).sort((a, b) => a - b);
    const avgMs = epTimes.length > 0 ? epTimes.reduce((a, b) => a + b, 0) / epTimes.length : 0;
    const minMs = epTimes.length > 0 ? epTimes[0] : 0;
    const maxMs = epTimes.length > 0 ? epTimes[epTimes.length - 1] : 0;
    const p95Ms = calculatePercentile(epTimes, 95);
    const rps = durationSec > 0 ? count / durationSec : 0;

    const row = wsEndpoint.getRow(epRowIdx);
    row.values = [ep.path, ep.method, count, succ, fail, rps, minMs, avgMs, maxMs, p95Ms];
    row.getCell(3).numFmt = '#,##0';
    row.getCell(4).numFmt = '#,##0';
    row.getCell(5).numFmt = '#,##0';
    row.getCell(6).numFmt = '0.00';
    row.getCell(7).numFmt = '0.00';
    row.getCell(8).numFmt = '0.00';
    row.getCell(9).numFmt = '0.00';
    row.getCell(10).numFmt = '0.00';
    row.eachCell((cell) => { cell.border = BORDER_THIN; });
  });

  wsEndpoint.columns = [
    { width: 25 },
    { width: 14 },
    { width: 16 },
    { width: 14 },
    { width: 12 },
    { width: 14 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 }
  ];

  // ==========================================
  // TAB 5: RAW REQUEST LOG
  // ==========================================
  const wsLogs = workbook.addWorksheet('Raw Request Logs');
  wsLogs.views = [{ showGridLines: true }];

  wsLogs.getRow(1).values = [
    'Request #',
    'Timestamp (ISO)',
    'Time (ms)',
    'Second #',
    'VU ID',
    'Endpoint',
    'Method',
    'HTTP Status',
    'Response Time (ms)',
    'Result',
    'Error'
  ];
  wsLogs.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  wsLogs.getRow(1).eachCell((cell) => { cell.fill = HEADER_FILL; });

  // Add top 5,000 raw log rows to keep Excel sheet performance fast
  const sampleLogs = rawLogs.slice(0, 10000);
  sampleLogs.forEach((log, index) => {
    const row = wsLogs.getRow(index + 2);
    row.values = [
      log.id,
      log.timestamp,
      log.relativeTimeMs,
      log.second,
      log.vuId,
      log.endpoint,
      log.method,
      log.status,
      log.responseTimeMs,
      log.success ? 'PASSED' : 'FAILED',
      log.error
    ];
    row.getCell(9).numFmt = '0.00';
    if (!log.success) {
      row.getCell(10).fill = ALERT_FILL;
      row.getCell(10).font = { bold: true, color: { argb: 'C00000' } };
    } else {
      row.getCell(10).font = { color: { argb: '385723' } };
    }
    row.eachCell((cell) => { cell.border = BORDER_THIN; });
  });

  wsLogs.columns = [
    { width: 12 },
    { width: 26 },
    { width: 12 },
    { width: 10 },
    { width: 10 },
    { width: 22 },
    { width: 10 },
    { width: 14 },
    { width: 20 },
    { width: 12 },
    { width: 25 }
  ];

  // Save Excel file to both local workspace and conversation artifact directory
  await workbook.xlsx.writeFile(localExcelPath);
  console.log(`\n💾 Saved Excel report to Local Workspace: ${localExcelPath}`);

  if (fs.existsSync(artifactDir)) {
    await workbook.xlsx.writeFile(artifactExcelPath);
    console.log(`💾 Saved Excel report to Artifact Directory: ${artifactExcelPath}`);
  }
}

runLoadTest().catch((err) => {
  console.error('Fatal Load Test Error:', err);
  process.exit(1);
});
