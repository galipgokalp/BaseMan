import { Redis } from '@upstash/redis';

// Redis client (environment variables'dan otomatik alır)
// Vercel Marketplace'ten Upstash Redis eklendiğinde otomatik olarak eklenir:
// - UPSTASH_REDIS_REST_URL (standard)
// - UPSTASH_REDIS_REST_TOKEN (standard)
// - REDIS_URL (Vercel integration format, Redis.fromEnv() handles both)
let redis = null;

try {
  // Check if environment variables exist before initializing
  const hasStandardVars = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  const hasRedisUrl = !!process.env.REDIS_URL;
  
  if (hasStandardVars || hasRedisUrl) {
    redis = Redis.fromEnv();
    console.log('[redis-profiles] Redis client initialized', {
      hasStandardVars,
      hasRedisUrl,
      method: hasStandardVars ? 'standard' : (hasRedisUrl ? 'REDIS_URL' : 'unknown')
    });
  } else {
    console.log('[redis-profiles] Redis environment variables not found, will use in-memory fallback');
    redis = null;
  }
} catch (error) {
  console.warn('[redis-profiles] Redis client initialization failed (will fallback to in-memory):', error?.message || error);
  redis = null;
}

// Key prefix
const PROFILE_KEY_PREFIX = 'profile:';
const PROFILE_TTL = 7 * 24 * 60 * 60; // 7 gün (saniye cinsinden)

/**
 * Redis kullanılabilir mi?
 */
export function isRedisAvailable() {
  return redis !== null;
}

/**
 * Profil mapping'i Redis'e kaydet
 * @param {string} address - Ethereum address (lowercase)
 * @param {object} mapping - Profile mapping object
 * @returns {Promise<boolean>} - Success
 */
export async function saveProfileMapping(address, mapping) {
  if (!address || !mapping || !mapping.fid) {
    console.log('[redis-profiles] saveProfileMapping: Invalid input');
    return false;
  }
  
  if (!isRedisAvailable()) {
    console.log('[redis-profiles] saveProfileMapping: Redis not available, skipping');
    return false;
  }
  
  const key = `${PROFILE_KEY_PREFIX}${address.toLowerCase()}`;
  const value = {
    fid: String(mapping.fid),
    username: mapping.username || null,
    displayName: mapping.displayName || null,
    avatarUrl: mapping.avatarUrl || null,
    platform: mapping.platform && (mapping.platform === 'farcaster' || mapping.platform === 'base-app') ? mapping.platform : null,
    updatedAt: Date.now()
  };
  
  try {
    await redis.set(key, JSON.stringify(value), { ex: PROFILE_TTL });
    console.log(`[redis-profiles] ✅ Saved profile mapping for ${address.toLowerCase()} (FID: ${value.fid})`);
    return true;
  } catch (error) {
    console.error(`[redis-profiles] ❌ Failed to save profile mapping for ${address.toLowerCase()}:`, error?.message || error);
    return false;
  }
}

/**
 * Redis'ten profil mapping'i oku
 * @param {string} address - Ethereum address
 * @returns {Promise<object|null>} - Profile mapping or null
 */
export async function getProfileMapping(address) {
  if (!address || typeof address !== 'string') {
    return null;
  }
  
  if (!isRedisAvailable()) {
    return null;
  }
  
  const key = `${PROFILE_KEY_PREFIX}${address.toLowerCase()}`;
  
  try {
    const data = await redis.get(key);
    if (!data) {
      return null;
    }
    
    const mapping = typeof data === 'string' ? JSON.parse(data) : data;
    
    // TTL kontrolü (Redis otomatik yapar ama double-check)
    if (mapping.updatedAt && (Date.now() - mapping.updatedAt) > (PROFILE_TTL * 1000)) {
      await redis.del(key); // Expired, sil
      return null;
    }
    
    return mapping;
  } catch (error) {
    console.error(`[redis-profiles] ❌ Failed to get profile mapping for ${address.toLowerCase()}:`, error?.message || error);
    return null;
  }
}

/**
 * Birden fazla adres için profil mapping'leri toplu oku
 * @param {string[]} addresses - Array of Ethereum addresses
 * @returns {Promise<Map>} - Map of address -> profile mapping
 */
