import { AgentTemplate } from "@/lib/types"
import { TemplateCard } from "./template-card"

interface RelatedTemplatesProps {
  templates: AgentTemplate[]
}

export function RelatedTemplates({ templates }: RelatedTemplatesProps) {
  if (templates.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">Related Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </section>
  )
}
