# Prop Firm Data Audit (2026-03-27)

## Scope
- `/en/propfirms`
- `/en/firm/[slug]`
- Fallback + seed metadata quality for the 14 tracked firms in `accounts/config.ts`

## Critical Findings
1. **Fallback metadata was generic and misleading**  
   When DB rows were missing/unavailable, firms defaulted to `Futures / Tradovate / Monthly / Static / 80/20 / $100K` regardless of actual firm profile.

2. **Seeder coverage was incomplete**  
   Seeder only contained 10 firms while catalogue surfaces 14.

3. **`/en/propfirms` had weak fallback display data**  
   Unknown fields appeared in cards if `getUnifiedFirms()` failed or returned partial data.

## Remediation Implemented
- Added audited profile source of truth:
  - `lib/prop-firms/verified-profiles.ts`
- Wired runtime enrichment into firm resolution:
  - `server/deals.ts`
  - Missing/placeholder DB fields now fallback to audited profile values.
- Wired catalogue fallback display + slugs:
  - `app/[locale]/(landing)/propfirms/page.tsx`
- Unified seeding with audited profiles:
  - `prisma/seeders/prop-firms-seeder.ts`

## Evidence Sources (Web Verification)
- Earn2Trade:  
  - https://www.earn2trade.com/trader-career-path  
  - https://help.earn2trade.com/en/articles/5372687-how-does-end-of-day-drawdown-work
- Apex Trader Funding:  
  - https://support.apextraderfunding.com/hc/en-us/articles/47205823183003-EOD-Payouts  
  - https://support.apextraderfunding.com/hc/en-us/articles/40507212951451-PA-Payout-Parameters
- Topstep:  
  - https://help.topstep.com/en/articles/8284233-topstep-payout-policy  
  - https://help.topstep.com/en/articles/8284218-multiple-express-funded-accounts
- My Funded Futures:  
  - https://myfundedfutures.com/  
  - https://help.myfundedfutures.com/en/articles/11819568-changes-at-myfunded-futures
- Bulenox:  
  - https://bulenox.com/help/funded-account/  
  - https://bulenox.com/index.php/help/frequently-asked-questions/
- Phidias Propfirm:  
  - https://phidiaspropfirm.com/education/daily-payout-prop-firm  
  - https://phidiaspropfirm.com/Contract-CASH-Phidias-Propfirm-Eng_2025.pdf
- Take Profit Trader:  
  - https://try.takeprofittrader.com/futures-traders-tab1-0725  
  - https://takeprofittrader.com/userinfo/
- Tradeify:  
  - https://help.tradeify.co/en/articles/12853966-select-flex-and-select-daily-payout-policies  
  - https://help.tradeify.co/en/articles/10468250-profit-splits
- Lucid Trading:  
  - https://support.lucidtrading.com/en/articles/12890092-lucidpro-payouts  
  - https://support.lucidtrading.com/en/articles/11404614-supported-platforms
- FTMO:  
  - https://ftmo.com/en/  
  - https://ftmo.com/en/reward-growth-and-scaling-plan/
- The5ers:  
  - https://the5ers.com/  
  - https://wp.the5ers.com/instant-funding
- FundedNext:  
  - https://fundednext.com/  
  - https://help.fundednext.com/en/articles/8020768-how-much-is-the-profit-split-in-fundednext
- FundingPips:  
  - https://www.fundingpips.com/?gad_campaignid=21766626400&gad_source=1  
  - https://app.fundingpips.com/files/terms-and-conditions.pdf
- Top One Futures:  
  - https://www.toponefutures.com/home  
  - https://help.toponefutures.com/en/articles/13904665-elite-daily-overview

## Remaining Risk Notes
- A few firms change program terms frequently (splits, payout cadence, scaling caps).  
- `confidence: medium` was assigned where official pages were less structured/less machine-readable (notably FundingPips, Phidias).
- Recommended maintenance cadence: bi-weekly metadata verification.
