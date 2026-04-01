#!/usr/bin/env python3
"""
Inspect page structure to understand what's being rendered
"""
from playwright.sync_api import sync_playwright
import sys
from pathlib import Path

# Evidence directory
evidence_dir = Path(".sisyphus/evidence")
evidence_dir.mkdir(parents=True, exist_ok=True)

def inspect_page(page, url, name):
    """Inspect page to see what components are rendered"""
    print(f"\n{'='*60}")
    print(f"Inspecting: {url}")
    print(f"{'='*60}")

    page.goto(url)
    page.wait_for_load_state("networkidle")

    # Check for LandingSidebar component
    # LandingSidebar is defined in: components/sidebar/landing-sidebar.tsx
    # It contains navigation items like "Home", "Prop Firms", "Deals", etc.

    # The sidebar would be a left-side panel with these links
    # Let's check if there's a left sidebar structure

    # Check for UnifiedSidebar or LandingSidebar data attributes
    sidebar_container = page.locator('div[class*="sidebar"]').all()
    print(f"\nFound {len(sidebar_container)} elements with 'sidebar' in class name")

    # Check specifically for the sidebar navigation structure
    # UnifiedSidebar renders navigation with data-sidebar attributes
    nav_elements = page.locator('[data-sidebar]').all()
    print(f"Found {len(nav_elements)} elements with data-sidebar attribute")

    # Check if there's a left-side sidebar panel
    # Sidebar would typically be: position fixed/sticky, left side, width ~16rem or 72px
    left_panels = page.locator('aside').all()
    print(f"Found {len(left_panels)} aside elements")

    # Check for navigation within potential sidebar
    for i, panel in enumerate(left_panels):
        try:
            if panel.is_visible():
                print(f"\nAside {i} is visible:")
                # Get its classes to see if it's a sidebar
                classes = panel.get_attribute('class') or ''
                print(f"  Classes: {classes}")

                # Check if it's on the left side
                bbox = panel.bounding_box()
                if bbox:
                    print(f"  Position: x={bbox['x']}, y={bbox['y']}, width={bbox['width']}, height={bbox['height']}")
                    if bbox['x'] < 100:  # Left side of page
                        print(f"  → This appears to be a LEFT SIDEBAR")

                        # Get its text content to see if it's the landing sidebar
                        text = panel.inner_text()
                        print(f"  Content preview: {text[:100]}...")

        except:
            pass

    # Also check for LandingSidebar specifically
    # It's dynamically imported so let's see if it's in the DOM
    landing_sidebar = page.locator('text=Home').locator('xpath=ancestor::div[contains(@class, "sidebar") or contains(@data-sidebar, "sidebar")]').first')
    try:
        if landing_sidebar.is_visible():
            print(f"\n⚠ LandingSidebar navigation IS visible")
    except:
        print(f"\n✓ LandingSidebar navigation NOT visible")

    # Screenshot for manual inspection
    screenshot_path = evidence_dir / f"inspect-{name}.png"
    page.screenshot(path=str(screenshot_path), full_page=True)
    print(f"\n✓ Screenshot saved: {screenshot_path}")

def main():
    base_url = "http://localhost:3000"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Run with visible browser for debugging
        page = browser.new_page(viewport={"width": 1920, "height": 1080})

        try:
            inspect_page(page, f"{base_url}/en/propfirms", "propfirms")
            input("\nPress Enter to continue to next page...")

            inspect_page(page, f"{base_url}/en/about", "about")
            input("\nPress Enter to continue...")

            # For comparison, let's also check dashboard (which should have sidebar)
            print(f"\n{'='*60}")
            print(f"For comparison: Dashboard (should HAVE sidebar)")
            print(f"{'='*60}")
            page.goto(f"{base_url}/en/dashboard")
            page.wait_for_load_state("networkidle")

            # Dashboard redirects to auth if not logged in
            if "authentication" in page.url:
                print(f"Redirected to: {page.url}")
                print(f"⚠ Cannot check dashboard without auth credentials")
            else:
                screenshot_path = evidence_dir / f"inspect-dashboard.png"
                page.screenshot(path=str(screenshot_path), full_page=True)
                print(f"✓ Dashboard screenshot saved")

        finally:
            browser.close()

    return 0

if __name__ == "__main__":
    sys.exit(main())
