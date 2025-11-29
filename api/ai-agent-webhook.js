/**
 * AI Agent Webhook Endpoint
 * Receives log entries from app-log.js and performs AI-powered analysis
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const AI_AGENT_ENABLED = process.env.AI_AGENT_ENABLED === 'true' || false;
const AI_AGENT_MODEL = process.env.AI_AGENT_MODEL || 'gpt-4o-mini';
const AI_AGENT_MIN_SEVERITY = process.env.AI_AGENT_MIN_SEVERITY || 'error'; // 'error', 'warn', 'log'

// Notification endpoints (optional)
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const EMAIL_API_KEY = process.env.EMAIL_API_KEY || '';
const EMAIL_TO = process.env.EMAIL_TO || '';

// Cache for recent analyses to avoid duplicate processing
const ANALYSIS_CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Analyze error using OpenAI API
 */
async function analyzeError(logEntry) {
  if (!OPENAI_API_KEY || !AI_AGENT_ENABLED) {
    return null;
  }

  // Only analyze errors and warnings
  if (logEntry.event !== 'error' && logEntry.event !== 'warn') {
    if (AI_AGENT_MIN_SEVERITY === 'error' && logEntry.event !== 'error') {
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: AI_AGENT_MODEL,
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
      console.warn('[ai-agent] OpenAI API error:', response.status, errorText);
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
    } catch (parseError) {
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
    console.warn('[ai-agent] Analysis failed:', error?.message || error);
    return null;
  }
}

/**
 * Send notification to Slack
 */
async function notifySlack(logEntry, analysis) {
  if (!SLACK_WEBHOOK_URL) return;

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

    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks })
    });
  } catch (error) {
    console.warn('[ai-agent] Slack notification failed:', error?.message || error);
  }
}

/**
 * Send notification via email (using a simple email service)
 */
async function notifyEmail(logEntry, analysis) {
  if (!EMAIL_API_KEY || !EMAIL_TO) return;

  // This is a placeholder - you can integrate with SendGrid, Resend, etc.
  // For now, we'll just log it
  console.log('[ai-agent] Email notification (not implemented):', {
    to: EMAIL_TO,
    subject: `BaseMan Error: ${logEntry.message?.slice(0, 50)}`,
    analysis: analysis?.severity || 'Unknown'
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const logEntry = req.body;

    // Validate log entry structure
    if (!logEntry || !logEntry.event || !logEntry.message) {
      return res.status(400).json({ error: 'Invalid log entry format' });
    }

    // Perform AI analysis
    const analysis = await analyzeError(logEntry);

    // Send notifications if analysis is available or if it's a critical error
    if (analysis || logEntry.event === 'error') {
      await Promise.all([
        notifySlack(logEntry, analysis),
        notifyEmail(logEntry, analysis)
      ]);
    }

    return res.status(200).json({
      ok: true,
      analyzed: !!analysis,
      analysis: analysis || null
    });
  } catch (error) {
    console.error('[ai-agent] Handler error:', error?.message || error);
    return res.status(500).json({
      error: 'AI Agent processing failed',
      details: error?.message || String(error)
    });
  }
}

