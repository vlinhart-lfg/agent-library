import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { ProfileHeader } from '@/components/profile-header'
import { getUserTemplates } from '@/lib/supabase/queries'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, Clock, Sparkles } from 'lucide-react'

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const templates = await getUserTemplates(supabase, user.id)

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <SiteHeader variant="solid" />

            <main className="container mx-auto px-6 py-12 space-y-12">
                <ProfileHeader user={user} submissionCount={templates.length} />

                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">My Templates</h2>
                        <Link href="/submit">
                            <button className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
                                Submit New <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>

                    {templates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map((template: any) => (
                                <Link key={template.id} href={`/${template.slug}`} className="group block h-full">
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-purple-200 h-full flex flex-col">
                                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                                            {template.preview_image ? (
                                                <Image
                                                    src={template.preview_image}
                                                    alt={template.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    No Preview
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 shadow-sm">
                                                {template.category || 'Uncategorized'}
                                            </div>
                                        </div>

                                        <div className="p-5 flex flex-col flex-1">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                                    {template.title}
                                                </h3>
                                            </div>

                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                                                {template.description}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-gray-400 pt-4 border-t border-gray-100 mt-auto">
                                                {template.complexity && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        <span>{template.complexity}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 ml-auto">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{new Date(template.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">
                                You haven't submitted any templates yet. Share your first automation scenario with the community!
                            </p>
                            <Link href="/submit">
                                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-600/30">
                                    Submit Template
                                </button>
                            </Link>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
