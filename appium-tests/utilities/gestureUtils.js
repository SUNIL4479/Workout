export class GestureUtils {
  constructor(driver) {
    this.driver = driver;
  }

  async tap(element) {
    await element.click();
  }

  async doubleTap(element) {
    await this.driver.action('pointer')
      .move({ duration: 0, origin: element })
      .down({ button: 0 })
      .up({ button: 0 })
      .pause(100)
      .down({ button: 0 })
      .up({ button: 0 })
      .perform();
  }

  async longPress(element, durationMs = 1500) {
    await this.driver.action('pointer')
      .move({ duration: 0, origin: element })
      .down({ button: 0 })
      .pause(durationMs)
      .up({ button: 0 })
      .perform();
  }

  async swipe(startX, startY, endX, endY, durationMs = 800) {
    await this.driver.action('pointer')
      .move({ duration: 0, x: startX, y: startY })
      .down({ button: 0 })
      .pause(100)
      .move({ duration: durationMs, x: endX, y: endY })
      .up({ button: 0 })
      .perform();
  }

  async swipeUp() {
    const { width, height } = await this.driver.getWindowSize();
    await this.swipe(width / 2, height * 0.8, width / 2, height * 0.2);
  }

  async swipeDown() {
    const { width, height } = await this.driver.getWindowSize();
    await this.swipe(width / 2, height * 0.2, width / 2, height * 0.8);
  }

  async dragAndDrop(sourceElement, targetElement) {
    const sourceRect = await sourceElement.getBoundingRect();
    const targetRect = await targetElement.getBoundingRect();
    await this.swipe(sourceRect.x + 10, sourceRect.y + 10, targetRect.x + 10, targetRect.y + 10, 1000);
  }
}
