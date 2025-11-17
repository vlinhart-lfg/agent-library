import Link from "next/link"
import { AgentTemplate } from "@/lib/types"
import Image from "next/image"

interface TemplateCardProps {
  template: AgentTemplate
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Link
      href={`/template/${template.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
    >
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        <Image
          src={template.previewImage || "/placeholder.svg"}
          alt={template.title}
          width={400}
          height={300}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors text-balance">
          {template.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {template.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{template.category}</span>
          <span className={`px-2 py-1 rounded-md font-medium ${
            template.complexity === "Beginner"
              ? "bg-green-100 text-green-700"
              : template.complexity === "Intermediate"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}>
            {template.complexity}
          </span>
        </div>
      </div>
    </Link>
  )
}
