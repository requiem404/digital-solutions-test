interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestQueue {
  private pendingRequests: Map<string, PendingRequest<any>>;
  private readonly TTL = 60000;

  constructor() {
    this.pendingRequests = new Map();
    setInterval(() => this.cleanup(), 30000);
  }

  generateKey(method: string, url: string, params: any): string {
    const paramsStr = JSON.stringify(params || {});
    return `${method}:${url}:${paramsStr}`;
  }

  getOrCreate<T>(
    method: string,
    url: string,
    params: any,
    handler: () => Promise<T>
  ): Promise<T> {
    const key = this.generateKey(method, url, params);
    const existing = this.pendingRequests.get(key);

    if (existing && Date.now() - existing.timestamp < this.TTL) {
      return existing.promise as Promise<T>;
    }

    const promise = handler()
      .then((result) => {
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp >= this.TTL) {
        this.pendingRequests.delete(key);
      }
    }
  }

  clear(): void {
    this.pendingRequests.clear();
  }

  size(): number {
    return this.pendingRequests.size;
  }
}

export const requestQueue = new RequestQueue();

