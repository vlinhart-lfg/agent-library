"use client"

import { useState, useMemo, useEffect } from "react"
import { TemplateCard } from "@/components/template-card"
import { AgentTemplate } from "@/lib/types"
import templatesData from "@/data/templates.json"
import { Search, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isScrolled, setIsScrolled] = useState(false)

  const templates = templatesData as AgentTemplate[]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 450)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>()
    templates.forEach((template) => {
      categoryMap.set(template.category, (categoryMap.get(template.category) || 0) + 1)
    })
    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [templates])

  const filteredTemplates = useMemo(() => {
    let filtered = templates

    if (selectedTags.length > 0) {
      filtered = filtered.filter((template) =>
        selectedTags.includes(template.category)
      )
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          template.category.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => a.title.localeCompare(b.title))
  }, [templates, selectedTags, searchQuery])

  const addTag = (category: string) => {
    if (!selectedTags.includes(category)) {
      setSelectedTags([...selectedTags, category])
    }
  }

  const removeTag = (category: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== category))
  }

  const clearAllTags = () => {
    setSelectedTags([])
  }

  const featuredTemplates = filteredTemplates.slice(0, 3)
  const templatesByCategory = useMemo(() => {
    const grouped = new Map<string, AgentTemplate[]>()
    filteredTemplates.forEach((template) => {
      const existing = grouped.get(template.category) || []
      grouped.set(template.category, [...existing, template])
    })
    return Array.from(grouped.entries())
  }, [filteredTemplates])

  return (
    <div className="min-h-screen bg-white my-[-2px]">
      <div className="sticky top-4 z-50 px-6 pt-4">
        <header className={`rounded-xl border shadow-xl transition-all duration-300 ${isScrolled
          ? "bg-gray-100 border-gray-300"
          : "bg-[#23282C] border-gray-700/50"
          }`}>
          <div className="px-6 py-3 shadow-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <Image
                    src="/make-logo.svg"
                    alt="Make.com"
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                  <span className={`font-semibold text-lg transition-colors duration-300 ${isScrolled ? "text-gray-900" : "text-white"
                    }`}>
                    Agent library
                  </span>
                </div>
                {isScrolled && (
                  <div className="relative w-[400px]">
                    <input
                      type="text"
                      placeholder="Search for a template"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-10 py-2 bg-gray-200 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  </div>
                )}
                <nav className="flex items-center gap-6">

                </nav>
              </div>
              <div className="flex items-center gap-6">
                <button className={`text-sm font-medium transition-colors duration-300 ${isScrolled
                  ? "text-gray-900 hover:text-gray-600"
                  : "text-white hover:text-gray-300"
                  }`}>
                  Why submit?
                </button>
                <Link href="/submit">
                  <button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-600/30">
                    Submit
                  </button>
                </Link>
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                  V
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="bg-gradient-to-r from-[#1C0034] via-[#4E0885] to-[#8F35DD] -mt-20">
        <section className="text-white relative overflow-hidden pt-[200px] pb-[180px] mx-0">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
            <Image
              src="/make-symbol.svg"
              alt=""
              width={800}
              height={560}
              className="object-contain"
              style={{ filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.15))' }}
            />
          </div>

          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-6xl font-bold mb-4 text-balance">
              Find. Deploy. Scale.
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Make AI agents, ready to use.
            </p>

            <div className="max-w-4xl mx-auto mb-12">
              <div className="relative bg-[#445B66] border border-gray-600/50 rounded-xl p-3 min-h-[60px]">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => removeTag(tag)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium text-white transition-colors"
                    >
                      {tag}
                      <X className="h-4 w-4" />
                    </button>
                  ))}

                  <input
                    type="text"
                    placeholder={selectedTags.length === 0 ? "Search for a template" : ""}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 min-w-[200px] bg-transparent border-none outline-none text-base text-white placeholder:text-gray-200 px-2"
                  />

                  <div className="flex items-center gap-2 ml-auto">
                    {selectedTags.length > 0 && (
                      <button
                        onClick={clearAllTags}
                        className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5 text-gray-300" />
                      </button>
                    )}
                    <button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 p-2 rounded-lg transition-all shadow-lg shadow-purple-600/30">
                      <Search className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={clearAllTags}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedTags.length === 0
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                  }`}
              >
                All {templates.length}
              </button>
              {categories.map(({ name, count }) => (
                <button
                  key={name}
                  onClick={() => addTag(name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedTags.includes(name)
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                    }`}
                >
                  {name} {count}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="container mx-auto px-6 py-12 bg-white rounded-t-3xl">
        {selectedTags.length === 0 && !searchQuery && featuredTemplates.length > 0 && (
          <section className="mb-16">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Featured</h3>
              <p className="text-muted-foreground">Curated top picks from the community.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </section>
        )}

        {!searchQuery && templatesByCategory.length > 0 ? (
          templatesByCategory.map(([category, categoryTemplates]) => (
            <section key={category} className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{category}</h3>
                  <p className="text-sm text-muted-foreground">
                    {categoryTemplates.length} {categoryTemplates.length === 1 ? "template" : "templates"}
                  </p>
                </div>
                <button
                  onClick={() => addTag(category)}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  View all
                  <span aria-hidden="true">→</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTemplates.slice(0, 3).map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </section>
          ))
        ) : searchQuery && filteredTemplates.length > 0 ? (
          <section>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredTemplates.length} {filteredTemplates.length === 1 ? "result" : "results"} found
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-muted-foreground mb-2">No templates found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
