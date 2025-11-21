module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/make-api.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getScenarioData",
    ()=>getScenarioData
]);
async function getScenarioData(makeScenarioUrl) {
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
        const appsList = Array.isArray(scenario.scenarioUsedPackages) ? scenario.scenarioUsedPackages : [];
        const apps = appsList.join(', ');
        // Generate icon URLs
        // Pattern: https://{region}.make.com/static/img/packages/{package}_32.png
        // We use the region from the input URL or default to 'eu1' if not found (though hostname usually has it)
        const appIcons = appsList.map((pkg)=>`/api/proxy-image?url=${encodeURIComponent(`https://${urlObj.hostname}/static/img/packages/${pkg}_32.png`)}`);
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
            category: undefined,
            makeScenarioId,
            iframeUrl,
            buttonUrl: makeScenarioUrl
        };
    } catch (error) {
        console.error('Make.com API error:', error);
        throw new Error(`Failed to fetch scenario data: ${error.message}`);
    }
}
}),
"[project]/app/api/scrape/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$make$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/make-api.ts [app-route] (ecmascript)");
;
;
;
// Rate limiting map (in-memory)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 3600000; // 1 hour
const MAX_SCRAPES_PER_HOUR = parseInt(process.env.RATE_LIMIT_SCRAPES_PER_HOUR || '50');
const scrapeSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    makeScenarioUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url(),
    enhance: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
});
async function POST(request) {
    try {
        // 1. Rate Limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();
        const userLimit = rateLimit.get(ip) || {
            count: 0,
            timestamp: now
        };
        if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
            userLimit.count = 0;
            userLimit.timestamp = now;
        }
        if (userLimit.count >= MAX_SCRAPES_PER_HOUR) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Rate limit exceeded. Please try again later.'
            }, {
                status: 429
            });
        }
        userLimit.count++;
        rateLimit.set(ip, userLimit);
        // 2. Input Validation
        const body = await request.json();
        const validation = scrapeSchema.safeParse(body);
        if (!validation.success) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid URL provided'
            }, {
                status: 400
            });
        }
        const { makeScenarioUrl } = validation.data;
        // 3. Fetch Data from Make.com API
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$make$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getScenarioData"])(makeScenarioUrl);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data
            });
        } catch (error) {
            console.error('Scraping failed:', error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: error.message || 'Failed to fetch scenario data'
            }, {
                status: 500
            });
        }
    } catch (error) {
        console.error('API Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c0e3c44d._.js.map