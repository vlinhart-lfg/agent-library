'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
                    <h1 className="text-3xl font-bold mb-4 text-[#1d1d1f]">Published!</h1>
                    <p className="text-gray-600 mb-6">
                        Your scenario is now live in the library.
                    </p>
                    <p className="text-sm text-gray-400">Redirecting home...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-[#1d1d1f] font-sans">
            {/* Header */}
            <div className="max-w-[1200px] mx-auto py-8 px-6">
                <div className="flex items-center gap-2 mb-12">
                    <svg width="105" height="24" viewBox="0 0 105 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.92 0L6.46 10.8L0 0H-4.4V24H0V9.6L6.46 20.4L12.92 9.6V24H17.32V0H12.92Z" fill="#1D1D1F" />
                        <path d="M32.68 24V16.4H28.28V19.6C28.28 20.92 27.2 22 25.88 22C24.56 22 23.48 20.92 23.48 19.6C23.48 18.28 24.56 17.2 25.88 17.2H32.68V13.2H25.88C22.36 13.2 19.48 16.08 19.48 19.6C19.48 23.12 22.36 26 25.88 26C28.28 26 30.4 24.8 31.6 23L32.68 24Z" transform="translate(0 -2)" fill="#1D1D1F" />
                        <path d="M48.2 0V16H43.8V0H39.4V24H43.8V20H48.2L52.2 24H57.4L51.8 18.4C54.2 17.2 55.8 14.8 55.8 12C55.8 10.4 55.2 8.8 54 7.6C52.8 6.4 51.2 5.8 49.6 5.8H48.2V0ZM48.2 9.8H49.6C50.2 9.8 50.8 10 51.2 10.4C51.6 10.8 51.8 11.4 51.8 12C51.8 12.6 51.6 13.2 51.2 13.6C50.8 14 50.2 14.2 49.6 14.2H48.2V9.8Z" fill="#1D1D1F" />
                        <path d="M72.6 17.2C73.92 17.2 75 18.28 75 19.6C75 20.92 73.92 22 72.6 22H66.2V17.2H72.6ZM72.6 13.2H66.2C62.68 13.2 59.8 16.08 59.8 19.6C59.8 23.12 62.68 26 66.2 26H79V22L77.8 23.2C76.6 24.96 74.6 26 72.6 26C69.08 26 66.2 23.12 66.2 19.6H79V18.4C79 15.52 76.68 13.2 73.8 13.2H72.6Z" transform="translate(0 -2)" fill="#1D1D1F" />
                    </svg>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left Column: Info */}
                    <div className="space-y-8">
                        {/* App Icons */}
                        <div className="flex items-center gap-2">
                            {data.appIcons && data.appIcons.length > 0 ? (
                                data.appIcons.map((icon: string, i: number) => (
                                    <div key={i} className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden p-1">
                                        <img src={icon} alt="App Icon" className="w-full h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                                    </div>
                                ))
                            ) : (
                                <div className="h-12"></div>
                            )}
                        </div>

                        {/* Title & Description */}
                        <div>
                            <h1
                                className="text-4xl font-bold mb-6 text-[#1d1d1f] leading-tight outline-none focus:ring-2 focus:ring-[#6e3aff] rounded"
                                contentEditable
                                suppressContentEditableWarning
                                dangerouslySetInnerHTML={{ __html: data.title }}
                                onBlur={(e) => setData({ ...data, title: e.currentTarget.innerText })}
                            />
                            <div
                                className="text-lg text-gray-600 leading-relaxed outline-none focus:ring-2 focus:ring-[#6e3aff] rounded"
                                contentEditable
                                suppressContentEditableWarning
                                dangerouslySetInnerHTML={{ __html: data.description }}
                                onBlur={(e) => setData({ ...data, description: e.currentTarget.innerText })}
                            />
                        </div>

                        {/* Action Button */}
                        <div className="pt-4">
                            <Button
                                onClick={onPublish}
                                disabled={isPublishing}
                                className="bg-[#6e3aff] hover:bg-[#5a2ee0] text-white rounded-md px-8 py-6 text-lg font-semibold shadow-lg shadow-[#6e3aff]/20 transition-all"
                            >
                                <span className="mr-2 text-xl">+</span>
                                {isPublishing ? 'Publishing...' : 'Use this scenario'}
                            </Button>
                        </div>
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
                                    <Button variant="link" className="mt-2 text-[#6e3aff]" onClick={() => window.open(data.buttonUrl, '_blank')}>
                                        Open in Make.com ↗
                                    </Button>
                                </div>
                            )}

                            {/* Zoom Controls Mockup */}
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                <div className="w-8 h-8 bg-white rounded border border-gray-300 flex items-center justify-center text-gray-500 shadow-sm cursor-default">-</div>
                                <div className="w-8 h-8 bg-white rounded border border-gray-300 flex items-center justify-center text-gray-500 shadow-sm cursor-default">+</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
