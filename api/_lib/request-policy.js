function readEnv(name, fallback = '') {
  const value = process?.env?.[name];
  return typeof value === 'string' ? value.trim() : fallback;
}

function isTruthyFlag(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

export function isProductionRuntime() {
  const vercelEnv = readEnv('VERCEL_ENV', '').toLowerCase();
  const nodeEnv = readEnv('NODE_ENV', '').toLowerCase();
  return vercelEnv === 'production' || nodeEnv === 'production';
}

export function isDebugFlagEnabled(envName) {
  return isTruthyFlag(readEnv(envName, 'false'));
}

export function isProductionAccessEnabled(envName) {
  if (!isProductionRuntime()) return true;
  return isTruthyFlag(readEnv(envName, 'false'));
}

export function denyInProduction(res, envName, endpointName) {
  if (isProductionAccessEnabled(envName)) {
    return false;
  }
  return res.status(404).json({ error: `${endpointName} is not available` });
}

export function hasBearerSecret(req, envName, headerNames = ['authorization']) {
  const expectedSecret = readEnv(envName, '');
  if (!expectedSecret) {
    return !isProductionRuntime();
  }

  const headers = req?.headers || {};
  for (const headerName of headerNames) {
    const rawValue =
      headers[headerName] ||
      headers[headerName.toLowerCase()] ||
      headers[headerName.toUpperCase()];
    if (typeof rawValue !== 'string') continue;

    if (rawValue === expectedSecret) {
      return true;
    }

    if (rawValue.toLowerCase().startsWith('bearer ')) {
      if (rawValue.slice(7).trim() === expectedSecret) {
        return true;
      }
    }
  }

  return false;
}
