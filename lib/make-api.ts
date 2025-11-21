export interface ScrapedScenarioData {
    title: string;
    description: string;
    instructions: string;
    apps: string;
    appIcons: Array<{ url: string; color: string; name: string }>;
    authorName: string;
    makeScenarioId: string;
    iframeUrl: string;
    buttonUrl: string;
    useCase?: string;
    complexity?: 'Beginner' | 'Intermediate' | 'Advanced';
    tags?: string[];
    createdDate?: string;
}

/**
 * Scrapes icon colors from the Make.com scenario page HTML
 */
async function scrapeIconColors(makeScenarioUrl: string): Promise<Map<string, string>> {
    try {
        const response = await fetch(makeScenarioUrl);
        const html = await response.text();

        const colorMap = new Map<string, string>();

        // Match all pkg-icon divs with their background colors and image sources
        // Example: <div class="pkg-icon" style="background-color: rgb(239, 41, 27);"><img src="static/img/packages/google-email_64.png"
        const iconRegex = /<div[^>]*class="[^"]*pkg-icon[^"]*"[^>]*style="[^"]*background-color:\s*([^;]+);[^>]*>[\s\S]*?<img[^>]*src="[^"]*packages\/([^_]+)_/g;

        let match;
        while ((match = iconRegex.exec(html)) !== null) {
            const color = match[1].trim();
            const packageId = match[2];
            colorMap.set(packageId, color);
        }

        return colorMap;
    } catch (error) {
        console.error('Failed to scrape icon colors:', error);
        return new Map();
    }
}

/**
 * Fetches scenario data directly from Make.com API
 * @param makeScenarioUrl - Full URL to Make.com shared scenario
 * @returns Scraped scenario data
 */
export async function getScenarioData(makeScenarioUrl: string): Promise<ScrapedScenarioData> {
    try {
        // Validate URL
        if (!makeScenarioUrl.includes('make.com/public/shared-scenario')) {
            throw new Error('Invalid Make.com scenario URL');
        }

        // Extract region and scenario ID from URL
        // Format: https://eu2.make.com/public/shared-scenario/8MrnUpeVs8c/...
        const urlObj = new URL(makeScenarioUrl);
        const hostnameParts = urlObj.hostname.split('.');
        const region = hostnameParts[0]; // e.g., 'eu2', 'us1', 'www'

        const pathParts = urlObj.pathname.split('/');
        const scenarioIdIndex = pathParts.indexOf('shared-scenario') + 1;
        const makeScenarioId = pathParts[scenarioIdIndex];

        if (!makeScenarioId) {
            throw new Error('Could not extract scenario ID from URL');
        }

        // Construct API URL
        // Endpoint: https://{region}.make.com/api/v2/public/scenarios-shared/{id}
        // Note: If region is 'www' or missing, it might default to 'eu1' or similar, but usually shared URLs have the region.
        // We'll use the hostname from the input URL to be safe.
        const apiUrl = `https://${urlObj.hostname}/api/v2/public/scenarios-shared/${makeScenarioId}`;

        // Fetch data
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from Make.com API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const scenario = data.scenarioShared;

        if (!scenario) {
            throw new Error('Invalid API response: scenarioShared not found');
        }

        // Map fields
        const title = scenario.title || 'Untitled Scenario';
        const description = scenario.descriptionShort || '';
        const instructions = scenario.descriptionLong || '';


        const appsList = Array.isArray(scenario.scenarioUsedPackages)
            ? scenario.scenarioUsedPackages
            : [];

        const apps = appsList.join(', ');

        // Scrape actual icon colors from the Make.com page
        const colorMap = await scrapeIconColors(makeScenarioUrl);

        // Fallback color function if scraping fails
        const stringToColor = (str: string): string => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            const hue = Math.abs(hash % 360);
            const saturation = 65 + (Math.abs(hash) % 20);
            const lightness = 45 + (Math.abs(hash >> 8) % 15);
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        };

        // Generate icon URLs with colors (use scraped colors or fallback to hash-based)
        const appIcons = appsList.map((pkg: string) => ({
            url: `/api/proxy-image?url=${encodeURIComponent(`https://${urlObj.hostname}/static/img/packages/${pkg}_32.png`)}`,
            color: colorMap.get(pkg) || stringToColor(pkg),
            name: pkg
        }));

        const authorName = scenario.name || '';

        // Construct iframe URL
        // Pattern: https://{region}.make.com/public/shared-scenario/standalone-inspector-previewer/{id}
        const iframeUrl = `https://${urlObj.hostname}/public/shared-scenario/standalone-inspector-previewer/${makeScenarioId}`;

        return {
            title,
            description,
            instructions,
            apps,
            appIcons,
            authorName,
            makeScenarioId,
            iframeUrl,
            buttonUrl: makeScenarioUrl,
        };
    } catch (error: any) {
        throw new Error(`Failed to fetch scenario data: ${error.message}`);
    }
}
