export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  averageResponseTime: number;
  totalRequests: number;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}