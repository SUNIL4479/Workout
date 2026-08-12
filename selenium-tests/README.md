# FitiFi Selenium Web E2E Automation Framework

Enterprise-grade End-to-End (E2E) Selenium automation framework with **Dynamic Route & Form Discovery** built with Node.js, Selenium WebDriver, Mocha, Chai, Mochawesome, Winston Logger, and ExcelJS.

## Features
- **Dynamic Route & Form Scanner**: Automatically parses React routes and form components to dynamically build test cases from validation rules.
- **Cross-Browser & Multi-Mode**: Supports Headed and Headless execution on Google Chrome, Firefox, and Edge.
- **Enterprise Reporting**: Excel Report (`E2E_Report.xlsx`) with 4 distinct analytical sheets + Mochawesome HTML report.
- **CI/CD Integration**: Integrated with GitHub Actions (`.github/workflows/selenium-e2e.yml`).

## Quick Start
```bash
cd selenium-tests
npm install
npm run scan-routes
npm test
```
