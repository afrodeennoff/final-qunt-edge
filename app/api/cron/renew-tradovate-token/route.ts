// app/api/cron/renew-tradovate-token/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, connection } from 'next/server';
import { requireCronAuth, toErrorResponse } from '@/server/authz';
import { authSecurityConfig } from '@/lib/security/auth-config';
import { decryptToken, encryptToken } from '@/lib/security/token-crypto';

type SynchronizationRecord = {
  id: string
  userId: string
  accountId: string
  token: string | null
  tokenCiphertext: string | null
  tokenIv: string | null
  tokenTag: string | null
  tokenKeyVersion?: string | null
  tokenExpiresAt: Date | null
  dailySyncTime: Date | null
}

/**
 * Helper function to check if current time matches the configured daily sync time
 * @param dailySyncTime The configured sync time from database
 * @returns true if it's time to sync (within 15 minutes of configured time)
 */
function shouldPerformDailySync(dailySyncTime: Date | null): boolean {
  if (!dailySyncTime) return false;

  const now = new Date();
  const syncHour = dailySyncTime.getUTCHours();
  const syncMinute = dailySyncTime.getUTCMinutes();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();

  // Calculate difference in minutes
  const syncTimeInMinutes = syncHour * 60 + syncMinute;
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const diffInMinutes = Math.abs(currentTimeInMinutes - syncTimeInMinutes);

  // Check if we're within 15 minutes of the sync time (accounting for day wrap)
  return diffInMinutes <= 15 || diffInMinutes >= (24 * 60 - 15);
}

function getAccessToken(synchronization: SynchronizationRecord): string | null {
  return synchronization.token || decryptToken(synchronization);
}

function getTokenWriteData(accessToken: string) {
  if (!authSecurityConfig.tradovateTokenEncryptionEnabled) {
    return {
      token: accessToken,
      tokenCiphertext: null,
      tokenIv: null,
      tokenTag: null,
      tokenKeyVersion: null,
    };
  }

  const encryptedEnvelope = encryptToken(accessToken);
  return {
    token: null,
    tokenCiphertext: encryptedEnvelope.tokenCiphertext,
    tokenIv: encryptedEnvelope.tokenIv,
    tokenTag: encryptedEnvelope.tokenTag,
    tokenKeyVersion: encryptedEnvelope.tokenKeyVersion,
  };
}

function getTokenClearData() {
  return {
    token: null,
    tokenCiphertext: null,
    tokenIv: null,
    tokenTag: null,
    tokenKeyVersion: null,
    tokenExpiresAt: null,
  };
}

export async function GET(request: NextRequest) {
  await connection();

  try {
    requireCronAuth(request, { serviceName: 'cron-renew-tradovate-token' });
  } catch (error) {
    return toErrorResponse(error);
  }

  try {
    // Get all users with Tradovate tokens from your database
    const synchronizations = await prisma.synchronization.findMany({
      where: {
        service: 'tradovate',
        OR: [
          { token: { not: null } },
          { tokenCiphertext: { not: null } },
        ],
      },
      select: {
        id: true,
        userId: true,
        accountId: true,
        token: true,
        tokenCiphertext: true,
        tokenIv: true,
        tokenTag: true,
        tokenKeyVersion: true,
        tokenExpiresAt: true,
        dailySyncTime: true,
      },
    });

    // If tokenExpiresAt is null, clear the token (invalid state)
    const missingExpiry = synchronizations.filter((s) => !s.tokenExpiresAt);
    if (missingExpiry.length > 0) {
      // Security: Log count only, not user identifiers
      console.warn(`[CRON] Clearing ${missingExpiry.length} Tradovate tokens missing tokenExpiresAt`);
      await prisma.synchronization.updateMany({
        where: {
          id: { in: missingExpiry.map((s) => s.id) }
        },
        data: getTokenClearData()
      });
    }

    const validSynchronizations = synchronizations.filter((s) => !!s.tokenExpiresAt);

    let tokenRenewals = 0;
    let dailySyncs = 0;

    const promises = validSynchronizations.map(async (synchronization) => {
      let renewed = false;
      let synced = false;

      // Always attempt renewal for each token
      renewed = await renewUserToken(synchronization);

      // Check if we should perform daily sync
      if (shouldPerformDailySync(synchronization.dailySyncTime)) {
        synced = await performDailySync(synchronization);
      }

      return { renewed, synced };
    });

    const results = await Promise.allSettled(promises);

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        if (result.value.renewed) tokenRenewals++;
        if (result.value.synced) dailySyncs++;
      }
    });

    return Response.json({
      success: true,
      processed: synchronizations.length,
      tokenRenewals,
      dailySyncs
    });
  } catch (error) {
    // Security: Log only error type and message, not full error object
    console.error('Cron job error:', error instanceof Error ? error.message : 'Unknown error');
    return toErrorResponse(error);
  }
}

