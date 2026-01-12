import { NextRequest, NextResponse } from 'next/server';
import { createHmac, createHash, timingSafeEqual } from 'crypto';
import {
  storeLatestReport,
  storeReportRun,
  checkAndStoreNonce,
  checkRateLimit,
  hashIdentifier,
  type LatestReportData,
  type StoredReportRun,
} from '@/lib/cache';
import { getConfig, isSecureUploadEnabled, isLegacyUploadEnabled } from '@/lib/config';

export const dynamic = 'force-dynamic';

// Rate limit settings
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW_SECONDS = 60; // 1 minute window

// Timestamp skew tolerance (5 minutes)
const TIMESTAMP_TOLERANCE_SECONDS = 300;

// Payload size limits
const PAYLOAD_HARD_LIMIT_BYTES = 4 * 1024 * 1024; // 4MB - reject with 413
const PAYLOAD_SOFT_LIMIT_BYTES = 1 * 1024 * 1024; // 1MB - log warning but accept

// Forbidden field patterns (security)
const FORBIDDEN_FIELD_PATTERNS = [
  /^__proto__$/,
  /^constructor$/,
  /^prototype$/,
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i, // onclick=, onerror=, etc.
];

/**
 * Authentication result
 */
interface AuthResult {
  success: boolean;
  error?: string;
  method?: 'hmac' | 'bearer';
}

/**
 * Verify HMAC signature for secure uploads
 *
 * Expected headers:
 *   X-Timestamp: Unix timestamp in seconds
 *   X-Nonce: Random UUID for replay protection
 *   X-Signature: HMAC-SHA256 of "timestamp.nonce.bodyHash"
 */
async function verifyHmacSignature(
  request: NextRequest,
  bodyString: string
): Promise<AuthResult> {
  const config = getConfig();
  const signingKey = config.ci.uploadSigningKey;

  if (!signingKey) {
    return { success: false, error: 'HMAC signing not configured' };
  }

  const timestamp = request.headers.get('X-Timestamp');
  const nonce = request.headers.get('X-Nonce');
  const signature = request.headers.get('X-Signature');

  // Check all required headers are present
  if (!timestamp || !nonce || !signature) {
    return {
      success: false,
      error: 'Missing required headers: X-Timestamp, X-Nonce, X-Signature',
    };
  }

  // Validate timestamp is within tolerance
  const requestTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);

  if (isNaN(requestTime)) {
    return { success: false, error: 'Invalid timestamp format' };
  }

  if (Math.abs(now - requestTime) > TIMESTAMP_TOLERANCE_SECONDS) {
    return {
      success: false,
      error: `Timestamp outside acceptable range (${TIMESTAMP_TOLERANCE_SECONDS}s tolerance)`,
    };
  }

  // Check nonce hasn't been used (replay protection)
  const nonceValid = await checkAndStoreNonce(nonce);
  if (!nonceValid) {
    return { success: false, error: 'Nonce already used or invalid (possible replay attack)' };
  }

  // Compute expected signature
  const bodyHash = createHash('sha256').update(bodyString).digest('hex');
  const signatureBase = `${timestamp}.${nonce}.${bodyHash}`;
  const expectedSignature = createHmac('sha256', signingKey)
    .update(signatureBase)
    .digest('hex');

  // Timing-safe comparison
  try {
    const providedBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (providedBuffer.length !== expectedBuffer.length) {
      return { success: false, error: 'Invalid signature' };
    }

    if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
      return { success: false, error: 'Invalid signature' };
    }
  } catch {
    return { success: false, error: 'Invalid signature format' };
  }

  return { success: true, method: 'hmac' };
}

/**
 * Verify legacy Bearer token authentication
 * @deprecated Use HMAC signature authentication instead
 */
function verifyBearerToken(request: NextRequest): AuthResult {
  const config = getConfig();
  const expectedSecret = config.ci.uploadSecret;

  if (!expectedSecret) {
    return { success: false, error: 'Bearer token auth not configured' };
  }

  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Missing or invalid Authorization header' };
  }

  const providedSecret = authHeader.slice(7);

  // Timing-safe comparison for the secret
  try {
    const providedBuffer = Buffer.from(providedSecret);
    const expectedBuffer = Buffer.from(expectedSecret);

    if (providedBuffer.length !== expectedBuffer.length) {
      return { success: false, error: 'Invalid bearer token' };
    }

    if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
      return { success: false, error: 'Invalid bearer token' };
    }
  } catch {
    return { success: false, error: 'Invalid bearer token' };
  }

  return { success: true, method: 'bearer' };
}

/**
 * Authenticate the request using available methods
 */
async function authenticate(
  request: NextRequest,
  bodyString: string
): Promise<AuthResult> {
  // Prefer HMAC signature if configured
  if (isSecureUploadEnabled()) {
    const hmacResult = await verifyHmacSignature(request, bodyString);
    if (hmacResult.success) {
      return hmacResult;
    }
    // If HMAC is configured but verification failed, don't fall back
    return hmacResult;
  }

  // Fall back to legacy Bearer token if HMAC not configured
  if (isLegacyUploadEnabled()) {
    console.warn(
      '⚠️  Using legacy Bearer token authentication. ' +
        'Consider upgrading to HMAC signatures by setting CI_UPLOAD_SIGNING_KEY.'
    );
    return verifyBearerToken(request);
  }

  return {
    success: false,
    error:
      'No authentication method configured. ' +
      'Set CI_UPLOAD_SIGNING_KEY (recommended) or CI_UPLOAD_SECRET.',
  };
}

/**
 * Recursively check object for forbidden field names or values
 * Returns the forbidden pattern found, or null if clean
 */
