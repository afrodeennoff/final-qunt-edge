"use client";

import { useEffect } from "react";
import { clearReferralCode } from "@/lib/referral-storage";

/**
 * Client component that clears referral code on checkout success.
 * Rendered conditionally by the server-side dashboard page.
 */
export function CheckoutSuccessHandler() {
  useEffect(() => {
    clearReferralCode();
  }, []);
  return null;
}
