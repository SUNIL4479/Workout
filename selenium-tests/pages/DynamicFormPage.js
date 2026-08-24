import { By } from 'selenium-webdriver';
import { BasePage } from './BasePage.js';

export class DynamicFormPage extends BasePage {
  async fillDynamicField(fieldName, value) {
    const locator = By.name(fieldName);
    await this.type(locator, value);
  }

  async submitForm() {
    const locator = By.css('button[type="submit"], input[type="submit"]');
    await this.click(locator);
  }
}
