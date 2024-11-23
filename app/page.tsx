'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function CrawlWebsitePage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    // Simulate crawling process
    await new Promise(resolve => setTimeout(resolve, 2000))

    const setupSteps = [
      'Analyzing website structure...',
      'Identifying key pages...',
      'Detecting user interactions...',
      'Mapping event triggers...',
      'Finalizing event list...'
    ]

    const results = setupSteps.map(step => ({
      step,
      status: Math.random() > 0.2 ? 'success' : 'warning'
    }))

    setResult({ 
      success: true, 
      message: 'Website crawled and events detected', 
      results
    })

    setIsLoading(false)
  }

  function handleViewEvents() {
    // In a real application, you'd pass the crawled data to the events page
    // For this example, we'll just navigate to the events page
    router.push('/events')
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Website Crawler and Event Detection</CardTitle>
          <CardDescription>Enter your website URL to simulate crawling and event detection</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Crawling...' : 'Crawl Website'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          {result && (
            <div className="w-full space-y-4">
              <Alert variant="default">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                {result.results.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    {item.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span>{item.step}</span>
                  </div>
                ))}
              </div>
              <Button onClick={handleViewEvents}>View Detected Events</Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

