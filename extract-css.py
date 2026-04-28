from playwright.sync_api import sync_playwright

themes = [
  'https://tweakcn.com/themes/cmlh0x713000104jrgmds6vcd',
  'https://tweakcn.com/themes/cmmi8o8ic000904l12ucn8i9p',
  'https://tweakcn.com/themes/cmntqpq8v000004l78eqihlx5',
  'https://tweakcn.com/themes/cmninq0c3000604l25wvb3xgh',
  'https://tweakcn.com/themes/cmoh2uyew000004kzfreohnht',
  'https://tweakcn.com/themes/cmo1jei81000004l734a5ekys',
  'https://tweakcn.com/themes/cmo7mn5wv000204jrbl2rfyxz',
  'https://tweakcn.com/themes/cmo6ofmje000104jub1yg4bos',
  'https://tweakcn.com/themes/cmkjubmo7000604jpa4iidt1u'
]

def extract_css_variables(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(url, wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(2000)
        
        # Get CSS variables from computed styles
        style_vars = page.evaluate("""
            () => {
                const root = document.documentElement;
                const computed = getComputedStyle(root);
                const variables = {};
                
                for (let i = 0; i < computed.length; i++) {
                    const prop = computed[i];
                    if (prop.startsWith('--')) {
                        variables[prop] = computed.getPropertyValue(prop).trim();
                    }
                }
                
                return variables;
            }
        """)
        
        browser.close()
        return style_vars

results = {}
for url in themes:
    print(f"\n=== {url} ===")
    try:
        vars = extract_css_variables(url)
        
        # Filter for common theme variables
        common_keys = [
          '--background', '--foreground', '--card', '--card-foreground',
          '--popover', '--popover-foreground', '--primary', '--primary-foreground',
          '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
          '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
          '--border', '--input', '--ring', '--radius'
        ]
        
        common_vars = {}
        for key in common_keys:
            if key in vars:
                common_vars[key] = vars[key]
        
        if common_vars:
            results[url] = common_vars
            print(f"Found {len(common_vars)} common CSS variables")
            print(common_vars)
        else:
            print(f"Found {len(vars)} total CSS variables, but no common ones")
            # Print a sample
            sample_keys = list(vars.keys())[:10]
            print("Sample:", sample_keys)
            
    except Exception as e:
        print(f"Error: {e}")

import json
with open('theme-results.json', 'w') as f:
    json.dump(results, f, indent=2)

print("\n\nResults saved to theme-results.json")
