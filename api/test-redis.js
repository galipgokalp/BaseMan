/**
 * Redis Test Endpoint
 * Tests Redis connection and profile mapping storage
 * DEV ONLY - Remove or protect in production
 */

import { saveProfileMapping, getProfileMapping, isRedisAvailable } from './_lib/redis-profiles.js';

export default async function handler(req, res) {
  // Only allow GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Redis is available
    const available = isRedisAvailable();
    
    if (!available) {
      return res.status(200).json({
        success: false,
        message: 'Redis is not available',
        redisAvailable: false,
        environmentVariables: {
          UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'Not set',
          UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set' : 'Not set',
          REDIS_URL: process.env.REDIS_URL ? 'Set' : 'Not set'
        }
      });
    }

    // Test operations
    if (req.method === 'POST') {
      // Test save operation
      const { address, mapping } = req.body;
      
      if (!address || !mapping) {
        return res.status(400).json({ error: 'address and mapping required' });
      }

      const saved = await saveProfileMapping(address, mapping);
      
      return res.status(200).json({
        success: true,
        redisAvailable: true,
        operation: 'save',
        saved,
        testAddress: address
      });
    } else {
      // Test get operation
      const { address } = req.query;
      
      if (!address) {
        return res.status(200).json({
          success: true,
          redisAvailable: true,
          message: 'Redis is available and ready',
          environmentVariables: {
            UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'Not set',
            UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set' : 'Not set'
          }
        });
      }

      const mapping = await getProfileMapping(address);
      
      return res.status(200).json({
        success: true,
        redisAvailable: true,
        operation: 'get',
        address,
        mapping
      });
    }
  } catch (error) {
    console.error('[test-redis] Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error',
      redisAvailable: isRedisAvailable(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

