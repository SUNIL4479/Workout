import fs from 'fs';
import path from 'path';

export class SmartWidgetDiscovery {
  constructor(driver) {
    this.driver = driver;
  }

  async discoverAndAnalyzeScreen() {
    console.log('🤖 AI Module: Analyzing current screen hierarchy & widget tree...');
    const pageSource = await this.driver.getPageSource();
    
    const widgets = {
      inputs: [],
      buttons: [],
      dropdowns: [],
      checkboxes: [],
      cards: []
    };

    // Extract widgets via regex parsing of page source XML
    const inputMatches = pageSource.match(/class="[^"]*EditText[^"]*"/g) || [];
    const buttonMatches = pageSource.match(/class="[^"]*Button[^"]*"/g) || [];
    const checkMatches = pageSource.match(/class="[^"]*CheckBox[^"]*"/g) || [];

    widgets.inputs = inputMatches.map((_, i) => `Discovered_TextField_${i + 1}`);
    widgets.buttons = buttonMatches.map((_, i) => `Discovered_Button_${i + 1}`);
    widgets.checkboxes = checkMatches.map((_, i) => `Discovered_CheckBox_${i + 1}`);

    const scenarioSuite = this.generateTestScenarios(widgets);

    const outputDir = path.resolve('reports/ai-generated');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(outputDir, 'ai_discovered_scenarios.json'),
      JSON.stringify({ widgets, scenarios: scenarioSuite }, null, 2)
    );

    console.log(`✨ AI Module: Discovered ${widgets.inputs.length} inputs and ${widgets.buttons.length} buttons.`);
    console.log(`📁 AI Scenarios written to reports/ai-generated/ai_discovered_scenarios.json`);
    return { widgets, scenarios: scenarioSuite };
  }

  generateTestScenarios(widgets) {
    const scenarios = [];
    widgets.inputs.forEach((input) => {
      scenarios.push({
        id: `AI_TEST_${scenarios.length + 1}`,
        target: input,
        testType: 'Dynamic Form Validation',
        payloads: ['', 'invalid-email', '123', '<script>alert(1)</script>'],
        expected: 'Widget Validation Message Triggered'
      });
    });

    widgets.buttons.forEach((btn) => {
      scenarios.push({
        id: `AI_TEST_${scenarios.length + 1}`,
        target: btn,
        testType: 'Dynamic Navigation Discovery',
        action: 'Tap & Observe Hierarchy Shift',
        expected: 'Route Transition Detected'
      });
    });

    return scenarios;
  }
}
