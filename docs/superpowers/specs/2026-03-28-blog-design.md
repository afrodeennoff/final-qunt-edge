# Blog Feature — Design Specification

**Date:** 2026-03-28
**Status:** Approved
**Author:** AI (based on user requirements)

---

## 1. Overview

A public education blog system where admins create and manage blog posts from the admin panel. Blog posts appear publicly at `/blogs` with individual post pages. Community (forum) posts at `/community` are separate — no integration between the two.

---

## 2. Data Model

### Prisma Schema

**New enum `BlogCategory`:**
```prisma
enum BlogCategory {
  TRADING_TIPS
  MARKET_ANALYSIS
  PSYCHOLOGY
  RISK_MANAGEMENT
  PLATFORM_UPDATES
}
```

**New model `BlogPost`:**
```prisma
model BlogPost {
  id         String       @id @default(cuid())
  title      String
  slug      String       @unique
  excerpt   String
  content   String       @db.Text
  coverImage String?
  category  BlogCategory
  authorId  String
  published Boolean      @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author User      @relation(fields: [authorId], references: [id])
  @@index([authorId])
  @@index([slug])
  @@index([published])
  @@index([category])
}
```

**Add to existing `User` model:**
```prisma
blogPosts BlogPost[] @relation("BlogPostAuthor")
```

---

## 3. Routes

| Route | Type | Purpose |
|---|---|---|
| `/[locale]/blogs` | Public page | Blog listing with category filter |
| `/[locale]/blogs/[slug]` | Public page | Full blog post detail |
| `/[locale]/admin/blogs` | Admin page | Blog management — list, edit, delete, publish |
| `/[locale]/admin/blogs/new` | Admin page | Create new blog post |
| `/[locale]/admin/blogs/[id]/edit` | Admin page | Edit existing blog post |

---

## 4. Public Pages

### Blog Listing (`/blogs`)

- Uses `UnifiedPageShell` + `UnifiedSurface` wrappers
- Grid of blog cards (2-3 columns responsive)
- Each card: cover image (if set), category badge, title, excerpt (2-line clamp), author name, date
- Category filter tabs: All, Trading Tips, Market Analysis, Psychology, Risk Management, Platform Updates
- Search by title
- Only shows `published: true` posts
- Ordered by `createdAt` desc

### Blog Detail (`/blogs/[slug]`)

- Uses `UnifiedPageShell`
- Cover image at top (if set)
- Title, category badge, author, date
- Full rich content (rendered HTML from Tiptap)
- Back to blogs link
- Metadata: OG image generated from slug

---

## 5. Admin Pages

### Blog Admin Listing (`/admin/blogs`)

- Table/list of all blog posts
- Columns: title, slug, category, author, published status, date, actions
- Actions per row: Edit, Delete, Toggle Publish
- "New Post" button → `/admin/blogs/new`
- Search by title

### Blog Admin Form (`/admin/blogs/new` and `/admin/blogs/[id]/edit`)

- Title input (required)
- Slug input (auto-generated from title, editable, required)
- Excerpt textarea (required, max 200 chars)
- Category dropdown (required, from enum)
- Cover image URL input (optional)
- Rich text editor (Tiptap) for content (required)
- Published toggle
- Save / Cancel buttons

---

## 6. Server Actions

All in `app/[locale]/admin/actions/blog-actions.ts`:

| Action | Purpose |
|---|---|
| `getBlogPosts(published?)` | List posts, optionally filter by published status |
| `getBlogPost(id)` | Get single post by ID |
| `getBlogPostBySlug(slug)` | Get single post by slug (public) |
| `createBlogPost(data)` | Create new post — requires admin auth, sets authorId from session |
| `updateBlogPost(id, data)` | Update post — requires admin auth, must be author or admin |
| `deleteBlogPost(id)` | Delete post — requires admin auth |
| `togglePublish(id)` | Toggle published status — requires admin auth |

Author is always the logged-in admin user (pulled from Supabase auth session).

---

## 7. Translations

Add to `locales/en/common.ts` and `locales/fr/common.ts`:
- `blogs.title`, `blogs.description`
- `blogs.category.tradingTips`, `blogs.category.marketAnalysis`, `blogs.category.psychology`, `blogs.category.riskManagement`, `blogs.category.platformUpdates`
- `blogs.admin.title`, `blogs.admin.newPost`, `blogs.admin.editPost`, `blogs.admin.deletePost`, `blogs.admin.published`, `blogs.admin.draft`
- Form labels: title, slug, excerpt, coverImage, category, content, published

---

## 8. Styling

- Uses existing V2 components: `CardV2`, `ButtonV2`, `BadgeV2`, `InputV2`, `TextareaV2`
- Uses existing `UnifiedPageShell` + `UnifiedSurface` wrappers
- Category badges: consistent color coding
- Cover images: 16:9 aspect ratio, rounded-2xl, object-cover
- Typography: follows existing landing page patterns
- No hardcoded hex colors — use semantic tokens

---

## 9. Security

- All admin routes require admin authentication (via `assertAdminAccess`)
- Public routes are read-only, no auth required
- Slugs are unique — enforced at DB level
- XSS prevention: content is stored as HTML from Tiptap (sanitized on output)
- Cover image URL: validated as valid URL format

---

## 10. Implementation Order

1. Prisma: Add enum + model + migration
2. Translations: Add all blog strings
3. Server actions: CRUD operations
4. Public pages: listing + detail
5. Admin pages: listing + form
6. Navigation: Add blogs link to landing nav
7. Verification: TypeScript, typecheck, QA
