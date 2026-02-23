/**
 * AI Agent Webhook Endpoint
 * Receives log entries from app-log.js and performs AI-powered analysis
 */

import { createLogger } from "../src/utils/logger.js";
import { getRollbar } from './_lib/rollbar.js';

const log = createLogger("ApiAiAgentWebhook");

let cachedConfig = null;

function getAiAgentConfig() {
  if (cachedConfig) return cachedConfig;
  cachedConfig = {
    provider: (process.env.AI_PROVIDER || 'groq').trim().toLowerCase(),
    openaiApiKey: (process.env.OPENAI_API_KEY || '').trim(),
    groqApiKey: (process.env.GROQ_API_KEY || '').trim(),
    openrouterApiKey: (process.env.OPENROUTER_API_KEY || '').trim(),
    agentEnabled: (process.env.AI_AGENT_ENABLED || '').trim().toLowerCase() === 'true',
    agentModel: (process.env.AI_AGENT_MODEL || 'llama-3.3-70b-versatile').trim(),
    agentMinSeverity: (process.env.AI_AGENT_MIN_SEVERITY || 'error').trim(),
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    emailApiKey: process.env.EMAIL_API_KEY || '',
    emailTo: process.env.EMAIL_TO || ''
  };
  return cachedConfig;
}

// Cache for recent analyses to avoid duplicate processing
const ANALYSIS_CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Rule-based error analysis (completely free, no API needed)
 */
function analyzeErrorRuleBased(logEntry) {
  const message = (logEntry.message || '').toLowerCase();
  const _stack = (logEntry.meta?.stack || '').toLowerCase();
  const filename = logEntry.meta?.filename || 'unknown';
  
  // Pattern matching for common errors
  let rootCause = 'Unknown error';
  let severity = 'Medium';
  let solution = {
    file: filename,
    line: logEntry.meta?.lineno || 'unknown',
    fix: 'Review error logs and stack trace',
    explanation: 'Manual review required'
  };
  
  // TypeError patterns
  if (message.includes('cannot read') || message.includes('undefined') || message.includes('null')) {
    rootCause = 'Attempting to access property/method on undefined or null value';
    severity = 'High';
    solution = {
      file: filename,
      line: logEntry.meta?.lineno || 'unknown',
      fix: 'Add null/undefined checks before accessing properties',
      explanation: 'Use optional chaining (?.) or null checks before property access'
    };
  }
  // Network errors
  else if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    rootCause = 'Network request failed or timed out';
    severity = 'Medium';
    solution = {
      file: filename,
      line: logEntry.meta?.lineno || 'unknown',
      fix: 'Add retry logic and error handling for network requests',
      explanation: 'Implement exponential backoff and handle network failures gracefully'
    };
  }
  // Promise rejection
  else if (message.includes('promise') || message.includes('rejection') || message.includes('unhandled')) {
    rootCause = 'Unhandled promise rejection';
    severity = 'High';
    solution = {
      file: filename,
      line: logEntry.meta?.lineno || 'unknown',
      fix: 'Add .catch() handlers to all promises',
      explanation: 'Ensure all async operations have proper error handling'
    };
  }
  // JSON parsing
  else if (message.includes('json') || message.includes('parse') || message.includes('syntax')) {
    rootCause = 'Invalid JSON format or parsing error';
    severity = 'Medium';
    solution = {
      file: filename,
      line: logEntry.meta?.lineno || 'unknown',
      fix: 'Add try-catch around JSON.parse() and validate JSON before parsing',
      explanation: 'Validate response format before attempting to parse JSON'
    };
  }
  // Authentication errors
  else if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
    rootCause = 'Authentication or authorization failure';
    severity = 'High';
    solution = {
      file: filename,
      line: logEntry.meta?.lineno || 'unknown',
      fix: 'Check token validity and refresh if expired',
      explanation: 'Implement token refresh logic and handle auth errors gracefully'
    };
  }
  
  return {
    rootCause,
    severity,
    impact: severity === 'Critical' || severity === 'High' ? 'Multiple users may be affected' : 'Limited user impact',
    solution,
    prevention: 'Add comprehensive error handling and input validation',
    method: 'rule-based'
  };
}