function findForbiddenContent(
  obj: unknown,
  path: string = ''
): { field: string; pattern: string } | null {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (typeof obj === 'string') {
    for (const pattern of FORBIDDEN_FIELD_PATTERNS) {
      if (pattern.test(obj)) {
        return { field: path || '(value)', pattern: pattern.toString() };
      }
    }
    return null;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const result = findForbiddenContent(obj[i], `${path}[${i}]`);
      if (result) return result;
    }
    return null;
  }

  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      // Check the key itself
      for (const pattern of FORBIDDEN_FIELD_PATTERNS) {
        if (pattern.test(key)) {
          return { field: `${path}.${key}`, pattern: pattern.toString() };
        }
      }
      // Recursively check the value
      const result = findForbiddenContent(
        (obj as Record<string, unknown>)[key],
        path ? `${path}.${key}` : key
      );
      if (result) return result;
    }
  }

  return null;
}

/**
 * Get client IP for rate limiting
 */
function getClientIP(request: NextRequest): string {
  // Check various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback
  return 'unknown';
}

/**
 * POST /api/reports/upload
 *
 * Upload Lighthouse report data from CI.
 *
 * Authentication (in order of preference):
 *
 * 1. HMAC Signature (recommended):
 *    Headers:
 *      X-Timestamp: Unix timestamp in seconds
 *      X-Nonce: Random UUID
 *      X-Signature: HMAC-SHA256(timestamp.nonce.sha256(body), CI_UPLOAD_SIGNING_KEY)
 *
 * 2. Bearer Token (legacy, deprecated):
 *    Headers:
 *      Authorization: Bearer <CI_UPLOAD_SECRET>
 *
 * Request body:
 * {
 *   latest: LatestReportData,
 *   run?: StoredReportRun (optional - for historical tracking)
 * }
 */
export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const clientIP = getClientIP(request);
  const rateLimitKey = `upload:${hashIdentifier(clientIP)}`;

  // Check rate limit
  const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMIT, RATE_WINDOW_SECONDS);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(rateLimit.resetAt / 1000)),
        },
      }
    );
  }

  // Check Content-Length header for early rejection (before reading body)
  const contentLength = request.headers.get('Content-Length');
  if (contentLength) {
    const declaredSize = parseInt(contentLength, 10);
    if (!isNaN(declaredSize) && declaredSize > PAYLOAD_HARD_LIMIT_BYTES) {
      return NextResponse.json(
        {
          error: 'Payload too large',
          maxSize: `${PAYLOAD_HARD_LIMIT_BYTES / (1024 * 1024)}MB`,
          declaredSize: `${(declaredSize / (1024 * 1024)).toFixed(2)}MB`,
        },
        { status: 413 }
      );
    }
  }

  // Read the body as text first (needed for signature verification)
  const bodyString = await request.text();

  // Check actual payload size
  const actualSize = Buffer.byteLength(bodyString, 'utf8');
  if (actualSize > PAYLOAD_HARD_LIMIT_BYTES) {
    return NextResponse.json(
      {
        error: 'Payload too large',
        maxSize: `${PAYLOAD_HARD_LIMIT_BYTES / (1024 * 1024)}MB`,
        actualSize: `${(actualSize / (1024 * 1024)).toFixed(2)}MB`,
      },
      { status: 413 }
    );
  }

  // Log warning for large payloads (but allow them through)
  if (actualSize > PAYLOAD_SOFT_LIMIT_BYTES) {
    console.warn(
      `⚠️  Large payload received: ${(actualSize / (1024 * 1024)).toFixed(2)}MB ` +
        `(soft limit: ${PAYLOAD_SOFT_LIMIT_BYTES / (1024 * 1024)}MB). ` +
        `Consider optimizing report data.`
    );
  }

  // Authenticate the request
  const authResult = await authenticate(request, bodyString);

  if (!authResult.success) {
    return NextResponse.json(
      { error: `Unauthorized: ${authResult.error}` },
      { status: 401 }
    );
  }

  try {
    // Parse the body
    const body = JSON.parse(bodyString);

    // Schema validation: check for forbidden content (prototype pollution, XSS vectors)
    const forbiddenContent = findForbiddenContent(body);
    if (forbiddenContent) {
      console.error(
        `🚫 Rejected upload with forbidden content at "${forbiddenContent.field}" ` +
          `(matched pattern: ${forbiddenContent.pattern})`
      );
      return NextResponse.json(
        {
          error: 'Payload contains forbidden content',
          field: forbiddenContent.field,
        },
        { status: 400 }
      );
    }

    if (!body.latest) {
      return NextResponse.json(
        { error: 'Missing required field: latest' },
        { status: 400 }
      );
    }

    const latestData: LatestReportData = {
      timestamp: body.latest.timestamp || new Date().toISOString(),
      scores: body.latest.scores,
      pageScores: body.latest.pageScores || [],
      updatedAt: new Date().toISOString(),
    };

    // Store the latest report
    await storeLatestReport(latestData);

    // If a historical run is provided, store it too
    if (body.run) {
      const runData: StoredReportRun = {
        timestamp: body.run.timestamp,
        date: body.run.date || new Date().toISOString(),
        reports: body.run.reports,
        pageScores: body.run.pageScores,
      };
      await storeReportRun(runData);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Reports stored successfully',
        stored: {
          latest: true,
          run: !!body.run,
        },
        authMethod: authResult.method,
      },
      {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.floor(rateLimit.resetAt / 1000)),
        },
      }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    console.error('Error uploading reports:', error);
    return NextResponse.json(
      { error: 'Failed to store reports', details: String(error) },
      { status: 500 }
    );
  }
}
