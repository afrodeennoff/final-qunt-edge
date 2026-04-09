"use client";

import { useEffect } from "react";
import { getThemeClassForPathname } from "./theme-route";

// Client component that bootstraps the theme based on the current route
export default function ThemeRouteInitializer() {
  useEffect(() => {
    try {
      const cls = getThemeClassForPathname(window.location.pathname);
      const root = document.documentElement;
      // Remove any previous theme classes and apply the computed one
      root.classList.remove("light", "dark");
      root.classList.add(cls);
    } catch (e) {
      // Best-effort: do not fail rendering
       
      console.error("ThemeRouteInitializer failed", e);
    }
  }, []);

  return null;
}
