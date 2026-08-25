import { By, until } from 'selenium-webdriver';
import { WaitUtils } from '../utilities/waitUtils.js';
import { logger } from '../utilities/logger.js';

export class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo(url) {
    logger.info(`Navigating to URL: ${url}`);
    await this.driver.get(url);
  }

  async findElement(by) {
    return await WaitUtils.waitForElementVisible(this.driver, by);
  }

  async click(by) {
    logger.info(`Clicking element: ${by.toString()}`);
    const el = await WaitUtils.waitForElementClickable(this.driver, by);
    await WaitUtils.scrollToElement(this.driver, el);
    await el.click();
  }

  async type(by, text) {
    logger.info(`Typing text into: ${by.toString()}`);
    const el = await this.findElement(by);
    await el.clear();
    await el.sendKeys(text);
  }

  async getText(by) {
    const el = await this.findElement(by);
    return await el.getText();
  }
}
