import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export class ExcelReporter {
  static async generateReport(testResults, executionLogs, summaryData) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FitiFi Selenium E2E Framework';

    const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E78' } };
    const SUBHEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5597' } };
    const BORDER_THIN = {
      top: { style: 'thin', color: { argb: 'D9D9D9' } },
      bottom: { style: 'thin', color: { argb: 'D9D9D9' } },
      left: { style: 'thin', color: { argb: 'D9D9D9' } },
      right: { style: 'thin', color: { argb: 'D9D9D9' } }
    };

    // Sheet 1: Summary
    const wsSummary = workbook.addWorksheet('Summary');
    wsSummary.views = [{ showGridLines: true }];

    wsSummary.mergeCells('A1:C1');
    wsSummary.getCell('A1').value = 'Selenium Web E2E Test Execution Summary';
    wsSummary.getCell('A1').font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    wsSummary.getCell('A1').fill = HEADER_FILL;
    wsSummary.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

    wsSummary.getRow(3).values = ['Parameter', 'Value', 'Notes'];
    wsSummary.getRow(3).font = { bold: true, color: { argb: 'FFFFFF' } };
    wsSummary.getRow(3).eachCell(cell => { cell.fill = SUBHEADER_FILL; });

    const summaryRows = [
      ['Execution Date', summaryData.executionDate || new Date().toLocaleString(), 'Automated CI/CD'],
      ['Environment', summaryData.environment || 'Local / Staging', 'Target Web App'],
      ['Browser', summaryData.browser || 'Google Chrome (Headless)', 'Automated Driver'],
      ['Total Tests', summaryData.totalTests || 0, 'Executed'],
      ['Passed', summaryData.passed || 0, 'Successful'],
      ['Failed', summaryData.failed || 0, 'Errors'],
      ['Skipped', summaryData.skipped || 0, 'Ignored'],
      ['Pass Percentage', `${(summaryData.passPercentage || 100).toFixed(2)}%`, 'KPI Metric'],
      ['Execution Duration', `${summaryData.durationSec || 0}s`, 'Total Time']
    ];

    summaryRows.forEach((r, i) => {
      const row = wsSummary.getRow(i + 4);
      row.values = r;
      row.getCell(1).font = { bold: true };
      row.eachCell(c => { c.border = BORDER_THIN; });
    });
    wsSummary.columns = [{ width: 22 }, { width: 32 }, { width: 22 }];

    // Sheet 2: Test Cases
    const wsTests = workbook.addWorksheet('Test Cases');
    wsTests.views = [{ showGridLines: true }];
    wsTests.getRow(1).values = ['Test ID', 'Module', 'Scenario Name', 'Browser', 'Status', 'Start Time', 'End Time', 'Duration (s)'];
    wsTests.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    wsTests.getRow(1).eachCell(c => { c.fill = HEADER_FILL; });

    testResults.forEach((t, i) => {
      const row = wsTests.getRow(i + 2);
      row.values = [t.id, t.module, t.scenario, t.browser || 'Chrome', t.status, t.startTime, t.endTime, t.duration];
      row.eachCell(c => { c.border = BORDER_THIN; });
    });
    wsTests.columns = [{ width: 12 }, { width: 18 }, { width: 35 }, { width: 14 }, { width: 12 }, { width: 22 }, { width: 22 }, { width: 14 }];

    // Sheet 3: Failed Tests
    const wsFailed = workbook.addWorksheet('Failed Tests');
    wsFailed.views = [{ showGridLines: true }];
    wsFailed.getRow(1).values = ['Test Name', 'Failure Reason', 'Screenshot Path', 'Browser', 'URL'];
    wsFailed.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    wsFailed.getRow(1).eachCell(c => { c.fill = HEADER_FILL; });

    const failed = testResults.filter(t => t.status === 'FAILED');
    failed.forEach((f, i) => {
      const row = wsFailed.getRow(i + 2);
      row.values = [f.scenario, f.error, f.screenshotPath || 'N/A', f.browser || 'Chrome', f.url || 'N/A'];
      row.eachCell(c => { c.border = BORDER_THIN; });
    });
    wsFailed.columns = [{ width: 25 }, { width: 40 }, { width: 35 }, { width: 15 }, { width: 30 }];

    // Sheet 4: Execution Logs
    const wsLogs = workbook.addWorksheet('Execution Logs');
    wsLogs.views = [{ showGridLines: true }];
    wsLogs.getRow(1).values = ['Timestamp', 'Test Name', 'Step Description', 'Result', 'Remarks'];
    wsLogs.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    wsLogs.getRow(1).eachCell(c => { c.fill = HEADER_FILL; });

    executionLogs.forEach((l, i) => {
      const row = wsLogs.getRow(i + 2);
      row.values = [l.timestamp, l.testName, l.step, l.result, l.remarks];
      row.eachCell(c => { c.border = BORDER_THIN; });
    });
    wsLogs.columns = [{ width: 22 }, { width: 25 }, { width: 35 }, { width: 12 }, { width: 25 }];

    const reportDir = path.resolve('reports');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    const filePath = path.join(reportDir, 'E2E_Report.xlsx');
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }
}
