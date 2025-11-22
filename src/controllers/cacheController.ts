import { Request, Response } from 'express';
import { CacheService } from '../services/cacheService';
import { asyncHandler } from '../middleware/asyncHandler';

export class CacheController {
  private cacheService: CacheService;

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  clearCache = asyncHandler(async (req: Request, res: Response) => {
    this.cacheService.clear();
    
    res.json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  });

  getCacheStatus = asyncHandler(async (req: Request, res: Response) => {
    const stats = this.cacheService.getStats();
    
    res.json({
      ...stats,
      hitRate: stats.totalRequests > 0 ? (stats.hits / stats.totalRequests) * 100 : 0,
      timestamp: new Date().toISOString()
    });
  });

  deleteCacheEntry = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({
        error: 'Cache key is required'
      });
    }

    const deleted = this.cacheService.delete(key);
    
    if (deleted) {
      res.json({
        message: `Cache entry '${key}' deleted successfully`
      });
    } else {
      res.status(404).json({
        error: 'Cache entry not found',
        message: `No cache entry found for key '${key}'`
      });
    }
  });
}