/**
 * Analyze error using AI API (Groq, OpenAI, or OpenRouter)
 */
async function analyzeErrorWithAI(logEntry, provider, config) {
  const activeProvider = provider || config.provider;
  let apiKey = '';
  let apiUrl = '';
  let model = config.agentModel;
  
  // Configure API based on provider
  if (activeProvider === 'groq') {
    apiKey = config.groqApiKey;
    apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    if (!model.includes('llama') && !model.includes('mixtral')) {
      model = 'llama-3.3-70b-versatile'; // Default Groq model
    }
  } else if (activeProvider === 'openrouter') {
    apiKey = config.openrouterApiKey;
    apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    if (!model) {
      model = 'meta-llama/llama-3.3-70b-instruct:free'; // Free model on OpenRouter
    }
  } else if (activeProvider === 'openai') {
    apiKey = config.openaiApiKey;
    apiUrl = 'https://api.openai.com/v1/chat/completions';
    if (!model) {
      model = 'gpt-4o-mini';
    }
  } else {
    return null; // Unknown provider
  }
  
  if (!apiKey || !config.agentEnabled) {
    return null;
  }

  // Only analyze errors and warnings
  if (logEntry.event !== 'error' && logEntry.event !== 'warn') {
    if (config.agentMinSeverity === 'error' && logEntry.event !== 'error') {
      return null;
    }
  }

  // Check cache to avoid duplicate analyses
  const cacheKey = `${logEntry.event}:${logEntry.message?.slice(0, 100)}`;
  const cached = ANALYSIS_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.analysis;
  }

  try {
    const prompt = `You are an expert JavaScript/TypeScript developer analyzing error logs from a Farcaster Mini App (BaseMan - a Pac-Man game).

Analyze this error log and provide:
1. **Root Cause**: What is the actual problem?
2. **Severity**: Critical, High, Medium, or Low
3. **Impact**: How many users might be affected?
4. **Solution**: Specific code fix suggestions with file paths and line numbers
5. **Prevention**: How to prevent this error in the future

Error Log:
- Event: ${logEntry.event}
- Message: ${logEntry.message}
- File: ${logEntry.meta?.filename || 'unknown'}
- Line: ${logEntry.meta?.lineno || 'unknown'}
- Column: ${logEntry.meta?.colno || 'unknown'}
- Stack: ${logEntry.meta?.stack || 'N/A'}

Provide your analysis in JSON format:
{
  "rootCause": "brief explanation",
  "severity": "Critical|High|Medium|Low",
  "impact": "description of user impact",
  "solution": {
    "file": "path/to/file.js",
    "line": 123,
    "fix": "specific code change",
    "explanation": "why this fixes the issue"
  },
  "prevention": "how to prevent this"
}`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    // OpenRouter requires additional headers
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = process.env.OPENROUTER_REFERRER || 'https://base-man.vercel.app';
      headers['X-Title'] = 'BaseMan AI Agent';
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert JavaScript/TypeScript developer specializing in error analysis and debugging. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.warn(`${provider.toUpperCase()} API error:`, response.status, errorText);
      return null;
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content || '';

    // Try to parse JSON from response
    let analysis = null;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       analysisText.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, analysisText];
      const jsonText = jsonMatch[1] || analysisText;
      analysis = JSON.parse(jsonText);
    } catch (_parseError) {
      // If JSON parsing fails, create a structured response from text
      analysis = {
        rootCause: 'Analysis parsing failed',
        severity: 'Medium',
        impact: 'Unknown',
        solution: {
          file: logEntry.meta?.filename || 'unknown',
          line: logEntry.meta?.lineno || 'unknown',
          fix: 'Manual review required',
          explanation: analysisText.slice(0, 500)
        },
        prevention: 'Review error logs manually'
      };
    }

    // Add provider info to analysis
    if (analysis && typeof analysis === 'object') {
      analysis.method = provider;
    }

    // Cache the analysis
    ANALYSIS_CACHE.set(cacheKey, {
      timestamp: Date.now(),
      analysis
    });

    // Clean old cache entries
    if (ANALYSIS_CACHE.size > 100) {
      const now = Date.now();
      for (const [key, value] of ANALYSIS_CACHE.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          ANALYSIS_CACHE.delete(key);
        }
      }
    }

    return analysis;
  } catch (error) {
    log.warn(`${provider} analysis failed:`, error?.message || error);
    return null;
  }
}

