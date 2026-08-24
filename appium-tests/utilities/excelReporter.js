import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export class ExcelReporter {
  static async generateReport(testResults, executionLogs, summaryData) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FitiFi Appium Automation Suite';

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
    const titleCell = wsSummary.getCell('A1');
    titleCell.value = 'React Native Appium E2E Automation Report';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = HEADER_FILL;
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    wsSummary.getRow(3).values = ['Metric Parameter', 'Value', 'Execution Notes'];
    wsSummary.getRow(3).font = { bold: true, color: { argb: 'FFFFFF' } };
    wsSummary.getRow(3).eachCell(cell => { cell.fill = SUBHEADER_FILL; });

    const summaryRows = [
      ['Execution Date', summaryData.executionDate || new Date().toLocaleString(), 'Automated Run'],
      ['Device Name', summaryData.deviceName || 'Android Emulator', 'Target Device'],
      ['Android Version', summaryData.androidVersion || '13.0', 'API Level 33'],
      ['Total Tests', summaryData.totalTests || 0, 'Executed'],
      ['Passed Tests', summaryData.passed || 0, 'Success'],
      ['Failed Tests', summaryData.failed || 0, 'Action Needed'],
      ['Skipped Tests', summaryData.skipped || 0, 'Ignored'],
      ['Pass Percentage', `${(summaryData.passPercentage || 100).toFixed(2)}%`, 'Target: >95%'],
      ['Execution Duration', `${summaryData.durationSec || 0}s`, 'Total Seconds']
    ];

    summaryRows.forEach((rowVals, idx) => {
      const row = wsSummary.getRow(idx + 4);
      row.values = rowVals;
      row.getCell(1).font = { bold: true };
      row.eachCell(cell => { cell.border = BORDER_THIN; });
    });
    wsSummary.columns = [{ width: 25 }, { width: 30 }, { width: 25 }];

    // Sheet 2: Test Cases
    const wsTests = workbook.addWorksheet('Test Cases');
    wsTests.views = [{ showGridLines: true }];
    wsTests.getRow(1).values = ['Test ID', 'Module', 'Scenario', 'Status', 'Device', 'Duration (s)'];
    wsTests.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    wsTests.getRow(1).eachCell(cell => { cell.fill = HEADER_FILL; });

    testResults.forEach((test, idx) => {
      const row = wsTests.getRow(idx + 2);
      row.values = [test.id, test.module, test.scenario, test.status, test.device, test.duration];
      row.eachCell(cell => { cell.border = BORDER_THIN; });
    });
    wsTests.columns = [{ width: 12 }, { width: 18 }, { width: 35 }, { width: 12 }, { width: 20 }, { width: 14 }];

    // Sheet 3: Failed Tests
    const wsFailed = workbook.addWorksheet('Failed Tests');
    wsFailed.views = [{ showGridLines: true }];
    wsFailed.getRow(1).values = ['Test Name', 'Failure Reason', 'Screenshot Path', 'Device', 'Android Version'];
    wsFailed.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    wsFailed.getRow(1).eachCell(cell => { cell.fill = HEADER_FILL; });

    const failedList = testResults.filter(t => t.status === 'FAILED');
    failedList.forEach((fail, idx) => {
      const row = wsFailed.getRow(idx + 2);
      row.values = [fail.scenario, fail.error, fail.screenshotPath || 'N/A', fail.device, summaryData.androidVersion || '13.0'];
      row.eachCell(cell => { cell.border = BORDER_THIN; });
    });
    wsFailed.columns = [{ width: 25 }, { width: 40 }, { width: 35 }, { width: 20 }, { width: 15 }];

    // Sheet 4: Execution Logs
    const wsLogs = workbook.addWorksheet('Execution Logs');
    wsLogs.views = [{ showGridLines: true }];
    wsLogs.getRow(1).values = ['Timestamp', 'Test Name', 'Step Description', 'Result', 'Remarks'];
    wsLogs.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    wsLogs.getRow(1).eachCell(cell => { cell.fill = HEADER_FILL; });

    executionLogs.forEach((log, idx) => {
      const row = wsLogs.getRow(idx + 2);
      row.values = [log.timestamp, log.testName, log.step, log.result, log.remarks];
      row.eachCell(cell => { cell.border = BORDER_THIN; });
    });
    wsLogs.columns = [{ width: 22 }, { width: 25 }, { width: 35 }, { width: 12 }, { width: 25 }];

    const reportDir = path.resolve('reports');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    const filePath = path.join(reportDir, 'React Native_E2E_Report.xlsx');
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }
}
