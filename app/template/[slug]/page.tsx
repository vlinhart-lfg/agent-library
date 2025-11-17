import { notFound } from 'next/navigation'
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Target, Zap } from 'lucide-react'
import { AgentTemplate } from "@/lib/types"
import templatesData from "@/data/templates.json"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyLinkButton } from "@/components/copy-link-button"
import { RelatedTemplates } from "@/components/related-templates"

interface TemplatePageProps {
  params: Promise<{ slug: string }>
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { slug } = await params
  const templates = templatesData as AgentTemplate[]
  const template = templates.find((t) => t.slug === slug)

  if (!template) {
    notFound()
  }

  // Get related templates
  const relatedTemplates = templates.filter((t) =>
    template.relatedTemplates.includes(t.id)
  )

  const templateUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/template/${template.slug}`

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header Section */}
        <div className="space-y-6 mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {template.category}
                </Badge>
                <Badge variant="secondary">{template.complexity}</Badge>
              </div>
              <h1 className="text-4xl font-bold text-balance">{template.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {template.description}
              </p>
            </div>
            <CopyLinkButton url={templateUrl} />
          </div>

          {/* Preview Image */}
          <div className="aspect-video relative overflow-hidden rounded-lg border bg-muted">
            <Image
              src={template.previewImage || "/placeholder.svg"}
              alt={template.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-5 w-5 text-purple-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Use Case</p>
                    <p className="text-sm leading-relaxed">{template.useCase}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Complexity</p>
                    <p className="text-sm leading-relaxed">{template.complexity} Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                    <p className="text-sm leading-relaxed">
                      {new Date(template.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Description */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">{template.fullDescription}</p>
        </section>

        {/* Tags */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </section>

        {/* Setup Instructions */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {template.setupInstructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* Configuration Options */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Options</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {template.configOptions.map((option, index) => (
                  <li key={index} className="flex gap-2 text-sm leading-relaxed">
                    <span className="text-purple-700 font-bold">•</span>
                    <span>{option}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Related Templates */}
        <RelatedTemplates templates={relatedTemplates} />

        {/* Bottom CTA */}
        <div className="mt-12 pt-8 border-t flex items-center justify-center">
          <Button asChild size="lg" className="bg-purple-700 hover:bg-purple-800">
            <Link href="/">Browse More Templates</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
