import { Octokit } from '@octokit/rest';

// Initialize GitHub client
const octokit = new Octokit({
  auth: process.env.GITHUB_PAT,
});

const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'vlinhart-lfg';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'agent-library';
const REPO_BRANCH = process.env.GITHUB_REPO_BRANCH || 'main';

export interface ScenarioData {
  id: string;
  slug: string;
  title: string;
  description: string;
  fullDescription: string;
  previewImage: string;
  category: string;
  tags: string[];
  complexity: string;
  useCase: string;
  createdAt: string;
  makeScenarioUrl: string;
  makeScenarioId: string;
  makeIframeUrl?: string;
  makeApps: string[];
  submittedBy: string;
  submittedAt: string;
  status: string;
  aiEnhanced: boolean;
}

/**
 * Read current templates.json from GitHub
 */
async function readTemplatesJson(): Promise<ScenarioData[]> {
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: 'data/templates.json',
      ref: REPO_BRANCH,
    });

    if ('content' in data) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return JSON.parse(content);
    }

    throw new Error('Unable to read templates.json');
  } catch (error: any) {
    console.error('Error reading templates.json:', error);
    throw new Error('Failed to read existing scenarios');
  }
}

/**
 * Generate unique slug from title
 */
function generateSlug(title: string, existingSlugs: string[]): string {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Handle collisions
  let finalSlug = slug;
  let counter = 1;
  while (existingSlugs.includes(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  return finalSlug;
}

/**
 * Extract scenario ID from Make.com URL
 */
function extractScenarioId(url: string): string {
  const match = url.match(/shared-scenario\/([^\/]+)/);
  return match ? match[1] : '';
}

/**
 * Check if scenario ID already exists
 */
export async function checkDuplicateScenario(makeScenarioUrl: string): Promise<boolean> {
  try {
    const templates = await readTemplatesJson();
    const scenarioId = extractScenarioId(makeScenarioUrl);

    return templates.some(
      (t) => t.makeScenarioId === scenarioId || t.makeScenarioUrl === makeScenarioUrl
    );
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return false;
  }
}

/**
 * Publish new scenario to GitHub
 */
export async function publishScenario(data: {
  makeScenarioUrl: string;
  title: string;
  description: string;
  apps: string;
  category: string;
  iframeUrl?: string;
  buttonUrl?: string;
}): Promise<{ success: boolean; scenarioId: string; slug: string }> {
  try {
    // Check for duplicates
    const isDuplicate = await checkDuplicateScenario(data.makeScenarioUrl);
    if (isDuplicate) {
      throw new Error('This scenario has already been submitted');
    }

    // Read current templates
    const templates = await readTemplatesJson();

    // Generate new ID (increment from max)
    const maxId = templates.length > 0
      ? Math.max(...templates.map((t) => parseInt(t.id)))
      : 0;
    const newId = (maxId + 1).toString();

    // Generate unique slug
    const existingSlugs = templates.map((t) => t.slug);
    const slug = generateSlug(data.title, existingSlugs);

    // Extract scenario ID
    const makeScenarioId = extractScenarioId(data.makeScenarioUrl);

    // Parse apps
    const appsArray = data.apps.split(',').map((app) => app.trim());

    // Build new scenario entry
    const newScenario: ScenarioData = {
      id: newId,
      slug,
      title: data.title,
      description: data.description,
      fullDescription: data.description,
      previewImage: '/placeholder.svg?height=400&width=600',
      category: data.category,
      tags: appsArray.map((app) => app.toLowerCase()),
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
      aiEnhanced: true,
    };

    // Add to templates array
    const updatedTemplates = [...templates, newScenario];

    // Get current file SHA
    const { data: fileData } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: 'data/templates.json',
      ref: REPO_BRANCH,
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
      branch: REPO_BRANCH,
    });

    return {
      success: true,
      scenarioId: newId,
      slug,
    };
  } catch (error: any) {
    console.error('Error publishing scenario:', error);
    throw new Error(error.message || 'Failed to publish scenario to GitHub');
  }
}
