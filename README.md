User Data API
A high-performance Express.js API with advanced caching, rate limiting, and async processing built with TypeScript.

🚀 Features
⚡ LRU Caching - 60-second TTL with auto cleanup

🛡️ Rate Limiting - 10 req/min + 5 req/10sec burst

🔀 Async Queue - Concurrent request handling

📊 Cache Stats - Real-time performance metrics

🔒 TypeScript - Full type safety


# Install & Run
git clone https://github.com/your-username/user-api-advanced.git
cd user-api-advanced
npm install
npm run dev

# Server starts at: http://localhost:3000

# API Documentation
📚 API Endpoints
Users
GET /users/:id - Get user (cached)

POST /users - Create user

GET /users - Get all users

# Cache
GET /cache-status - Cache statistics

DELETE /cache - Clear cache

DELETE /cache/:key - Remove specific cache

# System
GET / - API docs

GET /health - Health check

# 🏗️ Project Structure
text
src/
├── controllers/     # Route handlers
├── services/        # Cache, User, Queue services  
├── middleware/      # Rate limiting, error handling
├── types/          # TypeScript interfaces
└── app.ts          # Main app

# 📊 Performance
Cache Hits: 1-5ms response

Cache Misses: 200ms (simulated DB)

Concurrent Requests: Efficiently handled

Perfect for high-traffic applications! 🚀