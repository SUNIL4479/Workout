import fs from 'fs';
import path from 'path';

export class RouteScanner {
  static scanReactRoutesAndForms() {
    console.log('🔍 Scanning React routes and form components...');
    const srcDir = path.resolve('../frontend/src');
    const discoveredForms = [];

    function walkDir(dir) {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('<form') || content.includes('<input') || content.includes('type="')) {
            const inputs = [];
            const inputRegex = /<input[^>]*name=["']([^"']+)["'][^>]*>/g;
            let match;
            while ((match = inputRegex.exec(content)) !== null) {
              const inputTag = match[0];
              inputs.push({
                name: match[1],
                required: inputTag.includes('required'),
                type: inputTag.includes('type="email"') ? 'email' : inputTag.includes('type="password"') ? 'password' : 'text',
                minLength: (inputTag.match(/minLength=\{?(\d+)\}?/) || [])[1] || 1
              });
            }
            if (inputs.length > 0) {
              discoveredForms.push({
                file: path.relative(srcDir, fullPath),
                inputs
              });
            }
          }
        }
      }
    }

    walkDir(srcDir);

    const generatedTests = [];
    discoveredForms.forEach((form, fIdx) => {
      form.inputs.forEach((input, iIdx) => {
        generatedTests.push({
          id: `DYN_TEST_${fIdx + 1}_${iIdx + 1}`,
          component: form.file,
          inputName: input.name,
          inputType: input.type,
          scenarios: [
            { name: 'Empty Required Field', value: '', expected: 'Validation Error Triggered' },
            { name: 'Invalid Type Payload', value: input.type === 'email' ? 'notanemail' : '12', expected: 'Type Mismatch Error' },
            { name: 'Valid Input Scenario', value: input.type === 'email' ? 'test@fitify.com' : 'ValidValue123!', expected: 'Field Accepted' }
          ]
        });
      });
    });

    const outDir = path.resolve('reports/dynamic');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'dynamic_form_tests.json'), JSON.stringify(generatedTests, null, 2));

    console.log(`✅ Discovered ${discoveredForms.length} form components with ${generatedTests.length} test cases.`);
    return generatedTests;
  }
}

if (process.argv[1] && process.argv[1].includes('routeScanner.js')) {
  RouteScanner.scanReactRoutesAndForms();
}
