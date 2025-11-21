'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { Breadcrumbs } from '@/components/breadcrumbs';

const submitFormSchema = z.object({
  makeScenarioUrl: z.string().url('Please enter a valid URL').refine(
    (url) => url.includes('make.com/public/shared-scenario'),
    'Must be a Make.com shared scenario URL'
  ),
});

type SubmitFormData = z.infer<typeof submitFormSchema>;

export default function SubmitPage() {
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubmitFormData>({
    resolver: zodResolver(submitFormSchema),
  });

  const onSubmit = async (data: SubmitFormData) => {
    setIsScraping(true);
    setError(null);

    try {
      // Step 1: Scrape scenario data from Make.com
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makeScenarioUrl: data.makeScenarioUrl,
          enhance: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract data');
      }

      const result = await response.json();
      const scrapedData = result.data;

      // Step 2: Enhance metadata with AI
      const enhanceResponse = await fetch('/api/enhance-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scrapedData.title,
          description: scrapedData.description,
          instructions: scrapedData.instructions,
          apps: scrapedData.apps
        }),
      });

      if (enhanceResponse.ok) {
        const enhancedMetadata = await enhanceResponse.json();
        scrapedData.useCase = enhancedMetadata.useCase;
        scrapedData.complexity = enhancedMetadata.complexity;
        scrapedData.tags = enhancedMetadata.tags;
      }

      // Add created date
      scrapedData.createdDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      localStorage.setItem('submissionPreview', JSON.stringify(scrapedData));
      router.push('/submit/preview');
    } catch (err: any) {
      setError(err.message || 'Failed to extract scenario data. Please check the URL and try again.');
      setIsScraping(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader variant="solid" showSearch={false} />

      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Breadcrumbs items={[{ label: 'Submit', href: '/submit' }]} />

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Submit a Scenario
          </h1>
          <p className="text-gray-600 text-lg">
            Paste a Make.com shared scenario URL to add it to the library.
          </p>
        </div>

        <Card className="p-8 shadow-xl border-0 ring-1 ring-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 sr-only">
                Make.com Scenario URL
              </label>
              <input
                {...register('makeScenarioUrl')}
                type="url"
                placeholder="https://eu2.make.com/public/shared-scenario/..."
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                autoFocus
              />
              {errors.makeScenarioUrl && (
                <p className="text-red-500 text-sm mt-2 ml-1">{errors.makeScenarioUrl.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isScraping}
              className="w-full py-6 text-lg rounded-xl bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-lg shadow-purple-600/30"
              size="lg"
            >
              {isScraping ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Extracting & Enhancing...
                </span>
              ) : (
                'Continue to Preview →'
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-8">
          We'll automatically extract details and generate an AI-enhanced description for you.
        </p>
      </div>
    </div>
  );
}
