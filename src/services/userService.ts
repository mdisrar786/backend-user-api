import { User, CreateUserRequest } from '../types';

export class UserService {
  private users: Map<number, User>;
  private nextId: number;

  constructor() {
    this.users = new Map();
    this.nextId = 4;
    
    // Initialize with mock data
    const mockUsers = {
      1: { id: 1, name: "John Doe", email: "john@example.com" },
      2: { id: 2, name: "Jane Smith", email: "jane@example.com" },
      3: { id: 3, name: "Alice Johnson", email: "alice@example.com" }
    };

    Object.values(mockUsers).forEach(user => {
      this.users.set(user.id, user);
    });
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      // Simulate database delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const user = this.users.get(id);
      return user || null;
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      // Simulate database delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const newUser: User = {
        id: this.nextId++,
        ...userData
      };
      
      this.users.set(newUser.id, newUser);
      return newUser;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  getAllUsers(): User[] {
    try {
      return Array.from(this.users.values());
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }
}