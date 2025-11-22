import { User } from '../types';

export class QueueService {
  private pendingRequests: Map<number, Promise<User | null>>;

  constructor() {
    this.pendingRequests = new Map();
  }

  async enqueue(userId: number, fetchFn: (id: number) => Promise<User | null>): Promise<User | null> {
    // If there's already a pending request for this user ID, return that promise
    if (this.pendingRequests.has(userId)) {
      return this.pendingRequests.get(userId)!;
    }

    const promise = fetchFn(userId);

    // Store the promise in pending requests
    this.pendingRequests.set(userId, promise);

    // Remove from pending requests when done
    promise.finally(() => {
      this.pendingRequests.delete(userId);
    });

    return promise;
  }

  getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }
}