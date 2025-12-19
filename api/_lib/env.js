/**
 * Environment Variables Validation Module
 * 
 * Provides type-safe, validated access to environment variables with clear error messages.
 * Validates on first access (lazy initialization) to avoid heavy work per request.
 */

import { ethers } from "ethers";

// ============================================
// Validation Helpers
// ============================================

/**
 * Validates a non-empty string
 */
function validateString(value, name, context = null) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(
      `Environment variable ${name} must be a non-empty string` +
      (context ? ` (used in: ${context})` : '') +
      `\n  Example: ${name}=your_value_here`
    );
  }
  return value.trim();
}

/**
 * Validates a boolean value
 * Accepts: "true", "false", "1", "0", "yes", "no" (case-insensitive)
 * Returns undefined if value is undefined, null, or empty string after trim
 */
function validateBoolean(value, name, context = null) {
  if (value === undefined || value === null) {
    return undefined;
  }
  const str = String(value).trim();
  // Return undefined for empty strings (after trim)
  if (str.length === 0) {
    return undefined;
  }
  const normalized = str.toLowerCase();
  const truthy = ['true', '1', 'yes', 'on'];
  const falsy = ['false', '0', 'no', 'off'];
  
  if (truthy.includes(normalized)) return true;
  if (falsy.includes(normalized)) return false;
  
  throw new Error(
    `Environment variable ${name} must be a boolean` +
    (context ? ` (used in: ${context})` : '') +
    `\n  Accepted values: true, false, 1, 0, yes, no, on, off` +
    `\n  Example: ${name}=true`
  );
}

/**
 * Validates a finite number with optional min/max
 */
function validateNumber(value, name, options = {}) {
  const { min, max, context } = options;
  if (value === undefined || value === null) {
    return undefined;
  }
  
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(
      `Environment variable ${name} must be a finite number` +
      (context ? ` (used in: ${context})` : '') +
      `\n  Example: ${name}=100`
    );
  }
  
  if (min !== undefined && num < min) {
    throw new Error(
      `Environment variable ${name} must be >= ${min}` +
      (context ? ` (used in: ${context})` : '') +
      `\n  Current value: ${num}`
    );
  }
  
  if (max !== undefined && num > max) {
    throw new Error(
      `Environment variable ${name} must be <= ${max}` +
      (context ? ` (used in: ${context})` : '') +
      `\n  Current value: ${num}`
    );
  }
  
  return num;
}

/**
 * Validates a valid absolute URL
 */
function validateUrl(value, name, context = null, options = {}) {
  if (value === undefined || value === null) {
    return undefined;
  }
  
  const str = String(value).trim();
  if (str.length === 0) {
    return undefined;
  }
  
  const protocols = Array.isArray(options.protocols) && options.protocols.length > 0
    ? options.protocols
    : ['http:', 'https:'];
  const protocolList = protocols.join(', ');
  const exampleProtocol = protocols[0] || 'https:';
  const example = `${exampleProtocol}//api.example.com/v1`;

  try {
    const url = new URL(str);
    if (!protocols.includes(url.protocol)) {
      throw new Error('URL must use http or https protocol');
    }
    return str;
  } catch (error) {
    throw new Error(
      `Environment variable ${name} must be a valid absolute URL` +
      (context ? ` (used in: ${context})` : '') +
      `\n  Allowed protocols: ${protocolList}` +
      `\n  Example: ${name}=${example}`
    );
  }
}

/**
 * Validates an Ethereum address using ethers
 */
function validateAddress(value, name, context = null) {
  if (value === undefined || value === null) {
    return undefined;
  }
  
  const str = String(value).trim();
  if (str.length === 0) {
    return undefined;
  }
  
  if (!ethers.isAddress(str)) {
    throw new Error(
      `Environment variable ${name} must be a valid Ethereum address` +
      (context ? ` (used in: ${context})` : '') +
      `\n  Example: ${name}=0x1234567890123456789012345678901234567890`
    );
  }
  
  return ethers.getAddress(str); // Normalize to checksum
}

