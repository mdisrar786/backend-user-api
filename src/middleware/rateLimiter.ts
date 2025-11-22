import rateLimit from 'express-rate-limit';

export const createRateLimiter = () => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
      error: 'Too many requests',
      message: 'Maximum of 10 requests per minute allowed. Please try again later.',
      retryAfter: '60 seconds'
    },
    standardHeaders: true,
    legacyHeaders: false,
    
    // Custom handler for rate limit exceeded
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Maximum of 10 requests per minute allowed. Please try again later.',
        retryAfter: 60
      });
    }
  });
};

// Additional burst protection
export const burstRateLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 5, // Maximum 5 requests in 10 seconds
  message: {
    error: 'Too many requests',
    message: 'Too many requests in a short period. Please slow down.',
    retryAfter: '10 seconds'
  },
  standardHeaders: true,
  legacyHeaders: false
});