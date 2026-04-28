import https from 'https';

const themes = [
  'https://tweakcn.com/themes/cmlh0x713000104jrgmds6vcd',
  'https://tweakcn.com/themes/cmmi8o8ic000904l12ucn8i9p',
  'https://tweakcn.com/themes/cmntqpq8v000004l78eqihlx5',
  'https://tweakcn.com/themes/cmninq0c3000604l25wvb3xgh',
  'https://tweakcn.com/themes/cmoh2uyew000004kzfreohnht',
  'https://tweakcn.com/themes/cmo1jei81000004l734a5ekys',
  'https://tweakcn.com/themes/cmo7mn5wv000204jrbl2rfyxz',
  'https://tweakcn.com/themes/cmo6ofmje000104jub1yg4bos',
  'https://tweakcn.com/themes/cmkjubmo7000604jpa4iidt1u'
];

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  for (const url of themes) {
    console.log(`\n=== ${url} ===`);
    try {
      const html = await fetchHTML(url);
      
      // Try to find embedded styles or inline styles
      const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
      let match;
      const foundStyles = [];
      
      while ((match = styleRegex.exec(html)) !== null) {
        foundStyles.push(match[1]);
      }
      
      if (foundStyles.length > 0) {
        console.log(`Found ${foundStyles.length} style block(s)`);
        // Look for CSS variables in the first style block
        const vars = foundStyles[0].match(/--[a-zA-Z0-9-]+:\s*[^;]+;/g);
        if (vars) {
          console.log(`CSS Variables found: ${vars.length}`);
          console.log(vars.slice(0, 20).join('\n'));
        } else {
          console.log('No CSS variables found in style blocks');
        }
      } else {
        console.log('No style tags found in HTML');
      }
      
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }
}

main().catch(console.error);