/**
 * Validates a private key (0x-prefixed 32-byte hex)
 */
function validatePrivateKey(value, name, context = null) {
  if (value === undefined || value === null) {
    return undefined;
  }
  
  const str = String(value).trim();
  if (str.length === 0) {
    return undefined;
  }
  
  if (!str.startsWith('0x')) {
    throw new Error(
      `Environment variable ${name} must be a private key starting with 0x` +
      (context ? ` (used in: ${context})` : '') +
      `\n  Example: ${name}=0x1234567890abcdef...`
    );
  }
  
  // Remove 0x prefix for length check
  const hex = str.slice(2);
  if (hex.length !== 64) {
    throw new Error(
      `Environment variable ${name} must be a 32-byte (64 hex chars) private key` +
      (context ? ` (used in: ${context})` : '') +
      `\n  Current length: ${hex.length} chars (expected: 64)`
    );
  }
  
  // Validate hex characters
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error(
      `Environment variable ${name} contains invalid hex characters` +
      (context ? ` (used in: ${context})` : '')
    );
  }
  
  return str.toLowerCase(); // Return lowercase for consistency
}

// ============================================
// Public Helper Functions
// ============================================

export function reqString(name, context = null) {
  const value = process.env[name];
  return validateString(value, name, context);
}

export function optString(name, defaultValue = undefined) {
  const value = process.env[name];
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return String(value).trim() || defaultValue;
}

export function reqBool(name, context = null) {
  const value = process.env[name];
  const result = validateBoolean(value, name, context);
  if (result === undefined) {
    throw new Error(
      `Environment variable ${name} is required` +
      (context ? ` (used in: ${context})` : '') +
      `\n  Example: ${name}=true`
    );
  }
  return result;
}

export function optBool(name, defaultValue = undefined) {
  const value = process.env[name];
  const result = validateBoolean(value, name);
  return result !== undefined ? result : defaultValue;
}

export function reqNum(name, options = {}) {
  const value = process.env[name];
  if (value === undefined || value === null) {
    throw new Error(
      `Environment variable ${name} is required` +
      (options.context ? ` (used in: ${options.context})` : '') +
      `\n  Example: ${name}=100`
    );
  }
  return validateNumber(value, name, options);
}

export function optNum(name, defaultValue = undefined, options = {}) {
  const value = process.env[name];
  const result = validateNumber(value, name, options);
  return result !== undefined ? result : defaultValue;
}

export function reqUrl(name, context = null, options = {}) {
  const value = process.env[name];
  if (value === undefined || value === null) {
    throw new Error(
      `Environment variable ${name} is required` +
      (context ? ` (used in: ${context})` : '') +
      `\n  Example: ${name}=https://api.example.com/v1`
    );
  }
  return validateUrl(value, name, context, options);
}

export function optUrl(name, defaultValue = undefined, options = {}) {
  const value = process.env[name];
  const result = validateUrl(value, name, null, options);
  return result !== undefined ? result : defaultValue;
}

export function reqAddress(name, context = null) {
  const value = process.env[name];
  if (value === undefined || value === null) {
    throw new Error(
      `Environment variable ${name} is required` +
      (context ? ` (used in: ${context})` : '') +
      `\n  Example: ${name}=0x1234567890123456789012345678901234567890`
    );
  }
  return validateAddress(value, name, context);
}

export function optAddress(name, defaultValue = undefined) {
  const value = process.env[name];
  const result = validateAddress(value, name);
  return result !== undefined ? result : defaultValue;
}

export function reqPrivKey(name, context = null) {
  const value = process.env[name];
  if (value === undefined || value === null) {
    throw new Error(
      `Environment variable ${name} is required` +
      (context ? ` (used in: ${context})` : '') +
      `\n  Example: ${name}=0x1234567890abcdef... (64 hex chars)`
    );
  }
  return validatePrivateKey(value, name, context);
}

