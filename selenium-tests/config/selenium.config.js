export const config = {
  baseUrl: process.env.APP_URL || 'http://localhost:5173',
  browser: process.env.BROWSER || 'chrome', // chrome | firefox | edge
  headless: process.env.HEADLESS !== 'false', // default headless
  implicitWaitMs: 10000,
  explicitWaitMs: 15000,
  screenshotDir: 'reports/failures/screenshots'
};
