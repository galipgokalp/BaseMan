/**
 * Onchain Service Layer - Facade Module
 * 
 * Central export point for all onchain service modules
 */

// Provider & Network
export { CHAIN_METADATA, toHexChainId, ensureChain, getChainKey } from './provider.js';

// SDK Context
export { getCachedSDKContext, getFreshSDKContext, clearSDKContextCache } from './sdk-context.js';

// Profile Service
export { 
  hasProfileMappingBeenSent, 
  markProfileMappingSent, 
  detectPlatform, 
  sendProfileMapping 
} from './profile-service.js';

// Score Service
export { 
  requestScoreSignature, 
  sendCalls, 
  sendEthTransaction 
} from './score-service.js';

// Runtime helpers
export { ensureOnchainPlaceholder, bindPublicOnchainApi } from './public-api.js';
export { createEventBridge } from './event-bridge.js';
export { runSdkReadyLifecycle, scheduleBackgroundMiniAppWallet } from './sdk-ready.js';
export { resolveCapabilityUrl, discoverPaymasterUrl, getCapabilities, isPaymasterSupported } from './paymaster-support.js';
export { scheduleStateHookPatching } from './state-hooks.js';
