// Profile Mapping Endpoint
// Stores address -> FID/username/displayName/avatarUrl mappings
// Used for leaderboard profile enrichment via bulk endpoint

// In-memory storage (resets on restart, which is acceptable)
const ADDRESS_TO_PROFILE_MAP = new Map();

// Clean up old entries (older than 7 days) periodically
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function cleanupOldEntries() {
  const now = Date.now();
  const keysToDelete = [];
  
  for (const [key, value] of ADDRESS_TO_PROFILE_MAP.entries()) {
    if (value.updatedAt && (now - value.updatedAt) > MAX_AGE_MS) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => ADDRESS_TO_PROFILE_MAP.delete(key));
  if (keysToDelete.length > 0) {
    console.log(`[profile-mapping] Cleaned up ${keysToDelete.length} old entries`);
  }
}

// Run cleanup periodically
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldEntries, CLEANUP_INTERVAL_MS);
}

// Export for use in farcaster-profiles.js
export function getProfileMapping(address) {
  if (!address || typeof address !== 'string') return null;
  const key = address.toLowerCase();
  const mapping = ADDRESS_TO_PROFILE_MAP.get(key);
  if (!mapping) return null;
  
  // Check if expired
  if (mapping.updatedAt && (Date.now() - mapping.updatedAt) > MAX_AGE_MS) {
    ADDRESS_TO_PROFILE_MAP.delete(key);
    return null;
  }
  
  return mapping;
}

export function getAllFidMappings(addresses) {
  const result = new Map();
  
  for (const address of addresses) {
    if (!address || typeof address !== 'string') continue;
    const key = address.toLowerCase();
    const mapping = ADDRESS_TO_PROFILE_MAP.get(key);
    if (mapping && mapping.fid) {
      result.set(key, mapping.fid);
    }
  }
  
  return result;
}

export default async function handler(req, res) {
  // CORS headers for development
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { address, fid, username, displayName, avatarUrl } = req.body;

      if (!address || typeof address !== 'string') {
        return res.status(400).json({ error: 'Address required' });
      }

      if (!fid || (typeof fid !== 'number' && typeof fid !== 'string')) {
        return res.status(400).json({ error: 'FID required' });
      }

      const key = address.toLowerCase();
      ADDRESS_TO_PROFILE_MAP.set(key, {
        fid: String(fid),
        username: username && typeof username === 'string' ? username : null,
        displayName: displayName && typeof displayName === 'string' ? displayName : null,
        avatarUrl: avatarUrl && typeof avatarUrl === 'string' ? avatarUrl : null,
        updatedAt: Date.now()
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('[profile-mapping] POST error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { address } = req.query;

      if (!address || typeof address !== 'string') {
        return res.status(400).json({ error: 'Address required' });
      }

      const mapping = getProfileMapping(address);
      return res.status(200).json(mapping);
    } catch (error) {
      console.error('[profile-mapping] GET error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).json({ error: 'Method not allowed' });
}

