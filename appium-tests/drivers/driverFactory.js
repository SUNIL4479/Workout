import { remote } from 'webdriverio';
import { config } from '../config/appium.config.js';

let driver = null;

export class DriverFactory {
  static async createDriver() {
    if (!driver) {
      driver = await remote(config);
    }
    return driver;
  }

  static getDriver() {
    if (!driver) {
      throw new Error('Driver has not been initialized. Call createDriver() first.');
    }
    return driver;
  }

  static async quitDriver() {
    if (driver) {
      await driver.deleteSession();
      driver = null;
    }
  }
}
