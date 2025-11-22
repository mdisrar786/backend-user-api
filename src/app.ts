import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { CacheService } from './services/cacheService';
import { UserService } from './services/userService';
import { QueueService } from './services/queueService';
import { UserController } from './controllers/userController';
import { CacheController } from './controllers/cacheController';
import { createRateLimiter, burstRateLimiter } from './middleware/rateLimiter';

class App {
  public app: express.Application;
  private cacheService: CacheService;
  private userService: UserService;
  private queueService: QueueService;

  constructor() {
    this.app = express();
    this.cacheService = new CacheService(100);
    this.userService = new UserService();
    this.queueService = new QueueService();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    
    // Apply rate limiting to all routes
    this.app.use(createRateLimiter());
    
    // Apply burst protection to specific endpoints
    this.app.use('/users/:id', burstRateLimiter);
  }

  private initializeRoutes(): void {
    const userController = new UserController(this.cacheService, this.userService, this.queueService);
    const cacheController = new CacheController(this.cacheService);

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Welcome to User Data API',
        version: '1.0.0',
        endpoints: {
          users: {
            'GET /users/:id': 'Get user by ID',
            'POST /users': 'Create new user',
            'GET /users': 'Get all users'
          },
          cache: {
            'GET /cache-status': 'Get cache statistics',
            'DELETE /cache': 'Clear entire cache',
            'DELETE /cache/:key': 'Delete specific cache entry'
          },
          system: {
            'GET /health': 'Health check'
          }
        },
        timestamp: new Date().toISOString()
      });
    });

    // User routes
    this.app.get('/users/:id', userController.getUserById);
    this.app.post('/users', userController.createUser);
    this.app.get('/users', userController.getAllUsers);

    // Cache management routes
    this.app.delete('/cache', cacheController.clearCache);
    this.app.get('/cache-status', cacheController.getCacheStatus);
    this.app.delete('/cache/:key', cacheController.deleteCacheEntry);

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        message: `Route ${req.originalUrl} does not exist`
      });
    });

    // Global error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('🚨 Global Error Handler:', error);
      console.error('Stack:', error.stack);
      
      res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong on our end',
        timestamp: new Date().toISOString()
      });
    });
  }

  public start(port: number): void {
    const server = this.app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('🔗 Available endpoints:');
      console.log('  GET  /');
      console.log('  GET  /users/:id');
      console.log('  POST /users');
      console.log('  GET  /users');
      console.log('  GET  /cache-status');
      console.log('  DELETE /cache');
      console.log('  DELETE /cache/:key');
      console.log('  GET  /health');
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('🚨 Server error:', error);
    });
  }

  public shutdown(): void {
    this.cacheService.destroy();
    console.log('Application shutdown gracefully');
  }
}

// Start the application
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const app = new App();

try {
  app.start(PORT);
} catch (error) {
  console.error('🚨 Failed to start server:', error);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  app.shutdown();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  app.shutdown();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;