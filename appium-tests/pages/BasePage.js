import { logger } from '../utilities/logger.js';
import { GestureUtils } from '../utilities/gestureUtils.js';

export class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.gestures = new GestureUtils(driver);
  }

  // React Native Specific Locators
  async findByAccessibilityId(id) {
    return await this.driver.$(`~${id}`);
  }

  async findByValueKey(key) {
    return await this.driver.$(`//*[@resource-id="${key}" or @content-desc="${key}"]`);
  }

  async findByText(text) {
    return await this.driver.$(`//*[@text="${text}" or contains(@text, "${text}")]`);
  }

  async findBySemanticsLabel(label) {
    return await this.driver.$(`~${label}`);
  }

  async click(element) {
    logger.info(`Clicking element`);
    await element.waitForDisplayed({ timeout: 10000 });
    await element.click();
  }

  async setValue(element, value) {
    logger.info(`Setting value: "${value}"`);
    await element.waitForDisplayed({ timeout: 10000 });
    await element.setValue(value);
  }

  async getText(element) {
    await element.waitForDisplayed({ timeout: 10000 });
    return await element.getText();
  }

  async takeScreenshot(name) {
    const screenshot = await this.driver.takeScreenshot();
    return screenshot;
  }
}