export async function getProfileMappings(addresses) {
  if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
    return new Map();
  }
  
  if (!isRedisAvailable()) {
    return new Map();
  }
  
  // Normalize ve filtreleme
  const normalizedAddresses = addresses
    .filter(addr => addr && typeof addr === 'string')
    .map(addr => addr.toLowerCase());
  
  if (normalizedAddresses.length === 0) {
    return new Map();
  }
  
  // Redis key'lerini oluştur
  const keys = normalizedAddresses.map(addr => `${PROFILE_KEY_PREFIX}${addr}`);
  
  try {
    // Toplu okuma (MGET)
    const values = await redis.mget(...keys);
    const results = new Map();
    
    for (let i = 0; i < keys.length; i++) {
      const address = normalizedAddresses[i];
      const data = values[i];
      
      if (data) {
        try {
          const mapping = typeof data === 'string' ? JSON.parse(data) : data;
          
          // TTL kontrolü
          if (mapping.updatedAt && (Date.now() - mapping.updatedAt) <= (PROFILE_TTL * 1000)) {
            results.set(address, mapping);
          } else {
            // Expired, Redis'ten sil (async, await etmeye gerek yok)
            redis.del(keys[i]).catch(() => {});
          }
        } catch (parseError) {
          console.warn(`[redis-profiles] Failed to parse mapping for ${address}:`, parseError?.message || parseError);
        }
      }
    }
    
    if (results.size > 0) {
      console.log(`[redis-profiles] ✅ Retrieved ${results.size} profile mapping(s) from Redis`);
    }
    
    return results;
  } catch (error) {
    console.error(`[redis-profiles] ❌ Failed to get profile mappings:`, error?.message || error);
    return new Map();
  }
}

/**
 * Birden fazla adres için FID mapping'leri toplu oku
 * @param {string[]} addresses - Array of Ethereum addresses
 * @returns {Promise<Map>} - Map of address (lowercase) -> FID
 */
export async function getFidMappings(addresses) {
  const profileMappings = await getProfileMappings(addresses);
  const result = new Map();
  
  for (const [address, mapping] of profileMappings) {
    if (mapping && mapping.fid) {
      result.set(address, mapping.fid);
    }
  }
  
  return result;
}

/**
 * Get cached profiles for given addresses.
 * @param {string[]} addresses - lowercase addresses
 * @returns {Promise<Object<string, Profile | undefined>>}
 */
export async function getProfilesForAddresses(addresses) {
  if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
    return {};
  }

  if (!isRedisAvailable()) {
    return {};
  }

  // Normalize addresses
  const normalizedAddresses = addresses
    .filter(addr => addr && typeof addr === 'string')
    .map(addr => addr.toLowerCase());

  if (normalizedAddresses.length === 0) {
    return {};
  }

  // Use existing getProfileMappings function
  try {
    const mappings = await getProfileMappings(normalizedAddresses);
    const result = {};

    for (const [address, mapping] of mappings) {
      if (mapping && (mapping.username || mapping.displayName || mapping.avatarUrl || mapping.fid)) {
        result[address] = {
          fid: mapping.fid || null,
          username: mapping.username || null,
          displayName: mapping.displayName || null,
          avatarUrl: mapping.avatarUrl || null,
          profileUrl: mapping.username
            ? `https://warpcast.com/${mapping.username}`
            : mapping.fid
            ? `https://warpcast.com/~/users/${mapping.fid}`
            : null,
          platform: mapping.platform && (mapping.platform === 'farcaster' || mapping.platform === 'base-app') ? mapping.platform : null,
          provider: 'redis'
        };
      }
    }

    console.log("[DEBUG] Redis GET:", {
      requested: normalizedAddresses,
      found: Object.keys(result)
    });

    return result;
  } catch (error) {
    console.error('[redis-profiles] getProfilesForAddresses error:', error?.message || error);
    return {};
  }
}

/**
 * Cache multiple profiles in Redis.
 * @param {Object<string, Profile>} profilesByAddress
 * @returns {Promise<void>}
 */
export async function setProfilesForAddresses(profilesByAddress) {
  if (!profilesByAddress || typeof profilesByAddress !== 'object') {
    return;
  }

  if (!isRedisAvailable()) {
    return;
  }

  const entries = Object.entries(profilesByAddress);
  if (entries.length === 0) {
    return;
  }

  console.log("[DEBUG] Redis SET keys:", Object.keys(profilesByAddress));

  // Use pipelining for batch operations
  try {
    const pipeline = [];
    let savedCount = 0;

    for (const [address, profile] of entries) {
      if (!address || !profile || typeof address !== 'string') {
        continue;
      }

      const key = `${PROFILE_KEY_PREFIX}${address.toLowerCase()}`;
      const value = {
        fid: profile.fid || null,
        username: profile.username || null,
        displayName: profile.displayName || null,
        avatarUrl: profile.avatarUrl || null,
        platform: profile.platform && (profile.platform === 'farcaster' || profile.platform === 'base-app') ? profile.platform : null,
        updatedAt: Date.now()
      };

      // Only save if we have at least fid or username/displayName/avatarUrl
      if (value.fid || value.username || value.displayName || value.avatarUrl) {
        pipeline.push(redis.set(key, JSON.stringify(value), { ex: PROFILE_TTL }));
        savedCount++;
      }
    }

    if (pipeline.length > 0) {
      await Promise.allSettled(pipeline);
      console.log(`[redis-profiles] ✅ Cached ${savedCount} profile(s) in Redis`);
    }
  } catch (error) {
    console.error('[redis-profiles] setProfilesForAddresses error:', error?.message || error);
  }
}

