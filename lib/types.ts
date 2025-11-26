export type TemplateComplexity = "Beginner" | "Intermediate" | "Advanced"

export interface AgentTemplate {
  id: string
  slug: string
  title: string
  description: string
  fullDescription: string
  previewImage: string
  category: string
  tags: string[]
  complexity: TemplateComplexity
  useCase: string
  createdAt: string
  setupInstructions?: string[]
  configOptions?: string[]
  relatedTemplates?: string[]
  makeApps?: string[]
  makeScenarioUrl?: string
  makeIframeUrl?: string
  appIcons?: any[]
}

export interface TemplateCategory {
  id: string
  name: string
  count: number
}
