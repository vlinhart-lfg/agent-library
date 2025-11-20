import { ApifyClient } from 'apify-client';

// Initialize Apify client
const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export interface ScrapedScenarioData {
  title: string;
  description: string;
  apps: string;
  category?: string;
  makeScenarioId: string;
  iframeUrl: string;
  buttonUrl: string;
}

/**
 * Scrapes Make.com scenario page using Apify
 * @param makeScenarioUrl - Full URL to Make.com shared scenario
 * @returns Scraped scenario data
 */
export async function scrapeScenario(
  makeScenarioUrl: string
): Promise<ScrapedScenarioData> {
  try {
    // Validate URL
    if (!makeScenarioUrl.includes('make.com/public/shared-scenario')) {
      throw new Error('Invalid Make.com scenario URL');
    }

    // Extract scenario ID from URL
    // Format: https://eu2.make.com/public/shared-scenario/8MrnUpeVs8c/...
    const urlParts = makeScenarioUrl.split('/');
    const scenarioIdIndex = urlParts.indexOf('shared-scenario') + 1;
    const makeScenarioId = urlParts[scenarioIdIndex];

    if (!makeScenarioId) {
      throw new Error('Could not extract scenario ID from URL');
    }

    // Use Apify Web Scraper actor
    const actorId = process.env.APIFY_ACTOR_ID || 'apify/web-scraper';

    // Run the actor
    const run = await client.actor(actorId).call({
      startUrls: [{ url: makeScenarioUrl }],
      pageFunction: async function pageFunction(context: any) {
        const { page, request } = context;

        // Wait for page to load
        await page.waitForTimeout(3000);

        // Extract title
        let title = '';
        try {
          const titleEl = await page.$('h1, [data-testid="scenario-title"], .scenario-title');
          if (titleEl) {
            title = await page.evaluate((el: any) => el.textContent, titleEl);
          }
        } catch (e) {
          console.log('Title not found, will use URL slug');
        }

        // Extract description
        let description = '';
        try {
          const descEl = await page.$(
            '[data-testid="scenario-description"], .scenario-description, .description'
          );
          if (descEl) {
            description = await page.evaluate((el: any) => el.textContent, descEl);
          }
        } catch (e) {
          console.log('Description not found');
        }

        // Extract apps/services used (from module cards or labels)
        let apps = '';
        try {
          const appEls = await page.$$('[data-testid="module-icon"], .module-card, .app-icon');
          const appNames = [];
          for (const el of appEls) {
            const alt = await page.evaluate((e: any) => e.getAttribute('alt'), el);
            const title = await page.evaluate((e: any) => e.getAttribute('title'), el);
            const text = await page.evaluate((e: any) => e.textContent, el);
            const appName = alt || title || text;
            if (appName && !appNames.includes(appName)) {
              appNames.push(appName.trim());
            }
          }
          apps = appNames.join(', ');
        } catch (e) {
          console.log('Apps not found');
        }

        // If no data found, use fallback
        if (!title) {
          // Use URL slug as fallback
          const urlParts = request.url.split('/');
          const slug = urlParts[urlParts.length - 1];
          title = slug
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }

        return {
          url: request.url,
          title: title.trim(),
          description: description.trim(),
          apps: apps.trim(),
        };
      },
      proxyConfiguration: {
        useApifyProxy: true,
      },
      maxRequestRetries: 2,
      maxConcurrency: 1,
    });

    // Wait for the actor to finish
    await client.run(run.id).waitForFinish();

    // Fetch results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      throw new Error('No data extracted from page');
    }

    const scraped = items[0];

    // Generate iframe and button URLs
    const iframeUrl = makeScenarioUrl.replace('/public/', '/embed/');
    const buttonUrl = makeScenarioUrl;

    // Return structured data
    return {
      title: scraped.title || 'Untitled Scenario',
      description: scraped.description || '',
      apps: scraped.apps || '',
      category: undefined, // Will be determined by AI
      makeScenarioId,
      iframeUrl,
      buttonUrl,
    };
  } catch (error: any) {
    console.error('Apify scraping error:', error);
    throw new Error(`Failed to scrape scenario: ${error.message}`);
  }
}

/**
 * Check Apify account usage and limits
 */
export async function checkApifyUsage() {
  try {
    const user = await client.user().get();
    return {
      username: user?.username,
      plan: user?.proxy?.plan,
      // Add more usage details as needed
    };
  } catch (error) {
    console.error('Failed to check Apify usage:', error);
    return null;
  }
}