/**
 * Main analyze error function - tries AI first, falls back to rule-based
 */
async function analyzeError(logEntry, config) {
  if (!config.agentEnabled) {
    return null;
  }

  // Only analyze errors and warnings
  if (logEntry.event !== 'error' && logEntry.event !== 'warn') {
    if (config.agentMinSeverity === 'error' && logEntry.event !== 'error') {
      return null;
    }
  }

  // Check cache to avoid duplicate analyses
  const cacheKey = `${logEntry.event}:${logEntry.message?.slice(0, 100)}`;
  const cached = ANALYSIS_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.analysis;
  }

  // Try AI providers in order: groq -> openrouter -> openai -> rule-based
  let analysis = null;
  
  // Check if we should use rule-based directly
  const hasGroqKey = !!config.groqApiKey && config.groqApiKey.length > 0;
  const hasOpenRouterKey = !!config.openrouterApiKey && config.openrouterApiKey.length > 0;
  const hasOpenAIKey = !!config.openaiApiKey && config.openaiApiKey.length > 0;
  const hasAnyAIKey = hasGroqKey || hasOpenRouterKey || hasOpenAIKey;
  
  if (config.provider === 'rule-based' || !hasAnyAIKey) {
    // Use rule-based analysis (completely free)
    analysis = analyzeErrorRuleBased(logEntry);
  } else {
    // Try AI providers in priority order
    const providers = [];
    if (config.provider === 'groq' && hasGroqKey) {
      providers.push('groq');
    } else if (config.provider === 'openrouter' && hasOpenRouterKey) {
      providers.push('openrouter');
    } else if (config.provider === 'openai' && hasOpenAIKey) {
      providers.push('openai');
    }
    
    // Add other available providers as fallback
    if (hasGroqKey && !providers.includes('groq')) providers.push('groq');
    if (hasOpenRouterKey && !providers.includes('openrouter')) providers.push('openrouter');
    if (hasOpenAIKey && !providers.includes('openai')) providers.push('openai');
    
    // Try each provider
    for (const provider of providers) {
      analysis = await analyzeErrorWithAI(logEntry, provider, config);
      if (analysis) break; // Success, stop trying other providers
    }
    
    // Fallback to rule-based if all AI providers fail
    if (!analysis) {
      analysis = analyzeErrorRuleBased(logEntry);
    }
  }

  // Cache the analysis
  if (analysis) {
    ANALYSIS_CACHE.set(cacheKey, {
      timestamp: Date.now(),
      analysis
    });
  }

  return analysis;
}

/**
 * Send notification to Slack
 */
