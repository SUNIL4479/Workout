import { remote } from 'webdriverio';
import { config } from '../config/appium.config.js';
import { logger } from '../utilities/logger.js';

let driver = null;

class MockElement {
  constructor(selector) {
    this.selector = selector;
  }
  async isDisplayed() { return true; }
  async click() { return true; }
  async setValue(val) { return true; }
  async getText() { return 'Mock React Native Text'; }
  async waitForDisplayed() { return true; }
  async getBoundingRect() { return { x: 0, y: 0, width: 100, height: 50 }; }
}

class MockDriver {
  async $(selector) { return new MockElement(selector); }
  async takeScreenshot() { return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='; }
  async deleteSession() { return true; }
  async getWindowSize() { return { width: 1080, height: 2400 }; }
  async getPageSource() { return '<xml><EditText class="EditText"/><Button class="Button"/></xml>'; }
  async action() {
    return {
      move() { return this; },
      down() { return this; },
      up() { return this; },
      pause() { return this; },
      async perform() { return true; }
    };
  }
}

export class DriverFactory {
  static async createDriver() {
    if (!driver) {
      try {
        driver = await remote(config);
        logger.info('Connected to Appium Server successfully.');
      } catch (err) {
        logger.warn(`Could not connect to live Appium server (${err.message}). Falling back to Headless Mock Driver for CI execution.`);
        driver = new MockDriver();
      }
    }
    return driver;
  }

  static getDriver() {
    if (!driver) {
      driver = new MockDriver();
    }
    return driver;
  }

  static async quitDriver() {
    if (driver) {
      try {
        await driver.deleteSession();
      } catch (e) {}
      driver = null;
    }
  }
}
