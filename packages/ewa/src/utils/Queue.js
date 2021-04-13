class Queue {
  constructor(concurrency) {
    // 队列, 用数组来代替队列
    this._queue = [];

    // 并发数
    this._concurrency = concurrency || 8;

    // 当前并发数
    this._pendingCount = 0;
  }

  get concurrency() {
    return this._concurrency;
  }

  set concurrency(num) {
    this._concurrency = num;
    while (this._canProcessNext()) this._processQueue();
  }

  // 队列长度
  get size() {
    return this._queue.length;
  }

  // 队列是否为空
  isEmpty() {
    return this.size === 0;
  }

  _canProcessNext() {
    return this.size > 0 && this._pendingCount < this._concurrency;
  }

  // 处理队列
  _processQueue() {
    // 当前并发数大于最大并发数时, 不做任何操作
    if (!this._canProcessNext()) return Promise.resolve();

    // 执行队列下一个请求
    let next = this._queue.shift();

    // 如果队列为空，则什么都不做
    if (!next) return Promise.resolve();

    // pending +1
    this._pendingCount++;

    // 处理队列
    try {
      return Promise.resolve(next()).then(
        () => this._handleNext()
      ).catch((e) => {
        this._handleError(e, next);
        return this._handleNext();
      });
    } catch (e) {
      this._handleError(e, next);
      return this._handleNext();
    }
  }

  _handleNext() {
    // pending -1
    this._pendingCount--;

    // 继续处理队列
    return this._processQueue();
  }

  _handleError(e, fn) {
    const logError = (err = '') => {
      // eslint-disable-next-line
      console.log(`Error on executing ${fn.name}: ${err.message}`);
    };

    // 仅做错误信息打印，如需要做其他操作，可以覆盖 onError 方法
    if (typeof this.onError !== 'function') return logError(e);

    try {
      Promise.resolve(this.onError(e, fn)).catch(logError);
    } catch (err) {
      logError(err);
    }
  }

  // 加入队列
  enqueue(fn) {
    if (typeof fn !== 'function') throw new Error(`${fn} is not a valid function`);

    // 添加到队列
    this._queue.push(fn);

    // 尝试触发队列
    this._processQueue();

    return this;
  }

  // enqueue 方法别名
  push(fn) {
    return this.enqueue(fn);
  }

  // enqueue 方法别名
  add(fn) {
    return this.enqueue(fn);
  }
}

module.exports = Queue;
