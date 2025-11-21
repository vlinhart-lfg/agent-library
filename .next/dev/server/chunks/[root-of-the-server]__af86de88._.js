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
"[project]/lib/github.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkDuplicateScenario",
    ()=>checkDuplicateScenario,
    "publishScenario",
    ()=>publishScenario
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$octokit$2f$rest$2f$dist$2d$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@octokit/rest/dist-src/index.js [app-route] (ecmascript)");
;
// Initialize GitHub client
const octokit = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$octokit$2f$rest$2f$dist$2d$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Octokit"]({
    auth: process.env.GITHUB_PAT
});
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'vlinhart-lfg';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'agent-library';
const REPO_BRANCH = process.env.GITHUB_REPO_BRANCH || 'main';
/**
 * Read current templates.json from GitHub
 */ async function readTemplatesJson() {
    try {
        const { data } = await octokit.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: 'data/templates.json',
            ref: REPO_BRANCH
        });
        if ('content' in data) {
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            return JSON.parse(content);
        }
        throw new Error('Unable to read templates.json');
    } catch (error) {
        console.error('Error reading templates.json:', error);
        throw new Error('Failed to read existing scenarios');
    }
}
/**
 * Generate unique slug from title
 */ function generateSlug(title, existingSlugs) {
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    // Handle collisions
    let finalSlug = slug;
    let counter = 1;
    while(existingSlugs.includes(finalSlug)){
        finalSlug = `${slug}-${counter}`;
        counter++;
    }
    return finalSlug;
}
/**
 * Extract scenario ID from Make.com URL
 */ function extractScenarioId(url) {
    const match = url.match(/shared-scenario\/([^\/]+)/);
    return match ? match[1] : '';
}
async function checkDuplicateScenario(makeScenarioUrl) {
    try {
        const templates = await readTemplatesJson();
        const scenarioId = extractScenarioId(makeScenarioUrl);
        return templates.some((t)=>t.makeScenarioId === scenarioId || t.makeScenarioUrl === makeScenarioUrl);
    } catch (error) {
        console.error('Error checking duplicates:', error);
        return false;
    }
}
async function publishScenario(data) {
    try {
        // Check for duplicates
        const isDuplicate = await checkDuplicateScenario(data.makeScenarioUrl);
        if (isDuplicate) {
            throw new Error('This scenario has already been submitted');
        }
        // Read current templates
        const templates = await readTemplatesJson();
        // Generate new ID (increment from max)
        const maxId = templates.length > 0 ? Math.max(...templates.map((t)=>parseInt(t.id))) : 0;
        const newId = (maxId + 1).toString();
        // Generate unique slug
        const existingSlugs = templates.map((t)=>t.slug);
        const slug = generateSlug(data.title, existingSlugs);
        // Extract scenario ID
        const makeScenarioId = extractScenarioId(data.makeScenarioUrl);
        // Parse apps
        const appsArray = data.apps.split(',').map((app)=>app.trim());
        // Build new scenario entry
        const newScenario = {
            id: newId,
            slug,
            title: data.title,
            description: data.description,
            fullDescription: data.description,
            previewImage: '/placeholder.svg?height=400&width=600',
            category: data.category,
            tags: appsArray.map((app)=>app.toLowerCase()),
            complexity: 'Intermediate',
            useCase: data.description.split('.')[0] || data.description,
            createdAt: new Date().toISOString().split('T')[0],
            makeScenarioUrl: data.makeScenarioUrl,
            makeScenarioId,
            makeIframeUrl: data.iframeUrl || '',
            makeApps: appsArray,
            submittedBy: 'anonymous',
            submittedAt: new Date().toISOString(),
            status: 'published',
            aiEnhanced: true
        };
        // Add to templates array
        const updatedTemplates = [
            ...templates,
            newScenario
        ];
        // Get current file SHA
        const { data: fileData } = await octokit.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: 'data/templates.json',
            ref: REPO_BRANCH
        });
        const sha = 'sha' in fileData ? fileData.sha : '';
        // Commit to GitHub
        const commitMessage = `feat: add ${data.title} scenario via community submission

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: 'data/templates.json',
            message: commitMessage,
            content: Buffer.from(JSON.stringify(updatedTemplates, null, 2)).toString('base64'),
            sha,
            branch: REPO_BRANCH
        });
        return {
            success: true,
            scenarioId: newId,
            slug
        };
    } catch (error) {
        console.error('Error publishing scenario:', error);
        throw new Error(error.message || 'Failed to publish scenario to GitHub');
    }
}
}),
"[externals]/jsdom [external] (jsdom, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("jsdom", () => require("jsdom"));

module.exports = mod;
}),
"[project]/lib/sanitize.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sanitizeMakeIframeUrl",
    ()=>sanitizeMakeIframeUrl,
    "sanitizeScenarioData",
    ()=>sanitizeScenarioData,
    "sanitizeText",
    ()=>sanitizeText,
    "sanitizeUrl",
    ()=>sanitizeUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$isomorphic$2d$dompurify$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/isomorphic-dompurify/index.js [app-route] (ecmascript)");
;
function sanitizeText(input) {
    // Remove any HTML tags and potentially malicious content
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$isomorphic$2d$dompurify$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    }).trim();
}
function sanitizeUrl(url, allowedDomains = []) {
    try {
        const parsed = new URL(url);
        // Check if domain is allowed
        if (allowedDomains.length > 0) {
            const isAllowed = allowedDomains.some((domain)=>parsed.hostname.includes(domain));
            if (!isAllowed) {
                throw new Error(`URL domain not allowed: ${parsed.hostname}`);
            }
        }
        // Only allow https
        if (parsed.protocol !== 'https:') {
            throw new Error('Only HTTPS URLs are allowed');
        }
        return url;
    } catch (error) {
        throw new Error('Invalid URL: ' + error.message);
    }
}
function sanitizeMakeIframeUrl(url) {
    if (!url) return '';
    // Must be from make.com domain
    return sanitizeUrl(url, [
        'make.com',
        'eu2.make.com',
        'us1.make.com'
    ]);
}
function sanitizeScenarioData(data) {
    return {
        title: sanitizeText(data.title),
        description: sanitizeText(data.description),
        apps: sanitizeText(data.apps),
        makeScenarioUrl: sanitizeUrl(data.makeScenarioUrl, [
            'make.com'
        ]),
        iframeUrl: data.iframeUrl ? sanitizeMakeIframeUrl(data.iframeUrl) : undefined,
        buttonUrl: data.buttonUrl ? sanitizeUrl(data.buttonUrl, [
            'make.com'
        ]) : undefined
    };
}
}),
"[project]/app/api/publish/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/github.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sanitize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/sanitize.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        // Parse request body
        const body = await request.json();
        // Sanitize inputs
        const sanitized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sanitize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeScenarioData"])(body);
        // Use AI-suggested enhancements if provided
        const finalData = {
            makeScenarioUrl: sanitized.makeScenarioUrl,
            title: body.suggestedTitle || sanitized.title,
            description: body.suggestedDescription || sanitized.description,
            apps: sanitized.apps,
            category: body.suggestedCategory || body.category,
            iframeUrl: sanitized.iframeUrl,
            buttonUrl: sanitized.buttonUrl
        };
        // Publish to GitHub
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publishScenario"])(finalData);
        if (!result.success) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to publish scenario'
            }, {
                status: 500
            });
        }
        // Return success
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            scenarioId: result.scenarioId,
            slug: result.slug,
            url: `/${result.slug}`,
            message: 'Scenario published successfully! It will appear on the site within 3 minutes.'
        });
    } catch (error) {
        console.error('Publish error:', error);
        // Handle duplicate scenarios
        if (error.message.includes('already been submitted')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'This scenario has already been submitted'
            }, {
                status: 409
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message || 'Failed to publish scenario. Please try again.'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__af86de88._.js.map