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

    // Run the actor with pageFunction as string
    // NOTE: pageFunction runs in browser context, NOT with Puppeteer page object
    const pageFunction = `async function pageFunction(context) {
      const { request, log, waitFor, jQuery: $ } = context;

      // Wait for page to load dynamic content
      try {
        await waitFor(5000); // Wait 5 seconds for JS to render
      } catch (e) {
        log.info('Wait timeout, continuing...');
      }

      // Extract title using jQuery
      let title = '';
      try {
        title = $('h1').first().text() ||
                $('[data-testid="scenario-title"]').first().text() ||
                $('.scenario-title').first().text() ||
                $('title').first().text() ||
                document.title;
      } catch (e) {
        log.info('Title extraction failed:', e.message);
      }

      // Extract description
      let description = '';
      try {
        description = $('[data-testid="scenario-description"]').first().text() ||
                      $('.scenario-description').first().text() ||
                      $('.description').first().text() ||
                      $('meta[name="description"]').attr('content') || '';
      } catch (e) {
        log.info('Description extraction failed:', e.message);
      }

      // Extract apps/services from images in the imt-ui-pkg-icons container
      let apps = '';
      try {
        const appNames = new Set();

        // Make.com uses imt-ui-pkg-icons > imt-ui-pkg-icon > div > img structure
        $('imt-ui-pkg-icons img, imt-ui-pkg-icon img').each(function() {
          const alt = $(this).attr('alt');
          const src = $(this).attr('src');

          if (alt && alt.length > 0 && alt.length < 50) {
            // Clean up the alt text (e.g., "Make AI Content Extractor" -> "Make AI Content Extractor")
            appNames.add(alt.trim());
          } else if (src) {
            // Try to extract app name from src path (e.g., /static/img/packages/make-ai-extractors_64.png)
            const match = src.match(/packages\/([^_/]+)/);
            if (match) {
              const appName = match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              appNames.add(appName);
            }
          }
        });

        // Fallback: try general selectors
        if (appNames.size === 0) {
          $('[class*="pkg-icon"] img, .app-icon img, [class*="module"] img').each(function() {
            const alt = $(this).attr('alt');
            if (alt && alt.length > 0 && alt.length < 50) {
              appNames.add(alt.trim());
            }
          });
        }

        apps = Array.from(appNames).join(', ');
      } catch (e) {
        log.info('Apps extraction failed:', e.message);
      }

      // If no title found, use URL slug as fallback
      if (!title || title.trim().length === 0) {
        const urlParts = request.url.split('/');
        const slug = urlParts[urlParts.length - 1];
        title = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      return {
        url: request.url,
        title: title.trim(),
        description: description.trim(),
        apps: apps.trim(),
      };
    }`;

    const run = await client.actor(actorId).call({
      startUrls: [{ url: makeScenarioUrl }],
      pageFunction: pageFunction,
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
