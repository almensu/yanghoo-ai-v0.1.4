const { chromium } = require('playwright');

const TARGET_URL = 'https://themodernsoftware.dev/';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  console.log('🌐 Loading course website...');
  await page.goto(TARGET_URL, {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('📄 Page title:', await page.title());

  // Take a screenshot first to see the page
  await page.screenshot({ path: '/tmp/course-page.png', fullPage: true });
  console.log('📸 Screenshot saved to /tmp/course-page.png');

  // Look for course schedule or syllabus section
  console.log('🔍 Searching for Course Schedule section...');

  // Try to find course schedule related content
  const scheduleSelectors = [
    'h2:has-text("Course Schedule")',
    'h3:has-text("Course Schedule")',
    'h1:has-text("Course Schedule")',
    '[class*="schedule"]',
    '[id*="schedule"]',
    'h2:has-text("Schedule")',
    'h3:has-text("Schedule")',
    'a:has-text("Schedule")',
    'a:has-text("Syllabus")',
    'a:has-text("Readings")'
  ];

  let scheduleFound = false;
  for (const selector of scheduleSelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`✅ Found schedule element: ${selector}`);
        scheduleFound = true;
        break;
      }
    } catch (e) {
      // Continue to next selector
    }
  }

  // Look for any links that might be readings
  console.log('🔗 Searching for reading links...');

  // Get all links on the page
  const allLinks = await page.locator('a[href]').all();
  console.log(`Found ${allLinks.length} total links`);

  // Extract link information
  const readingLinks = [];

  for (let i = 0; i < Math.min(allLinks.length, 50); i++) {
    try {
      const link = allLinks[i];
      const href = await link.getAttribute('href');
      const text = await link.textContent();

      if (href && text && text.trim()) {
        // Clean up the URL
        let fullUrl = href;
        if (href.startsWith('/')) {
          fullUrl = new URL(href, TARGET_URL).href;
        } else if (!href.startsWith('http')) {
          fullUrl = new URL(href, TARGET_URL).href;
        }

        readingLinks.push({
          text: text.trim(),
          url: fullUrl
        });
      }
    } catch (e) {
      // Skip problematic links
    }
  }

  // Print all links found
  console.log('\n📚 All Links Found:');
  readingLinks.forEach((link, index) => {
    console.log(`${index + 1}. ${link.text}`);
    console.log(`   URL: ${link.url}\n`);
  });

  // Look for specific patterns that might indicate readings
  console.log('🔍 Searching for reading-specific content...');

  // Look for text patterns like "Reading", "Assignment", "Week", etc.
  const textContent = await page.textContent('body');

  // Try to find sections with weeks or readings
  const weekPattern = /(?:Week|Reading|Assignment)\s*\d+/gi;
  const weeks = textContent.match(weekPattern);

  if (weeks) {
    console.log('📅 Found week/reading patterns:', weeks);
  }

  // Get page content for manual inspection
  console.log('\n📄 Page content excerpt:');
  const bodyText = await page.textContent('body');
  const excerpt = bodyText.substring(0, 2000);
  console.log(excerpt);

  // Save full HTML for inspection
  const htmlContent = await page.content();
  require('fs').writeFileSync('/tmp/course-page.html', htmlContent);
  console.log('\n💾 Full HTML saved to /tmp/course-page.html');

  await browser.close();
})();