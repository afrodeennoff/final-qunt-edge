"use client";

import type { CSSProperties, HTMLAttributes } from "react";

// ============================================================================
// Shared Types
// ============================================================================

export interface IconProps extends HTMLAttributes<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
  color?: string;
}

// Default duotone fill color (blue with 15% opacity)
const DUOTONE_FILL = "hsl(var(--primary) / 0.15)";

// ============================================================================
// Base SVG Wrapper Component
// ============================================================================

interface BaseSvgProps {
  size: number;
  color: string;
  strokeWidth: number;
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  fill?: string;
}

function BaseSvg({
  size,
  color,
  strokeWidth,
  className,
  style,
  children,
  fill = "none",
}: BaseSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {children}
    </svg>
  );
}

// ============================================================================
// Dashboard Icon - 2x2 grid of squares
// ============================================================================

export function DashboardIcon({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </BaseSvg>
  );
}

export function DashboardIconDuotone({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      fill={DUOTONE_FILL}
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </BaseSvg>
  );
}

// ============================================================================
// Deals Icon - stacked cards/price tag shape
// ============================================================================

export function DealsIcon({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      {...props}
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </BaseSvg>
  );
}

export function DealsIconDuotone({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      fill={DUOTONE_FILL}
      {...props}
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </BaseSvg>
  );
}

// ============================================================================
// Leaderboard Icon - podium/bars with #1 in center
// ============================================================================

export function LeaderboardIcon({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      {...props}
    >
      <path d="M8 21v-6" />
      <path d="M16 21v-10" />
      <path d="M12 21V9" />
      <rect x="4" y="15" width="4" height="6" rx="1" />
      <rect x="10" y="9" width="4" height="12" rx="1" />
      <rect x="16" y="11" width="4" height="10" rx="1" />
    </BaseSvg>
  );
}

export function LeaderboardIconDuotone({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      fill={DUOTONE_FILL}
      {...props}
    >
      <path d="M8 21v-6" />
      <path d="M16 21v-10" />
      <path d="M12 21V9" />
      <rect x="4" y="15" width="4" height="6" rx="1" />
      <rect x="10" y="9" width="4" height="12" rx="1" />
      <rect x="16" y="11" width="4" height="10" rx="1" />
    </BaseSvg>
  );
}

// ============================================================================
// Profile Icon - person silhouette
// ============================================================================

export function ProfileIcon({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      {...props}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </BaseSvg>
  );
}

export function ProfileIconDuotone({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      fill={DUOTONE_FILL}
      {...props}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </BaseSvg>
  );
}

// ============================================================================
// Settings Icon - gear
// ============================================================================

export function SettingsIcon({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </BaseSvg>
  );
}

export function SettingsIconDuotone({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      fill={DUOTONE_FILL}
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </BaseSvg>
  );
}

// ============================================================================
// Reviews Icon - star
// ============================================================================

export function ReviewsIcon({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      {...props}
    >
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </BaseSvg>
  );
}

export function ReviewsIconDuotone({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      fill={DUOTONE_FILL}
      {...props}
    >
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </BaseSvg>
  );
}

// ============================================================================
// Chart Icon - line chart going up
// ============================================================================

export function ChartIcon({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      {...props}
    >
      <path d="M3 3v16a2 2 0 002 2h16" />
      <path d="M7 16l4-4 4 4 6-6" />
    </BaseSvg>
  );
}

export function ChartIconDuotone({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      fill={DUOTONE_FILL}
      {...props}
    >
      <path d="M3 3v16a2 2 0 002 2h16" />
      <path d="M7 16l4-4 4 4 6-6" />
    </BaseSvg>
  );
}

// ============================================================================
// Firm Icon - building/office
// ============================================================================

export function FirmIcon({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      {...props}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </BaseSvg>
  );
}

export function FirmIconDuotone({
  size = 24,
  strokeWidth = 1.5,
  color = "currentColor",
  className,
  style,
  ...props
}: IconProps) {
  return (
    <BaseSvg
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      fill={DUOTONE_FILL}
      {...props}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </BaseSvg>
  );
}

// ============================================================================
// Convenience Exports
// ============================================================================

// Outline icons
export const OutlineIcons = {
  Dashboard: DashboardIcon,
  Deals: DealsIcon,
  Leaderboard: LeaderboardIcon,
  Profile: ProfileIcon,
  Settings: SettingsIcon,
  Reviews: ReviewsIcon,
  Chart: ChartIcon,
  Firm: FirmIcon,
};

// Duotone icons
export const DuotoneIcons = {
  Dashboard: DashboardIconDuotone,
  Deals: DealsIconDuotone,
  Leaderboard: LeaderboardIconDuotone,
  Profile: ProfileIconDuotone,
  Settings: SettingsIconDuotone,
  Reviews: ReviewsIconDuotone,
  Chart: ChartIconDuotone,
  Firm: FirmIconDuotone,
};

// All icons mapped for easy iteration
export const AllIcons = {
  ...OutlineIcons,
  ...DuotoneIcons,
};
