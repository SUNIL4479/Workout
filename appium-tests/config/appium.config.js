import path from 'path';

export const config = {
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  path: '/',
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.ANDROID_VERSION || '13.0',
    'appium:app': process.env.APK_PATH || path.resolve(process.cwd(), 'app/app-release.apk'),
    'appium:appPackage': process.env.APP_PACKAGE || 'com.fitify.app',
    'appium:appActivity': process.env.APP_ACTIVITY || 'com.fitify.app.MainActivity',
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 180,
    'appium:noReset': false
  }
};
