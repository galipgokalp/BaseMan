/**
 * Redis Test Endpoint
 * Tests Redis connection and profile mapping storage
 * DEV ONLY - Remove or protect in production
 */

import { saveProfileMapping, getProfileMapping, isRedisAvailable } from './_lib/redis-profiles.js';
import { runAppLogStoreSmoke } from './_lib/app-log-store.js';
import { createLogger } from "../src/utils/logger.js";
import { denyInProduction } from './_lib/request-policy.js';

const log = createLogger("ApiTestRedis");

export default async function handler(req, res) {
  const denied = denyInProduction(res, 'TEST_REDIS_ENABLE_IN_PRODUCTION', 'test-redis');
  if (denied) {
    return denied;
  }

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
        // Check all possible Redis environment variables
        const envVars = {
          UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'Not set',
          UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set' : 'Not set',
          REDIS_URL: process.env.REDIS_URL ? 'Set' : 'Not set',
          UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL ? 'Set' : 'Not set',
          UPSTASH_REDIS_TOKEN: process.env.UPSTASH_REDIS_TOKEN ? 'Set' : 'Not set'
        };

        // Try a simple Redis operation to verify it's actually working
        let testResult = null;
        try {
          const { getProfileMapping } = await import('./_lib/redis-profiles.js');
          // Test with a dummy address to see if Redis responds
          const _testMapping = await getProfileMapping('0x0000000000000000000000000000000000000000');
          testResult = {
            operation: 'get',
            success: true,
            note: 'This is expected to return null for non-existent key'
          };
        } catch (testError) {
          testResult = {
            operation: 'get',
            success: false,
            error: testError?.message || 'Unknown error'
          };
        }

        const appLogSmoke = await runAppLogStoreSmoke();

        return res.status(200).json({
          success: true,
          redisAvailable: true,
          message: 'Redis is available and ready',
          environmentVariables: envVars,
          redisTest: testResult,
          appLogStoreSmoke: appLogSmoke,
          note: 'If Redis.fromEnv() succeeded, Redis is configured correctly even if env vars show "Not set"'
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
    log.error('handler error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error',
      redisAvailable: isRedisAvailable(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