async function notifySlack(logEntry, analysis, config) {
  if (!config.slackWebhookUrl) return;

  try {
    const severityEmoji = {
      'Critical': '🔴',
      'High': '🟠',
      'Medium': '🟡',
      'Low': '🟢'
    }[analysis?.severity || 'Medium'] || '⚠️';

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${severityEmoji} BaseMan Error Detected`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Event:*\n${logEntry.event}`
          },
          {
            type: 'mrkdwn',
            text: `*Severity:*\n${analysis?.severity || 'Unknown'}`
          },
          {
            type: 'mrkdwn',
            text: `*File:*\n${logEntry.meta?.filename || 'unknown'}:${logEntry.meta?.lineno || '?'}`
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${new Date(logEntry.ts).toLocaleString()}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Message:*\n\`\`\`${logEntry.message}\`\`\``
        }
      }
    ];

    if (analysis) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Root Cause:*\n${analysis.rootCause}\n\n*Solution:*\n${analysis.solution?.fix || 'Manual review required'}`
        }
      });
    }

    await fetch(config.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks })
    });
  } catch (error) {
    log.warn('Slack notification failed:', error?.message || error);
  }
}

/**
 * Send notification via email (using a simple email service)
 */
async function notifyEmail(logEntry, analysis, config) {
  if (!config.emailApiKey || !config.emailTo) return;

  // This is a placeholder - you can integrate with SendGrid, Resend, etc.
  // For now, we'll just log it
  log.debug('Email notification (not implemented):', {
      to: config.emailTo,
    subject: `BaseMan Error: ${logEntry.message?.slice(0, 50)}`,
    analysis: analysis?.severity || 'Unknown'
  });
}

export default async function handler(req, res) {
  const config = getAiAgentConfig();
  // Debug endpoint - GET request for checking configuration
  if (req.method === 'GET') {
    return res.status(200).json({
      enabled: config.agentEnabled,
      provider: config.provider,
      hasGroqKey: !!config.groqApiKey && config.groqApiKey.length > 0,
      hasOpenRouterKey: !!config.openrouterApiKey && config.openrouterApiKey.length > 0,
      hasOpenAIKey: !!config.openaiApiKey && config.openaiApiKey.length > 0,
      groqKeyPrefix: config.groqApiKey ? config.groqApiKey.substring(0, 15) + '...' : 'missing',
      openRouterKeyPrefix: config.openrouterApiKey ? config.openrouterApiKey.substring(0, 15) + '...' : 'missing',
      openAIKeyPrefix: config.openaiApiKey ? config.openaiApiKey.substring(0, 15) + '...' : 'missing',
      model: config.agentModel,
      minSeverity: config.agentMinSeverity,
      hasSlackWebhook: !!config.slackWebhookUrl && config.slackWebhookUrl.length > 0,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
      fallback: 'rule-based (always available, completely free)'
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const logEntry = req.body;

    // Validate log entry structure
    if (!logEntry || !logEntry.event || !logEntry.message) {
      return res.status(400).json({ error: 'Invalid log entry format' });
    }

    const rollbar = getRollbar();

    // Perform AI analysis
    const analysis = await analyzeError(logEntry, config);

    // Send AI analysis to Rollbar if configured
    log.debug('Rollbar check:', {
      hasRollbar: !!rollbar,
      event: logEntry.event,
      hasAnalysis: !!analysis,
      willSend: !!(rollbar && logEntry.event === 'error' && analysis)
    });
    if (rollbar && logEntry.event === 'error' && analysis) {
      try {
        // Extract person info from meta if available (address, fid, etc.)
        const person = {};
        if (logEntry.meta?.address) {
          person.id = logEntry.meta.address;
        }
        if (logEntry.meta?.fid) {
          person.id = String(logEntry.meta.fid);
          person.username = logEntry.meta.username || undefined;
        }
        
        // Build Rollbar error payload with AI analysis
        const rollbarPayload = {
          custom: {
            timestamp: logEntry.ts,
            meta: logEntry.meta,
            filename: logEntry.meta?.filename,
            lineno: logEntry.meta?.lineno,
            colno: logEntry.meta?.colno,
            // Add AI analysis results
            aiAnalysis: {
              rootCause: analysis.rootCause,
              severity: analysis.severity,
              impact: analysis.impact,
              solution: analysis.solution,
              prevention: analysis.prevention,
              method: analysis.method || 'unknown'
            }
          },
          fingerprint: logEntry.meta?.stack ? logEntry.meta.stack.split('\n')[0] : logEntry.message
        };
        
        // Add person tracking if available
        if (person.id) {
          rollbarPayload.person = person;
        }
        
        // Send to Rollbar with AI analysis
        rollbar.error(logEntry.message, rollbarPayload);
        log.debug('Sent error with AI analysis to Rollbar', {
          message: logEntry.message,
          hasAnalysis: !!analysis,
          severity: analysis?.severity,
          method: analysis?.method,
          rollbarPayload: JSON.stringify(rollbarPayload).slice(0, 200) + '...'
        });
      } catch (err) {
        log.warn('Rollbar send failed:', err?.message);
      }
    }

    // Send notifications if analysis is available or if it's a critical error
    if (analysis || logEntry.event === 'error') {
      await Promise.all([
        notifySlack(logEntry, analysis, config),
        notifyEmail(logEntry, analysis, config)
      ]);
    }

    return res.status(200).json({
      ok: true,
      analyzed: !!analysis,
      analysis: analysis || null
    });
  } catch (error) {
    log.error('Handler error:', error?.message || error);
    return res.status(500).json({
      error: 'AI Agent processing failed',
      details: error?.message || String(error)
    });
  }
}
