/**
 * 浏览器错误监控和上报
 * 自动捕获 JavaScript 错误、Promise 拒绝、console.error/warn
 * 并发送到后端监控系统
 */

class BrowserErrorMonitor {
  constructor(options = {}) {
    this.apiBaseUrl = options.apiBaseUrl || (process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000');
    this.enabled = options.enabled !== false;
    this.sampleRate = options.sampleRate || 1.0; // 采样率 1.0 = 100%
    this.maxQueueSize = options.maxQueueSize || 100;
    this.errorQueue = [];
    this.isOnline = navigator.onLine;

    this.init();
  }

  init() {
    if (!this.enabled) return;

    // 监听网络状态
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // 捕获 JavaScript 运行时错误
    window.addEventListener('error', (event) => this.handleError(event));

    // 捕获未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => this.handleRejection(event));

    // 拦截 console 方法
    this.interceptConsole();

    // 捕获资源加载错误
    window.addEventListener('error', (event) => this.handleResourceError(event), true);

    // 页面卸载时发送队列中的错误
    window.addEventListener('beforeunload', () => this.flush());

    // 定期发送队列中的错误
    setInterval(() => this.flush(), 5000); // 每 5 秒发送一次
  }

  /**
   * 捕获 JavaScript 运行时错误
   */
  handleError(event) {
    if (!this.shouldSample()) return;

    const error = {
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack || event.error?.toString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    this.sendError(error);
  }

  /**
   * 捕获未处理的 Promise 拒绝
   */
  handleRejection(event) {
    if (!this.shouldSample()) return;

    const error = {
      message: event.reason?.message || String(event.reason),
      source: 'Promise',
      lineno: 0,
      colno: 0,
      error: event.reason?.stack || String(event.reason),
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    this.sendError(error);
  }

  /**
   * 捕获资源加载错误（图片、脚本等）
   */
  handleResourceError(event) {
    if (!event.target || !event.target.src) return;

    const error = {
      message: `Failed to load resource: ${event.target.src}`,
      source: event.target.tagName,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    this.sendError(error);
  }

  /**
   * 拦截 console 方法
   */
  interceptConsole() {
    const levels = ['error', 'warn'];
    const originalConsole = {};

    levels.forEach(level => {
      originalConsole[level] = console[level];
      console[level] = (...args) => {
        // 调用原始方法
        originalConsole[level](...args);

        // 发送到监控系统
        if (this.shouldSample()) {
          this.sendConsoleLog(level, args);
        }
      };
    });
  }

  /**
   * 发送错误到后端
   */
  async sendError(error) {
    if (!this.isOnline) {
      this.errorQueue.push({ type: 'error', data: error });
      return;
    }

    try {
      await fetch(`${this.apiBaseUrl}/api/monitoring/browser/error`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error)
      });
    } catch (err) {
      // 网络失败，加入队列
      this.errorQueue.push({ type: 'error', data: error });
      this.trimQueue();
    }
  }

  /**
   * 发送控制台日志到后端
   */
  async sendConsoleLog(level, args) {
    if (!this.isOnline) {
      this.errorQueue.push({ type: 'console', data: { level, args } });
      return;
    }

    try {
      await fetch(`${this.apiBaseUrl}/api/monitoring/browser/console`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          args: args.map(arg => this.serializeArg(arg)),
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      this.errorQueue.push({ type: 'console', data: { level, args } });
      this.trimQueue();
    }
  }

  /**
   * 序列化参数（处理对象、DOM 元素等）
   */
  serializeArg(arg) {
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'number' || typeof arg === 'boolean') return arg;
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';

    try {
      if (arg instanceof Error) {
        return arg.stack || arg.toString();
      }
      if (arg instanceof HTMLElement) {
        return arg.outerHTML?.substring(0, 200) || arg.tagName;
      }
      // 限制对象序列化大小
      const json = JSON.stringify(arg);
      return json?.length > 500 ? json.substring(0, 500) + '...' : json;
    } catch {
      return String(arg);
    }
  }

  /**
   * 采样检查
   */
  shouldSample() {
    return Math.random() < this.sampleRate;
  }

  /**
   * 网络恢复时发送队列中的错误
   */
  handleOnline() {
    this.isOnline = true;
    this.flush();
  }

  /**
   * 网络断开时
   */
  handleOffline() {
    this.isOnline = false;
  }

  /**
   * 发送队列中的错误
   */
  async flush() {
    if (this.errorQueue.length === 0 || !this.isOnline) return;

    const queue = [...this.errorQueue];
    this.errorQueue = [];

    for (const item of queue) {
      if (item.type === 'error') {
        await this.sendError(item.data);
      } else if (item.type === 'console') {
        await this.sendConsoleLog(item.data.level, item.data.args);
      }
    }
  }

  /**
   * 限制队列大小
   */
  trimQueue() {
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
    }
  }

  /**
   * 手动上报错误
   */
  reportError(message, extra = {}) {
    const error = {
      message,
      source: extra.source || 'manual',
      lineno: extra.lineno,
      colno: extra.colno,
      error: extra.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    this.sendError(error);
  }
}

// 创建全局实例
const browserErrorMonitor = new BrowserErrorMonitor({
  enabled: process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENABLE_ERROR_MONITORING === 'true',
  sampleRate: 1.0
});

export default browserErrorMonitor;
