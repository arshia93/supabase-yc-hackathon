'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { API_KEY } from './api'

export default function SetupPage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    const body = JSON.stringify({
      url: url,
    })
          
    try {
      const response = await fetch('https://qvarloofqmysycykstty.supabase.co/functions/v1/parse-url', {
        method: 'POST',
        mode: "cors",
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'apikey': API_KEY
        },
        body: body
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json()
      console.log("Response data:", data)
  
      if (!data.domain) {
        throw new Error(`Invalid response: ${JSON.stringify(data)}`);
      }
  
      setResult('Website registered successfully!')
      window.location.href = `/results/${data.domain}`
    } catch (error) {
      console.error("Error details:", error)
      setResult(`Error registering website: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const trackingScript = `<script src="https://qvarloofqmysycykstty.supabase.co/storage/v1/object/public/track/annotate.js" defer></script>`

  return (
    <>
    <nav className="border-b">
          <div className="container mx-auto">
            <div className="flex h-16 items-center justify-between">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold">Supatrack</span>
              </div>
            </div>
          </div>
        </nav>
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
    </>
  )
}

