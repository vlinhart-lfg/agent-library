
export interface ScrapedScenarioData {
    title: string;
    description: string;
    instructions?: string;
    apps: string;
    appIcons: string[];
    authorName?: string;
    category?: string;
    makeScenarioId: string;
    iframeUrl: string;
    buttonUrl: string;
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

        // Generate icon URLs
        // Pattern: https://{region}.make.com/static/img/packages/{package}_32.png
        // We use the region from the input URL or default to 'eu1' if not found (though hostname usually has it)
        const appIcons = appsList.map((pkg: string) =>
            `/api/proxy-image?url=${encodeURIComponent(`https://${urlObj.hostname}/static/img/packages/${pkg}_32.png`)}`
        );

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
            category: undefined, // Will be determined by AI
            makeScenarioId,
            iframeUrl,
            buttonUrl: makeScenarioUrl,
        };
    } catch (error: any) {
        console.error('Make.com API error:', error);
        throw new Error(`Failed to fetch scenario data: ${error.message}`);
    }
}