export function optPrivKey(name, defaultValue = undefined) {
  const value = process.env[name];
  const result = validatePrivateKey(value, name);
  return result !== undefined ? result : defaultValue;
}

// ============================================
// Typed Config Object
// ============================================

/**
 * Loads and validates all environment variables
 * Returns a typed config object
 */
export function loadEnv() {
  const isProduction = (process.env.NODE_ENV || process.env.VERCEL_ENV || '').toLowerCase() === 'production';
  const missingOptional = [];
  
  try {
    const config = {
      // CDP Configuration
      cdp: {
        apiKeyId: reqString('CDP_API_KEY_ID', 'CDP client initialization'),
        apiKeySecret: reqString('CDP_API_KEY_SECRET', 'CDP client initialization'),
        sqlApiKey: optString('CDP_SQL_API_KEY', ''),
        defaultNetwork: optString('CDP_DEFAULT_NETWORK', 'base-sepolia'),
        bundlerUrl: optUrl('CDP_BUNDLER_URL'),
        paymasterUrl: optUrl('CDP_PAYMASTER_URL'),
      },
      
      // Registry Configuration
      registry: {
        chainId: reqString('REGISTRY_CHAIN_ID', 'Registry operations'),
        defaultTarget: reqString('REGISTRY_DEFAULT_TARGET', 'Registry operations'),
        eip712Version: optString('REGISTRY_EIP712_VERSION', '2'),
        baseMainnetAddress: optAddress('BASE_MAINNET_REGISTRY_ADDRESS') || optAddress('NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS') || optAddress('NEXT_PUBLIC_REGISTRY_ADDRESS'),
        baseSepoliaAddress: optAddress('BASE_SEPOLIA_REGISTRY_ADDRESS'),
        baseSepoliaChainId: optString('BASE_SEPOLIA_REGISTRY_CHAIN_ID', '84532'),
      },
      
      // RPC URLs
      rpc: {
        baseMainnet: optUrl('BASE_MAINNET_RPC_URL') || optUrl('BASE_RPC_URL'),
        baseSepolia: optUrl('BASE_SEPOLIA_RPC_URL'),
        leaderboard: optUrl('LEADERBOARD_RPC_URL'),
        ethereum: optUrl('ETHEREUM_RPC_URL'),
      },
      
      // Profile Enrichment
      profiles: {
        neynarApiKey: optString('NEYNAR_API_KEY'),
        neynarApiBaseUrl: optUrl('NEYNAR_API_BASE_URL') || 'https://api.neynar.com',
        provider: optString('FARCASTER_PROFILE_PROVIDER', 'neynar'),
        disableEnrichment: optBool('LEADERBOARD_DISABLE_PROFILE_ENRICHMENT', false),
      },
      
      // Redis/KV Store
      redis: {
        url: optUrl('REDIS_URL', undefined, { protocols: ['http:', 'https:', 'redis:', 'rediss:'] }),
        upstashRestUrl: optUrl('UPSTASH_REDIS_REST_URL'),
        upstashRestToken: optString('UPSTASH_REDIS_REST_TOKEN'),
        kvRestApiUrl: optUrl('KV_REST_API_URL'),
        kvRestApiToken: optString('KV_REST_API_TOKEN'),
        kvRestApiReadOnlyToken: optString('KV_REST_API_READ_ONLY_TOKEN'),
        kvUrl: optUrl('KV_URL', undefined, { protocols: ['http:', 'https:', 'redis:', 'rediss:'] }),
      },
      
      // Signing Keys (optional - only if signing is enabled)
      signing: {
        scoreSignerPrivateKey: optPrivKey('SCORE_SIGNER_PRIVATE_KEY'),
        questSignerPrivateKey: optPrivKey('QUEST_SIGNER_PRIVATE_KEY'),
        baseSepoliaScoreSignerPrivateKey: optPrivKey('BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY'),
        baseSepoliaQuestSignerPrivateKey: optPrivKey('BASE_SEPOLIA_QUEST_SIGNER_PRIVATE_KEY'),
      },
      
      // Leaderboard Configuration
      leaderboard: {
        fallbackChunkSize: optNum('LEADERBOARD_FALLBACK_CHUNK_SIZE', 100, { min: 1 }),
        fallbackWindowBlocks: optNum('LEADERBOARD_FALLBACK_WINDOW_BLOCKS', 10000, { min: 1 }),
      },
      
      // Paymaster Configuration
      paymaster: {
        serviceUrl: optUrl('PAYMASTER_SERVICE_URL'),
        allowedTargets: optString('PAYMASTER_ALLOWED_TARGETS', ''),
        allowedSelectors: optString('PAYMASTER_ALLOWED_SELECTORS', ''),
        enforceAllowlist: optBool('PAYMASTER_ENFORCE_ALLOWLIST', true),
        maxCalls: optNum('PAYMASTER_MAX_CALLS', 1, { min: 1 }),
      },
      
      // Other
      baseUrl: optUrl('BASE_URL') || 'https://base-man.vercel.app',
      telegramBotToken: optString('TELEGRAM_BOT_TOKEN'),
      telegramChatId: optString('TELEGRAM_CHAT_ID'),
      rollbarServerToken: optString('ROLLBAR_SERVER_TOKEN') || optString('ROLLBAR_BASE_MAN_SERVER_TOKEN_1764367657'),
      inngestEventKey: optString('INNGEST_EVENT_KEY'),
      inngestSigningKey: optString('INNGEST_SIGNING_KEY'),
    };
    
    // Validate critical combinations
    // Registry address is required (either BASE_MAINNET_REGISTRY_ADDRESS or NEXT_PUBLIC_REGISTRY_ADDRESS)
    if (!config.registry.baseMainnetAddress) {
      throw new Error(
        'Registry address is required. Set either BASE_MAINNET_REGISTRY_ADDRESS or NEXT_PUBLIC_REGISTRY_ADDRESS' +
        '\n  Example: BASE_MAINNET_REGISTRY_ADDRESS=0x2fd9492E5f0F9559152bB5d4d23843072bCF17E2'
      );
    }
    
    // At least one RPC URL should be available
    if (!config.rpc.baseMainnet && !config.rpc.baseSepolia) {
      missingOptional.push('BASE_MAINNET_RPC_URL or BASE_SEPOLIA_RPC_URL');
    }
    
    // Warn about missing optional vars in non-production
    if (!isProduction && missingOptional.length > 0) {
      console.warn(
        '[env] Missing optional environment variables (non-critical):\n' +
        missingOptional.map(v => `  - ${v}`).join('\n')
      );
    }
    
    return config;
  } catch (error) {
    // Format error message for better readability
    const message = error.message || String(error);
    const lines = message.split('\n');
    const summary = lines[0];
    const details = lines.slice(1).filter(l => l.trim());
    
    const formattedError = new Error(
      `[Environment Validation Failed] ${summary}` +
      (details.length > 0 ? '\n' + details.map(d => `  ${d}`).join('\n') : '')
    );
    
    // In production, hard-fail immediately
    if (isProduction) {
      console.error(formattedError.message);
      throw formattedError;
    }
    
    // In development, still throw but with more context
    throw formattedError;
  }
}

// ============================================
// Singleton Pattern (Lazy Initialization)
// ============================================

let _env = null;

/**
 * Gets the validated environment configuration (singleton)
 * Validates on first access, then caches the result
 */
export function getEnv() {
  if (!_env) {
    _env = loadEnv();
  }
  return _env;
}

/**
 * Resets the cached environment (useful for testing)
 */
export function resetEnv() {
  _env = null;
}
