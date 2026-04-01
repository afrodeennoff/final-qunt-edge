#!/usr/bin/env python3
"""
Verify that marketing pages have no sidebar navigation after adding showSidebar={false}

This test checks for ACTUAL sidebar content (nav links, menu items) NOT just layout components.
"""
from playwright.sync_api import sync_playwright
import sys
from pathlib import Path

# Evidence directory
evidence_dir = Path(".sisyphus/evidence")
evidence_dir.mkdir(parents=True, exist_ok=True)

def verify_no_sidebar_nav(page, url, name):
    """Check that page has no sidebar NAVIGATION visible"""
    print(f"\n{'='*60}")
    print(f"Testing: {url}")
    print(f"{'='*60}")

    page.goto(url)
    page.wait_for_load_state("networkidle")

    # Take full page screenshot
    screenshot_path = evidence_dir / f"task-1-no-sidebar-{name}.png"
    page.screenshot(path=str(screenshot_path), full_page=True)
    print(f"✓ Screenshot saved: {screenshot_path}")

    # Check for ACTUAL sidebar navigation elements (not layout wrappers)
    # LandingSidebar contains: navigation links, menu items, sidebar content
    sidebar_nav_selectors = [
        'text="Prop Firms"',  # Nav link in LandingSidebar
        'text="Deals"',       # Nav link in LandingSidebar
        'text="Pricing"',     # Nav link in LandingSidebar
        'text="About"',       # Nav link in LandingSidebar
        'text="Support"',     # Nav link in LandingSidebar
        '[data-sidebar="menu"]',  # Sidebar menu container
        'nav[class*="sidebar"]',  # Nav element with sidebar class
    ]

    sidebar_nav_found = False
    for selector in sidebar_nav_selectors:
        try:
            element = page.locator(selector).first
            if element.is_visible():
                print(f"⚠ WARNING: Found visible sidebar nav: {selector}")
                sidebar_nav_found = True
        except:
            pass  # Element doesn't exist or not visible

    if not sidebar_nav_found:
        print(f"✓ PASS: No sidebar navigation visible on {name}")
        return True
    else:
        print(f"✗ FAIL: Sidebar navigation IS visible on {name}")
        return False

def main():
    base_url = "http://localhost:3000"

    results = {
        "propfirms": False,
        "about": False,
        "pricing": False,
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})

        try:
            # Test marketing pages - these should have NO sidebar navigation
            results["propfirms"] = verify_no_sidebar_nav(page, f"{base_url}/en/propfirms", "propfirms")
            results["about"] = verify_no_sidebar_nav(page, f"{base_url}/en/about", "about")
            results["pricing"] = verify_no_sidebar_nav(page, f"{base_url}/en/pricing", "pricing")

        finally:
            browser.close()

    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    print(f"Prop Firms (no sidebar nav): {'✓ PASS' if results['propfirms'] else '✗ FAIL'}")
    print(f"About (no sidebar nav):      {'✓ PASS' if results['about'] else '✗ FAIL'}")
    print(f"Pricing (no sidebar nav):    {'✓ PASS' if results['pricing'] else '✗ FAIL'}")

    all_passed = all(results.values())
    if all_passed:
        print("\n✓✓✓ ALL TESTS PASSED - Sidebar successfully removed from marketing pages ✓✓✓")
        return 0
    else:
        print("\n✗✗✗ SOME TESTS FAILED ✗✗✗")
        return 1

if __name__ == "__main__":
    sys.exit(main())
