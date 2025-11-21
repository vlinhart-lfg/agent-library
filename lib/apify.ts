import { ApifyClient } from 'apify-client';

// Initialize Apify client
const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export interface ScrapedScenarioData {
  title: string;
  description: string;
  instructions?: string;
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

      // Extract title from meta tags or h1
      let title = '';
      try {
        const ogTitle = $('meta[property="og:title"]').attr('content');
        if (ogTitle) {
            title = ogTitle.replace(' - Make.com Automation Scenario', '').trim();
        }
        
        if (!title) {
            title = $('h1').first().text().trim();
        }
      } catch (e) {
        log.info('Title extraction failed:', e.message);
      }

      // Extract description from meta tags or body
      let description = '';
      try {
        const metaDesc = $('meta[name="description"]').attr('content');
        const ogDesc = $('meta[property="og:description"]').attr('content');
        
        if (metaDesc) description = metaDesc;
        else if (ogDesc) description = ogDesc;
        
        // Fallback to body text if meta tags are missing
        if (!description) {
             const bodyText = document.body.innerText || '';
             const lines = bodyText.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
             if (lines.length > 1) {
                for (let i = 1; i < Math.min(lines.length, 10); i++) {
                    const line = lines[i];
                    if (line.length > 30 && !line.startsWith('Use this') && !line.startsWith('\ud83d\udc47')) {
                        description = line;
                        break;
                    }
                }
             }
        }
      } catch (e) {
        log.info('Description extraction failed:', e.message);
      }

      // Extract instructions
      let instructions = '';
      try {
        const bodyText = document.body.innerText || '';
        // Case insensitive search for headers
        const lowerBody = bodyText.toLowerCase();
        const infoIndex = lowerBody.indexOf('additional information');
        const howToIndex = lowerBody.indexOf('how to use this automation');

        let startIndex = -1;
        if (infoIndex > -1) startIndex = infoIndex;
        else if (howToIndex > -1) startIndex = howToIndex;

        if (startIndex > -1) {
          const instructionsText = bodyText.substring(startIndex, startIndex + 1000);
          instructions = instructionsText
            .split('\\n')
            .slice(0, 20)
            .map(l => l.trim())
            .filter(l => l.length > 0)
            .join('\\n');
        }
      } catch (e) {
         log.info('Instructions extraction failed:', e.message);
      }

      // Extract apps from img alt attributes, excluding author
      let apps = '';
      try {
        const appNames = new Set();
        const excludeNames = ['Make Logo', 'Company Logo', 'Powered by', 'Onetrust'];
        
        // Identify author name to exclude
        let authorName = '';
        try {
            // Look for the author structure: div.dmo-flex.dmo-items-center > p.title
            // This is a heuristic based on the current Make.com layout
            const authorTitle = $('.dmo-flex.dmo-items-center p.title').first();
            if (authorTitle.length > 0) {
                authorName = authorTitle.text().trim();
            }
        } catch(e) {
            log.info('Author detection failed', e.message);
        }

        $('img').each(function() {
          const alt = $(this).attr('alt');

          if (alt && alt.trim().length > 0 && alt.length < 50) {
            // Exclude common non-app images
            const isExcluded = excludeNames.some(excluded => alt.includes(excluded));
            // Exclude author name
            const isAuthor = authorName && alt.includes(authorName);
            
            if (!isExcluded && !isAuthor) {
              appNames.add(alt.trim());
            }
          }
        });

        apps = Array.from(appNames).join(', ');
      } catch (e) {
        log.info('Apps extraction failed:', e.message);
      }

      // Extract interactive iframe URL
      let interactiveIframeUrl = '';
      try {
        const iframe = $('iframe.inspector-frame').first();
        if (iframe.length > 0) {
          interactiveIframeUrl = iframe.attr('src') || '';
          log.info('Found iframe URL: ' + interactiveIframeUrl);
        }
      } catch (e) {
        log.info('Iframe extraction failed:', e.message);
      }

      // Fallback title from slug
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
        instructions: instructions.trim(),
        apps: apps.trim(),
        interactiveIframeUrl: interactiveIframeUrl.trim(),
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

    // Use extracted iframe URL or generate as fallback
    let iframeUrl = scraped.interactiveIframeUrl || '';

    // Fallback: Generate iframe URL if not extracted
    // Pattern: https://eu2.make.com/public/shared-scenario/standalone-inspector-previewer/[SCENARIO_ID]
    if (!iframeUrl) {
      iframeUrl = `https://eu2.make.com/public/shared-scenario/standalone-inspector-previewer/${makeScenarioId}`;
    }

    const buttonUrl = makeScenarioUrl;

    // Return structured data
    return {
      title: scraped.title || 'Untitled Scenario',
      description: scraped.description || '',
      instructions: scraped.instructions || '',
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