/**
 * Attempts to renew the Tradovate access token for a given synchronization record.
 * 
 * - If the current token is valid and renewable, it calls the Tradovate API to renew the access token.
 * - If the renewal is successful, updates the token and its expiration in the database.
 * - If the renewal fails (e.g., token is invalid/expired), clears the token and expiration in the database.
 * 
 * @param synchronization The synchronization record containing user, environment, and token info.
 */
async function renewUserToken(synchronization: SynchronizationRecord): Promise<boolean> {
  try {
    const accessToken = getAccessToken(synchronization);
    if (!accessToken) {
      await prisma.synchronization.update({
        where: { id: synchronization.id },
        data: getTokenClearData(),
      });
      return false;
    }

    // This app uses Tradovate demo endpoints for OAuth/sync flows.
    // `Synchronization` has no persisted `environment` field, so default to demo.
    const DEFAULT_TRADOVATE_ENV = (process.env.TRADOVATE_ENVIRONMENT || 'demo') as string;
    const apiBaseUrl = DEFAULT_TRADOVATE_ENV === 'live' ? 'https://live.tradovateapi.com' : 'https://demo.tradovateapi.com';

    const renewal = await fetch(`${apiBaseUrl}/auth/renewAccessToken`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!renewal.ok) {
      // Security: Log only status code, not sensitive token data
      console.error(`[CRON] Failed to renew Tradovate token: status ${renewal.status}`);
      // Only clear token on explicit auth failures.
      // For transient provider/network errors, keep current token.
      if (renewal.status === 401 || renewal.status === 403) {
        await prisma.synchronization.update({
          where: { id: synchronization.id },
          data: getTokenClearData(),
        });
      }
      return false;
    }

    const renewalData = await renewal.json();

    // Update database
    await prisma.synchronization.update({
      where: { id: synchronization.id },
      data: {
        ...getTokenWriteData(renewalData.accessToken),
        tokenExpiresAt: new Date(renewalData.expirationTime),
      },
    });

    return true;
  } catch (error) {
    // Security: Log only error type and message, not full error object
    console.error(`[CRON] Error renewing Tradovate token:`,
      error instanceof Error ? error.message : 'Unknown error');
    // Do not clear token on transient runtime errors.
    return false;
  }
}

/**
 * Performs a daily sync for the given synchronization by fetching trades from Tradovate
 * 
 * @param synchronization The synchronization record containing user, token, and account info.
 */
async function performDailySync(synchronization: SynchronizationRecord): Promise<boolean> {
  try {
    const accessToken = getAccessToken(synchronization);
    if (!accessToken) {
      // Security: Log without exposing sensitive account details
      console.error(`[CRON] Cannot sync account: missing access token`);
      return false;
    }

    // Dynamically importing the getTradovateTrades action to avoid circular dependencies
    const { getTradovateTrades } = await import('@/server/imports/tradovate-actions');

    // Fetch and save trades
    const result = await getTradovateTrades(accessToken, { userId: synchronization.userId, accountId: synchronization.accountId });

    if (result.error) {
      // Security: Log only error message, not full result which may contain sensitive data
      console.error(`[CRON] Failed to sync trades for account:`, result.error);
      return false;
    }

    return true;
  } catch (error) {
    // Security: Log only error type and message, not full error object
    console.error(`[CRON] Error during daily sync for account:`, 
      error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}
