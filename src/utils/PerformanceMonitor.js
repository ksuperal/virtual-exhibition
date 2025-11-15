export class PerformanceMonitor {
  constructor() {
    this.enabled = false; // Set to true for development
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.displayElement = null;

    if (this.enabled) {
      this.createDisplay();
    }
  }

  createDisplay() {
    this.displayElement = document.createElement('div');
    this.displayElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #0f0;
      font-family: monospace;
      font-size: 14px;
      padding: 10px;
      border-radius: 5px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(this.displayElement);
  }

  update() {
    if (!this.enabled) return;

    this.frameCount++;
    const currentTime = performance.now();
    const delta = currentTime - this.lastTime;

    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastTime = currentTime;

      this.updateDisplay();
    }
  }

  updateDisplay() {
    if (!this.displayElement) return;

    const memory = performance.memory
      ? `${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB`
      : 'N/A';

    const fpsColor = this.fps >= 50 ? '#0f0' : this.fps >= 30 ? '#ff0' : '#f00';

    this.displayElement.innerHTML = `
      <div>FPS: <span style="color: ${fpsColor}">${this.fps}</span></div>
      <div>Memory: ${memory}</div>
    `;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      if (!this.displayElement) {
        this.createDisplay();
      }
      this.displayElement.style.display = 'block';
    } else if (this.displayElement) {
      this.displayElement.style.display = 'none';
    }
  }
}
