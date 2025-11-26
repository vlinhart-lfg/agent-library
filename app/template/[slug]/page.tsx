import { notFound } from 'next/navigation'
import Link from "next/link"
import { AgentTemplate } from "@/lib/types"
import templatesData from "@/data/templates.json"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { RelatedTemplates } from "@/components/related-templates"
import { createClient } from '@/lib/supabase/server'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TemplatePageProps {
  params: Promise<{ slug: string }>
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { slug } = await params
  const templates = templatesData as AgentTemplate[]
  let template = templates.find((t) => t.slug === slug)

  // Helper to normalize template data and prevent runtime errors
  const normalizeTemplate = (t: AgentTemplate): AgentTemplate => ({
    ...t,
    tags: Array.from(new Set(t.tags || [])), // Deduplicate tags
    setupInstructions: t.setupInstructions || [],
    configOptions: t.configOptions || [],
    relatedTemplates: t.relatedTemplates || [],
    makeApps: t.makeApps || [],
    appIcons: t.appIcons || [],
  })

  // Always check Supabase for fresh data (like appIcons)
  const supabase = await createClient()
  const { data } = await supabase
    .from('templates')
    .select('*')
    .eq('slug', slug)
    .single()

  if (data) {
    if (template) {
      // Merge Supabase data into existing JSON template
      // We prioritize Supabase for dynamic fields like appIcons
      template = {
        ...template,
        appIcons: data.app_icons || template.appIcons,
        // We could merge other fields here if needed, e.g. updated description
      }
    } else {
      // Not in JSON, use Supabase data entirely
      template = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        fullDescription: data.full_description || data.description,
        category: data.category,
        tags: data.tags || [],
        complexity: data.complexity,
        useCase: data.use_case || '',
        previewImage: data.preview_image,
        setupInstructions: data.instructions ? [data.instructions] : [],
        configOptions: [],
        relatedTemplates: [],
        createdAt: data.created_at,
        makeApps: data.make_apps || [],
        makeScenarioUrl: data.make_scenario_url,
        makeIframeUrl: data.make_iframe_url,
        appIcons: data.app_icons || [],
      } as AgentTemplate
    }
  }

  if (!template) {
    notFound()
  }

  // Normalize the template data
  template = normalizeTemplate(template)

  // Get related templates
  const relatedTemplates = templates.filter((t) =>
    (template?.relatedTemplates || []).includes(t.id)
  )

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader variant="solid" showSearch={false} />

      <div className="container mx-auto px-6 py-12 max-w-[1200px]">
        <Breadcrumbs items={[
          { label: 'Library', href: '/' },
          { label: template.title, href: `/template/${template.slug}` }
        ]} />

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-12">
          {/* Left Column: Info */}
          <div className="space-y-8">
            {/* App Icons */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                {template.appIcons && template.appIcons.length > 0 ? (
                  <>
                    {template.appIcons.slice(0, 4).map((icon: any, i: number) => {
                      const packageName = typeof icon === 'string' ? 'App' : icon.name;
                      const tooltip = packageName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                      return (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <div
                              className="w-12 h-12 rounded-full shadow-sm border border-white/20 flex items-center justify-center overflow-hidden p-2 transition-transform hover:scale-110"
                              style={{ backgroundColor: icon.color || '#fff' }}
                            >
                              <img
                                src={typeof icon === 'string' ? icon : icon.url}
                                alt={tooltip}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                    {template.appIcons.length > 4 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-12 h-12 rounded-full shadow-sm border border-white/20 flex items-center justify-center bg-[#2D8CFF] text-white font-bold text-lg transition-transform hover:scale-110 cursor-default">
                            +{template.appIcons.length - 4}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {template.appIcons.slice(4).map((icon: any) =>
                              (typeof icon === 'string' ? 'App' : icon.name).split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                            ).join(', ')}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </>
                ) : template.makeApps && template.makeApps.length > 0 ? (
                  <>
                    {template.makeApps.slice(0, 4).map((app, i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <div
                            className="w-12 h-12 rounded-full shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden p-2 transition-transform hover:scale-110 bg-white"
                          >
                            <span className="text-xs font-bold text-gray-500">
                              {app.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{app}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {template.makeApps.length > 4 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-12 h-12 rounded-full shadow-sm border border-white/20 flex items-center justify-center bg-[#2D8CFF] text-white font-bold text-lg transition-transform hover:scale-110 cursor-default">
                            +{template.makeApps.length - 4}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {template.makeApps.slice(4).join(', ')}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </>
                ) : (
                  <div className="h-12"></div>
                )}
              </TooltipProvider>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-4xl font-bold mb-6 text-gray-900 leading-tight">
                {template.title}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {template.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex gap-4">
              {template.makeScenarioUrl && (
                <Button
                  asChild
                  className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-xl px-8 py-6 text-lg font-semibold shadow-lg shadow-purple-600/30 transition-all"
                >
                  <a href={template.makeScenarioUrl} target="_blank" rel="noopener noreferrer">
                    Open in Make.com
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                asChild
                className="rounded-xl px-8 py-6 text-lg"
              >
                <Link href="/">
                  Back to Library
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="relative">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden aspect-[4/3] relative group">
              {template.makeIframeUrl ? (
                <iframe
                  src={template.makeIframeUrl}
                  className="w-full h-full border-0"
                  title="Scenario Diagram"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-8 text-center">
                  <div className="text-4xl mb-4">🖼️</div>
                  <p>Interactive preview not available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Use Case Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Use Case</h3>
                <p className="text-base text-gray-900">{template.useCase}</p>
              </div>
            </div>
          </div>

          {/* Complexity Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Complexity</h3>
                <span className={`text-base font-medium px-3 py-1 rounded-full ${template.complexity === "Beginner"
                  ? "bg-green-100 text-green-800"
                  : template.complexity === "Intermediate"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                  }`}>
                  {template.complexity}
                </span>
              </div>
            </div>
          </div>

          {/* Created Date Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                <p className="text-base text-gray-900">
                  {new Date(template.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Setup Instructions</h2>
          {template.setupInstructions && template.setupInstructions.length > 0 ? (
            <div className="space-y-4">
              {template.setupInstructions.map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-base text-gray-600 leading-relaxed">{instruction}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
              <div className="text-3xl mb-2">💡</div>
              <p className="text-amber-800 font-medium mb-1">No setup instructions provided</p>
            </div>
          )}
        </div>

        {/* Tags Section */}
        {template.tags && template.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Templates */}
        <RelatedTemplates templates={relatedTemplates} />
      </div>
    </div>
  )
}
