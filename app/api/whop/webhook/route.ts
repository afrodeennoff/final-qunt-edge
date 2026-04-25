import { NextRequest, NextResponse } from "next/server";
import { webhookService } from "@/server/webhook-service";
import { whop } from "@/lib/whop";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";


export async function POST(req: NextRequest) {
    const requestId = crypto.randomUUID();
    let requestBodyText: string;

    try {
        requestBodyText = await req.text();
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to read request body";
        logger.error('[Webhook] Failed to read request body', {
            requestId,
            error: message,
        });
        return apiError('WEBHOOK_BODY_READ_ERROR', 'Failed to read request body', 400, { requestId });
    }

    const headers = Object.fromEntries(req.headers);

    let event;
    try {
        event = whop.webhooks.unwrap(requestBodyText, { headers });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown signature verification error";
        logger.error('[Webhook] Signature verification failed', {
            requestId,
            error: message,
        });

        return apiError('WEBHOOK_SIGNATURE_INVALID', 'Webhook signature verification failed', 400, { requestId });
    }

    logger.info('[Webhook] Event received', { requestId, eventType: event.type, eventId: event.id });

    const result = await webhookService.processWebhook(event);

    if (result.success || result.alreadyProcessed) {
        return NextResponse.json({ message: "Received", requestId }, { status: 200 });
    } else {
        logger.error('[Webhook] Processing failed', {
            requestId,
            eventType: result.eventType,
            error: result.error,
        });
        return apiError('WEBHOOK_PROCESSING_FAILED', result.error || "Processing failed", 500, { requestId });
    }
}
