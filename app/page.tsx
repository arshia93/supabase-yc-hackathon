'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SetupPage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    // Simulate setup process
    await new Promise(resolve => setTimeout(resolve, 2000))

    setResult('Website registered successfully!')
    setIsLoading(false)
  }

  const trackingScript = `<script src="https://cdn.supatrack.com/track.js"></script>
<script>
  window.SupaTrack.init({
    websiteId: "YOUR_WEBSITE_ID"
  });
</script>`

  return (
    <form onSubmit={handleSubmit}>
      <div className="container mx-auto py-10 space-y-6 max-w-[50%]">
        {/* Step 1 Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                1
              </span>
              Enter Your Website URL
            </CardTitle>
            <CardDescription>Register your website to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input 
                id="url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                type="url" 
                placeholder="https://example.com" 
                required 
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 2 Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                2
              </span>
              Add Tracking Script
            </CardTitle>
            <CardDescription>
              Copy and paste this script just before the closing {'</body>'} tag of your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code className="text-sm">{trackingScript}</code>
              </pre>
              <Button 
                type="button"
                variant="secondary" 
                size="sm" 
                className="absolute top-2 right-2"
                onClick={() => navigator.clipboard.writeText(trackingScript)}
              >
                <Code className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button and Alert */}
        <div className="flex flex-col items-center gap-4">
          <Button type="submit" className="w-full max-w-md" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              'Set up my analytics'
            )}
          </Button>
          
          {result && (
            <Alert variant="default" className="w-full max-w-md">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{result}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </form>
  )
}

