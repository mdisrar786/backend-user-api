import { Request, Response } from 'express';
import { CacheService } from '../services/cacheService';
import { UserService } from '../services/userService';
import { QueueService } from '../services/queueService';
import { asyncHandler } from '../middleware/asyncHandler';
import { CreateUserRequest } from '../types';

export class UserController {
  private cacheService: CacheService;
  private userService: UserService;
  private queueService: QueueService;

  constructor(cacheService: CacheService, userService: UserService, queueService: QueueService) {
    this.cacheService = cacheService;
    this.userService = userService;
    this.queueService = queueService;
  }

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({
          error: 'Invalid user ID',
          message: 'User ID must be a valid number'
        });
      }

      // Check cache first
      const cacheKey = `user:${userId}`;
      const cachedData = this.cacheService.get(cacheKey);
      
      if (cachedData) {
        const responseTime = Date.now() - startTime;
        this.cacheService.updateStats(responseTime);
        
        return res.json({
          ...cachedData,
          source: 'cache',
          responseTime: `${responseTime}ms`
        });
      }

      // Use queue service to handle the database fetch
      const user = await this.queueService.enqueue(userId, this.userService.getUserById.bind(this.userService));
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: `User with ID ${userId} does not exist`
        });
      }

      // Cache the result
      this.cacheService.set(cacheKey, user, 60000);
      
      const responseTime = Date.now() - startTime;
      this.cacheService.updateStats(responseTime);

      res.json({
        ...user,
        source: 'database',
        responseTime: `${responseTime}ms`
      });
    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch user data'
      });
    }
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    try {
      const userData: CreateUserRequest = req.body;

      if (!userData.name || !userData.email) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Name and email are required'
        });
      }

      const newUser = await this.userService.createUser(userData);
      
      // Cache the new user
      const cacheKey = `user:${newUser.id}`;
      this.cacheService.set(cacheKey, newUser, 60000);

      res.status(201).json({
        ...newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Error in createUser:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create user'
      });
    }
  });

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    try {
      const users = this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch users'
      });
    }
  });
}