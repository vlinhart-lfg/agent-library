'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default function PreviewPage() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const storedData = localStorage.getItem('submissionPreview');
        if (!storedData) {
            router.push('/submit');
            return;
        }
        setData(JSON.parse(storedData));
    }, [router]);

    const onPublish = async () => {
        setIsPublishing(true);
        setError(null);

        try {
            const publishResponse = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    makeScenarioUrl: data.buttonUrl,
                    title: data.title,
                    description: data.description,
                    instructions: data.instructions,
                    apps: data.apps,
                    iframeUrl: data.iframeUrl,
                    suggestedTitle: data.title,
                    suggestedDescription: data.description,
                    suggestedCategory: 'Productivity',
                    useCase: data.useCase,
                    complexity: data.complexity,
                    tags: data.tags,
                    createdDate: data.createdDate,
                }),
            });

            if (!publishResponse.ok) {
                const errorData = await publishResponse.json();
                throw new Error(errorData.error || 'Failed to publish');
            }

            setSuccess(true);
            localStorage.removeItem('submissionPreview');

            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to publish scenario');
            setIsPublishing(false);
        }
    };

    if (!data) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

    if (success) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <Card className="p-12 text-center max-w-lg shadow-xl border-0">
                    <div className="text-6xl mb-6">✅</div>
                    <h1 className="text-3xl font-bold mb-4 text-gray-900">Published!</h1>
                    <p className="text-gray-600 mb-6">
                        Your scenario is now live in the library.
                    </p>
                    <p className="text-sm text-gray-400">Redirecting home...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <SiteHeader variant="solid" showSearch={false} />

            <div className="container mx-auto px-6 py-12 max-w-[1200px]">
                <Breadcrumbs items={[
                    { label: 'Submit', href: '/submit' },
                    { label: 'Preview', href: '/submit/preview' }
                ]} />

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-12">
                    {/* Left Column: Info */}
                    <div className="space-y-8">
                        {/* App Icons */}
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                {data.appIcons && data.appIcons.length > 0 ? (
                                    <>
                                        {data.appIcons.slice(0, 4).map((icon: any, i: number) => {
                                            // Format package name for tooltip (e.g., "google-email" -> "Google Email")
                                            const formatPackageName = (name: string) => {
                                                return name
                                                    .split('-')
                                                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ');
                                            };

                                            const packageName = typeof icon === 'string' ? 'App' : icon.name;
                                            const tooltip = formatPackageName(packageName);

                                            return (
                                                <Tooltip key={i}>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            className="w-12 h-12 rounded-full shadow-sm border border-white/20 flex items-center justify-center overflow-hidden p-2 transition-transform hover:scale-110"
                                                            style={{ backgroundColor: icon.color || icon }}
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
                                            );
                                        })}
                                        {data.appIcons.length > 4 && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="w-12 h-12 rounded-full shadow-sm border border-white/20 flex items-center justify-center bg-[#2D8CFF] text-white font-bold text-lg transition-transform hover:scale-110 cursor-default">
                                                        +{data.appIcons.length - 4}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        {data.appIcons.slice(4).map((icon: any) =>
                                                            icon.name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                                                        ).join(', ')}
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
                            <h1
                                className="text-4xl font-bold mb-6 text-gray-900 leading-tight outline-none focus:ring-2 focus:ring-purple-600 rounded"
                                contentEditable
                                suppressContentEditableWarning
                                dangerouslySetInnerHTML={{ __html: data.title }}
                                onBlur={(e) => setData({ ...data, title: e.currentTarget.innerText })}
                            />
                            <div
                                className="text-lg text-gray-600 leading-relaxed outline-none focus:ring-2 focus:ring-purple-600 rounded"
                                contentEditable
                                suppressContentEditableWarning
                                dangerouslySetInnerHTML={{ __html: data.description }}
                                onBlur={(e) => setData({ ...data, description: e.currentTarget.innerText })}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex gap-4">
                            <Button
                                onClick={onPublish}
                                disabled={isPublishing}
                                className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-xl px-8 py-6 text-lg font-semibold shadow-lg shadow-purple-600/30 transition-all"
                            >
                                {isPublishing ? 'Publishing...' : 'Publish to Library'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/submit')}
                                className="rounded-xl px-8 py-6 text-lg"
                            >
                                Back
                            </Button>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Preview */}
                    <div className="relative">
                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden aspect-[4/3] relative group">
                            {data.iframeUrl ? (
                                <iframe
                                    src={data.iframeUrl}
                                    className="w-full h-full border-0"
                                    title="Scenario Diagram"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-8 text-center">
                                    <div className="text-4xl mb-4">🖼️</div>
                                    <p>Interactive preview not available on localhost.</p>
                                    <Button variant="link" className="mt-2 text-purple-600" onClick={() => window.open(data.buttonUrl, '_blank')}>
                                        Open in Make.com ↗
                                    </Button>
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
                                {data.useCase ? (
                                    <p
                                        className="text-base text-gray-900 outline-none focus:ring-2 focus:ring-purple-600 rounded"
                                        contentEditable
                                        suppressContentEditableWarning
                                        dangerouslySetInnerHTML={{ __html: data.useCase }}
                                        onBlur={(e) => setData({ ...data, useCase: e.currentTarget.innerText })}
                                    />
                                ) : (
                                    <p className="text-base text-gray-400 italic">Click to add use case</p>
                                )}
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
                                <select
                                    value={data.complexity || 'Intermediate'}
                                    onChange={(e) => setData({ ...data, complexity: e.target.value as any })}
                                    className="text-base font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border-0 outline-none focus:ring-2 focus:ring-purple-600"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
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
                                <p className="text-base text-gray-900">{data.createdDate || 'Today'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Information Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Setup Instructions</h2>
                    {data.instructions && data.instructions.trim().length > 0 ? (
                        <div
                            className="text-base text-gray-600 leading-relaxed outline-none focus:ring-2 focus:ring-purple-600 rounded whitespace-pre-wrap prose prose-purple max-w-none"
                            contentEditable
                            suppressContentEditableWarning
                            dangerouslySetInnerHTML={{ __html: data.instructions }}
                            onBlur={(e) => setData({ ...data, instructions: e.currentTarget.innerText })}
                        />
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                            <div className="text-3xl mb-2">💡</div>
                            <p className="text-amber-800 font-medium mb-1">No setup instructions provided</p>
                            <p className="text-amber-600 text-sm mb-3">
                                Click below to add step-by-step instructions for using this scenario
                            </p>
                            <div
                                className="mt-3 text-gray-600 text-sm outline-none focus:ring-2 focus:ring-purple-600 rounded min-h-[100px] p-3 bg-white border border-amber-200"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                    const text = e.currentTarget.innerText.trim();
                                    if (text) {
                                        setData({ ...data, instructions: text });
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Tags Section */}
                {data.tags && data.tags.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {data.tags.map((tag: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Templates Placeholder */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                    <h2 className="text-2xl font-bold mb-3 text-gray-900">Related Templates</h2>
                    <p className="text-gray-500 mb-4">Discover similar automation scenarios</p>
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="text-sm text-gray-400">Related templates will appear here once published</p>
                </div>
            </div>
        </div>
    );
}
