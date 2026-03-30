from playwright.sync_api import sync_playwright


def check_page_errors(url: str) -> list:
    """Navigate to URL, capture console errors, return list of error messages."""
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture all console messages
        def handle_console(msg):
            if msg.type == 'error':
                location = msg.location
                location_info = f" ({location['url']}:{location['lineNumber']})" if location else ""
                errors.append(f"[{url}] Console Error{location_info}: {msg.text}")

        page.on('console', handle_console)

        # Capture page errors (uncaught exceptions)
        def handle_page_error(error):
            errors.append(f"[{url}] Page Error: {error}")

        page.on('pageerror', handle_page_error)

        # Capture failed requests
        def handle_response(response):
            if response.status >= 500:
                errors.append(f"[{url}] HTTP {response.status} on {response.url}")

        page.on('response', handle_response)

        try:
            page.goto(url, wait_until='networkidle', timeout=30000)
            # Extra wait for React to hydrate
            page.wait_for_timeout(2000)
        except Exception as e:
            errors.append(f"[{url}] Navigation Error: {e}")

        browser.close()

    return errors


def main():
    pages = [
        'http://localhost:3000/en',
        'http://localhost:3000/fr',
    ]

    all_errors = []

    for page_url in pages:
        print(f"\n{'='*60}")
        print(f"Testing: {page_url}")
        print('='*60)
        errors = check_page_errors(page_url)
        if errors:
            all_errors.extend(errors)
            for err in errors:
                print(err)
        else:
            print("No console errors found.")

    print(f"\n{'='*60}")
    print("SUMMARY")
    print('='*60)
    if all_errors:
        print(f"Total errors found: {len(all_errors)}")
        for err in all_errors:
            print(f"  - {err}")
    else:
        print("No console errors on any page.")


if __name__ == '__main__':
    main()
