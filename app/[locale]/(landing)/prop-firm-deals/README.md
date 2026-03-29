# Prop Firm Deals Page

This route powers `/{locale}/prop-firm-deals`.

## Edit content

This page is database-backed. Update data through the server sources:

- `getActiveDeals()` in `server/deals.ts` for featured/latest deal cards.
- `getUnifiedFirms()` in `server/deals.ts` for comparison table rows.
- `getDefaultFaqs()` in `server/deals.ts` for FAQ accordion + FAQ schema.

## Data model

Types are defined in `app/[locale]/(landing)/prop-firm-deals/data/types.ts`.
The route maps server return values into these view-model types in
`app/[locale]/(landing)/prop-firm-deals/page.tsx`.

## Main UI

`app/[locale]/(landing)/prop-firm-deals/components/prop-firm-deals-experience.tsx`
contains filtering, search, sorting, responsive table/cards, trust block, tools/community CTAs, and FAQ accordion.
