#!/usr/bin/env python3
"""
Properly verify LandingSidebar is not rendered.

Checks for the actual sidebar component structure (left panel with navigation),
not just navigation links (which are in the top Navbar).
"""
from playwright.sync_api import sync_playwright
import sys
from pathlib import Path

# Evidence directory
evidence_dir = Path(".sisyphus/evidence")
evidence_dir.mkdir(parents=True, exist_ok=True)

def verify_no_landing_sidebar(page, url, name):
    """
    Check that LandingSidebar component is NOT rendered.

    LandingSidebar (components/sidebar/landing-sidebar.tsx) renders:
    - UnifiedSidebar wrapper with collapsible="icon"
    - Left sidebar panel with width ~16rem
    - Navigation menu items
    - Footer with user info (if authenticated)
    """
    print(f"\n{'='*60}")
    print(f"Testing: {url}")
    print(f"{'='*60}")

    page.goto(url)
    page.wait_for_load_state("networkidle")

    # Screenshot for visual verification
    screenshot_path = evidence_dir / f"task-1-no-sidebar-{name}.png"
    page.screenshot(path=str(screenshot_path), full_page=True)
    print(f"✓ Screenshot saved: {screenshot_path}")

    # Check for the ACTUAL LandingSidebar component structure
    # UnifiedSidebar renders a <div data-sidebar="sidebar"> element
    # with the sidebar navigation inside
    sidebar_selectors = [
        '[data-sidebar="sidebar"]',  # The main sidebar container
    ]

    sidebar_found = False
    for selector in sidebar_selectors:
        try:
            element = page.locator(selector).first
            if element.is_visible():
                print(f"⚠ WARNING: Found visible sidebar: {selector}")
                sidebar_found = True

                # Get more info about what we found
                classes = element.get_attribute('class') or ''
                print(f"  Classes: {classes}")

                # Check if it's a left sidebar
                bbox = element.bounding_box()
                if bbox:
                    print(f"  Position: x={bbox['x']}, width={bbox['width']}")
                    if bbox['x'] < 100 and bbox['width'] > 200:
                        print(f"  → This is a LEFT SIDEBAR PANEL (should not exist on marketing pages)")
        except:
            pass  # Element doesn't exist

    if not sidebar_found:
        print(f"✓ PASS: No LandingSidebar component visible on {name}")
        return True
    else:
        print(f"✗ FAIL: LandingSidebar component IS visible on {name}")
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
            # Test marketing pages
            results["propfirms"] = verify_no_landing_sidebar(page, f"{base_url}/en/propfirms", "propfirms")
            results["about"] = verify_no_landing_sidebar(page, f"{base_url}/en/about", "about")
            results["pricing"] = verify_no_landing_sidebar(page, f"{base_url}/en/pricing", "pricing")

        finally:
            browser.close()

    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    print(f"Prop Firms (no LandingSidebar): {'✓ PASS' if results['propfirms'] else '✗ FAIL'}")
    print(f"About (no LandingSidebar):      {'✓ PASS' if results['about'] else '✗ FAIL'}")
    print(f"Pricing (no LandingSidebar):    {'✓ PASS' if results['pricing'] else '✗ FAIL'}")

    all_passed = all(results.values())
    if all_passed:
        print("\n✓✓✓ ALL TESTS PASSED ✓✓✓")
        print("LandingSidebar successfully removed from marketing pages")
        return 0
    else:
        print("\n✗✗✗ SOME TESTS FAILED ✗✗✗")
        return 1

if __name__ == "__main__":
    sys.exit(main())
