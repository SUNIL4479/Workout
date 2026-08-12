import { By } from 'selenium-webdriver';
import { BasePage } from './BasePage.js';

export class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = By.name('email');
    this.passwordInput = By.name('password');
    this.submitBtn = By.css('button[type="submit"]');
    this.errorMessage = By.className('error-msg');
  }

  async login(email, password) {
    if (email) await this.type(this.emailInput, email);
    if (password) await this.type(this.passwordInput, password);
    await this.click(this.submitBtn);
  }

  async getValidationMessage() {
    return await this.getText(this.errorMessage);
  }
}
