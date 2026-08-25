import { BasePage } from './BasePage.js';

export class LoginPage extends BasePage {
  get emailInput() { return this.findByAccessibilityId('input_email'); }
  get passwordInput() { return this.findByAccessibilityId('input_password'); }
  get loginButton() { return this.findByValueKey('btn_login'); }
  get errorMessage() { return this.findByAccessibilityId('txt_error_message'); }

  async login(email, password) {
    if (email !== undefined) await this.setValue(await this.emailInput, email);
    if (password !== undefined) await this.setValue(await this.passwordInput, password);
    await this.click(await this.loginButton);
  }

  async getValidationMessage() {
    return await this.getText(await this.errorMessage);
  }
}
