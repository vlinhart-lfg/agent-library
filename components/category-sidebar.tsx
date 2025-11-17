"use client"

import { TemplateCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategorySidebarProps {
  categories: TemplateCategory[]
  selectedCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategorySidebarProps) {
  return (
    <aside className="w-64 shrink-0 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-3">Categories</h2>
        <div className="space-y-1">
          <Button
            variant={selectedCategory === null ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              selectedCategory === null && "bg-purple-100 text-purple-900 hover:bg-purple-100"
            )}
            onClick={() => onCategoryChange(null)}
          >
            All Templates
            <span className="ml-auto text-xs text-muted-foreground">
              {categories.reduce((sum, cat) => sum + cat.count, 0)}
            </span>
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                selectedCategory === category.name &&
                  "bg-purple-100 text-purple-900 hover:bg-purple-100"
              )}
              onClick={() => onCategoryChange(category.name)}
            >
              {category.name}
              <span className="ml-auto text-xs text-muted-foreground">{category.count}</span>
            </Button>
          ))}
        </div>
      </div>
    </aside>
  )
}
