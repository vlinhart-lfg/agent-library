'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Form validation schema
const submitFormSchema = z.object({
  makeScenarioUrl: z.string().url('Please enter a valid URL').refine(
    (url) => url.includes('make.com/public/shared-scenario'),
    'Must be a Make.com shared scenario URL'
  ),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(1000, 'Description must be less than 1000 characters'),
  apps: z.string().min(1, 'Please list at least one app'),
  category: z.enum([
    'Marketing',
    'Customer Service',
    'Data Analysis',
    'Content Management',
    'Productivity',
    'E-commerce',
    'Development',
    'Other'
  ]),
  iframeUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  buttonUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type SubmitFormData = z.infer<typeof submitFormSchema>;

export default function SubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<SubmitFormData>({
    resolver: zodResolver(submitFormSchema),
  });

  const onValidate = async (data: SubmitFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Validate with AI
      const validateResponse = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!validateResponse.ok) {
        const errorData = await validateResponse.json();
        throw new Error(errorData.error || 'Validation failed');
      }

      const validation = await validateResponse.json();

      if (!validation.isValid) {
        setError(`Validation failed: ${validation.issues.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Show preview with AI-enhanced content
      setValidationResult(validation);
      setShowPreview(true);
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'Failed to validate submission');
      setIsSubmitting(false);
    }
  };

  const onPublish = async () => {
    if (!validationResult) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 2: Publish to GitHub
      const formData = watch();
      const publishResponse = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          suggestedTitle: validationResult.suggestedTitle,
          suggestedDescription: validationResult.suggestedDescription,
          suggestedCategory: validationResult.suggestedCategory,
        }),
      });

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(errorData.error || 'Failed to publish');
      }

      const result = await publishResponse.json();
      setSuccess(true);
      setIsSubmitting(false);

      // Redirect to home after 3 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to publish scenario');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4">Scenario Published!</h1>
          <p className="text-muted-foreground mb-4">
            Your Make.com scenario has been successfully added to the library.
            It will appear on the site within 3 minutes.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to home...</p>
        </Card>
      </div>
    );
  }

  if (showPreview && validationResult) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Preview Your Submission</h1>

        <Card className="p-8 mb-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Original Title</h3>
              <p className="text-lg">{watch('title')}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-green-600 mb-2">✨ AI-Enhanced Title</h3>
              <p className="text-lg font-semibold">{validationResult.suggestedTitle}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Original Description</h3>
              <p>{watch('description')}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-green-600 mb-2">✨ AI-Enhanced Description</h3>
              <p className="font-medium">{validationResult.suggestedDescription}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Category</h3>
              <p><span className="bg-primary/10 px-3 py-1 rounded-full text-sm">{validationResult.suggestedCategory}</span></p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Apps Used</h3>
              <p>{watch('apps')}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Quality Score</h3>
              <p className="text-2xl font-bold">{validationResult.quality === 'high' ? '🟢 High' : validationResult.quality === 'medium' ? '🟡 Medium' : '🔴 Low'}</p>
            </div>

            {validationResult.confidence && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">AI Confidence</h3>
                <p>{Math.round(validationResult.confidence * 100)}%</p>
              </div>
            )}
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowPreview(false);
              setValidationResult(null);
            }}
            disabled={isSubmitting}
          >
            ← Back to Edit
          </Button>
          <Button
            onClick={onPublish}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Publishing...' : 'Publish to Library'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Submit Your Make.com Scenario</h1>
        <p className="text-muted-foreground">
          Share your Make.com automation with the community. Our AI will enhance your submission for better discoverability.
        </p>
      </div>

      <form onSubmit={handleSubmit(onValidate)} className="space-y-6">
        <Card className="p-6 space-y-6">
          {/* Make.com Scenario URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Make.com Scenario URL <span className="text-red-500">*</span>
            </label>
            <input
              {...register('makeScenarioUrl')}
              type="url"
              placeholder="https://eu2.make.com/public/shared-scenario/..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.makeScenarioUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.makeScenarioUrl.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="LinkedIn Content Creator from Articles"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">5-100 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe what your automation does, which problems it solves, and how it helps users..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">At least 50 characters. Our AI will enhance this for better clarity.</p>
          </div>

          {/* Apps Used */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Apps Used <span className="text-red-500">*</span>
            </label>
            <input
              {...register('apps')}
              type="text"
              placeholder="LinkedIn, RSS, OpenAI GPT-4, Notion"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.apps && (
              <p className="text-red-500 text-sm mt-1">{errors.apps.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Comma-separated list of tools/apps</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a category...</option>
              <option value="Marketing">Marketing</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Data Analysis">Data Analysis</option>
              <option value="Content Management">Content Management</option>
              <option value="Productivity">Productivity</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Development">Development</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Our AI may suggest a better category</p>
          </div>

          {/* Optional: Iframe URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Iframe Embed URL (Optional)
            </label>
            <input
              {...register('iframeUrl')}
              type="url"
              placeholder="https://eu2.make.com/embed/..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.iframeUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.iframeUrl.message}</p>
            )}
          </div>

          {/* Optional: Button URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              "Use Scenario" Button URL (Optional)
            </label>
            <input
              {...register('buttonUrl')}
              type="url"
              placeholder="https://eu2.make.com/..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.buttonUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.buttonUrl.message}</p>
            )}
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Validating with AI...' : 'Continue to Preview'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By submitting, you agree that your scenario will be published under the community library license
        </p>
      </form>
    </div>
  );
}
