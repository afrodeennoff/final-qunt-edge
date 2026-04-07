## [Session Start] Decisions Log

### Architecture Decisions
- UnifiedSidebar refactored into composable primitives (sidebar-primitives/)
- All 3 layouts unified on SidebarRootProviders
- MobileBottomNav generalized with items config
- Admin gets user menu with avatar, timezone, logout

### Design Decisions
- HEADER_Z_INDEX = z-50 (upgrading Teams from z-40)
- HEADER_BORDER = border-b border-border/60 (standardizing from /70)
- styleVariant standardized across all surfaces
