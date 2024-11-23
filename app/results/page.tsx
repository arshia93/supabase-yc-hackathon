'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { CheckCircle, AlertCircle } from 'lucide-react'

// Simulated events data
const initialEvents = [
  { id: 1, name: 'Page View', selector: 'body', approved: false },
  { id: 2, name: 'Button Click', selector: '.cta-button', approved: false },
  { id: 3, name: 'Form Submit', selector: 'form#contact', approved: false },
  { id: 4, name: 'Menu Open', selector: '.menu-toggle', approved: false },
  { id: 5, name: 'Video Play', selector: 'video#hero-video', approved: false },
]

interface CrawlResult {
  success: boolean;
  message: string;
  results: {
    step: string;
    status: 'success' | 'warning';
  }[];
}

export default function EventsPage() {
  const [events, setEvents] = useState(initialEvents)
  const router = useRouter()
  const [result, setResult] = useState<CrawlResult | null>(null);

  function handleApproval(id: number, approved: boolean) {
    setEvents(events.map(event => 
      event.id === id ? { ...event, approved } : event
    ))
  }

  function handleSave() {
    // In a real application, you'd save the approved events to your backend
    console.log('Saving approved events:', events.filter(e => e.approved))
    router.push('/')
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Detected Events</CardTitle>
          <CardDescription>Review and approve the events detected during the website crawl</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Selector</TableHead>
                <TableHead>Approve</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.name}</TableCell>
                  <TableCell><code>{event.selector}</code></TableCell>
                  <TableCell>
                    <Switch
                      checked={event.approved}
                      onCheckedChange={(checked) => handleApproval(event.id, checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/')}>Back</Button>
          <Button onClick={handleSave}>Save Approved Events</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

