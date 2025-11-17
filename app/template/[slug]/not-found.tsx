import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 px-6">
        <h1 className="text-4xl font-bold">Template Not Found</h1>
        <p className="text-muted-foreground">
          The template you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild className="bg-purple-700 hover:bg-purple-800">
          <Link href="/">Return to Library</Link>
        </Button>
      </div>
    </div>
  )
}
