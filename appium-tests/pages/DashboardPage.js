import { BasePage } from './BasePage.js';

export class DashboardPage extends BasePage {
  get welcomeText() { return this.findBySemanticsLabel('txt_welcome_message'); }
  get workoutCard() { return this.findByText('Generate AI Workout'); }
  get drawerButton() { return this.findByValueKey('btn_drawer'); }

  async isDisplayed() {
    const el = await this.welcomeText;
    return await el.isDisplayed();
  }
}
