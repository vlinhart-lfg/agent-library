'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

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
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makeScenarioUrl: data.makeScenarioUrl,
          enhance: true // Request AI enhancement immediately
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract data');
      }

      const result = await response.json();

      // Store data in localStorage to pass to preview page (avoiding huge URL params)
      localStorage.setItem('submissionPreview', JSON.stringify(result.data));

      // Redirect to preview
      router.push('/submit/preview');
    } catch (err: any) {
      setError(err.message || 'Failed to extract scenario data. Please check the URL and try again.');
      setIsScraping(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-32 max-w-xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Submit a Scenario</h1>
        <p className="text-muted-foreground text-lg">
          Paste a Make.com shared scenario URL to add it to the library.
        </p>
      </div>

      <Card className="p-8 shadow-lg border-0 ring-1 ring-gray-200 dark:ring-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 sr-only">
              Make.com Scenario URL
            </label>
            <input
              {...register('makeScenarioUrl')}
              type="url"
              placeholder="https://eu2.make.com/public/shared-scenario/..."
              className="w-full px-4 py-3 text-lg border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              autoFocus
            />
            {errors.makeScenarioUrl && (
              <p className="text-red-500 text-sm mt-2 ml-1">{errors.makeScenarioUrl.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isScraping}
            className="w-full py-6 text-lg rounded-xl"
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

      <p className="text-center text-sm text-muted-foreground mt-8">
        We'll automatically extract details and generate an AI-enhanced description for you.
      </p>
    </div>
  );
}
