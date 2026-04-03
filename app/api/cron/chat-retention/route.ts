import { NextRequest, NextResponse } from "next/server";
import { requireCronAuth, toErrorResponse } from "@/server/authz";
import { cleanupExpiredChatConversations } from "@/server/journal";

export async function GET(request: NextRequest) {
  try {
    requireCronAuth(request, { serviceName: "cron-chat-retention" });
  } catch (error) {
    return toErrorResponse(error);
  }

  try {
    const result = await cleanupExpiredChatConversations();
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
