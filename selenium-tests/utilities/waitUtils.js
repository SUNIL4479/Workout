import { until } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

export class WaitUtils {
  static async waitForElementVisible(driver, locator, timeoutMs = 15000) {
    logger.info(`Waiting for element to be visible: ${locator.toString()}`);
    const element = await driver.wait(until.elementLocated(locator), timeoutMs);
    await driver.wait(until.elementIsVisible(element), timeoutMs);
    return element;
  }

  static async waitForElementClickable(driver, locator, timeoutMs = 15000) {
    const element = await this.waitForElementVisible(driver, locator, timeoutMs);
    await driver.wait(until.elementIsEnabled(element), timeoutMs);
    return element;
  }

  static async scrollToElement(driver, element) {
    await driver.executeScript('arguments[0].scrollIntoView({ behavior: "smooth", block: "center" });', element);
  }

  static async captureScreenshotOnFailure(driver, testName) {
    try {
      const screenshot = await driver.takeScreenshot();
      const dir = path.resolve('reports/failures/screenshots');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const filename = `${testName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
      const fullPath = path.join(dir, filename);
      fs.writeFileSync(fullPath, screenshot, 'base64');
      logger.info(`Screenshot captured: ${fullPath}`);
      return fullPath;
    } catch (err) {
      logger.error(`Failed to capture screenshot: ${err.message}`);
      return null;
    }
  }
}
