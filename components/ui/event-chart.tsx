"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { EventData } from "@/app/results/[url]/page"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const chartConfig = {
  events: {
    label: "Events",
  },
} satisfies ChartConfig

function bucketEventsByHour(events: EventData[]): { date: string, events: number }[] {
  const buckets = new Map<string, number>();
  
  events.forEach(event => {
    // Convert to local date string in ISO format, truncated to hour
    const date = new Date(event.created_at);
    const hourKey = date.toISOString().slice(0, 13) + ':00:00.000Z';
    
    // Increment count for this hour
    buckets.set(hourKey, (buckets.get(hourKey) || 0) + 1);
  });

  // Convert map to array of objects sorted by date
  return Array.from(buckets.entries())
    .map(([date, events]) => ({
      date,
      events
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}


export function EventChart({ events }: { events: EventData[] }) {
  const [timeRange, setTimeRange] = React.useState("12hr")
  
  const bucketedEvents = bucketEventsByHour(events);

  const filteredData = bucketedEvents.filter((item) => {
    const date = new Date(item.date)
    const now = new Date()
    let hoursToSubtract = 48
    if (timeRange === "24hr") {
      hoursToSubtract = 24
    } else if (timeRange === "12hr") {
      hoursToSubtract = 12
    }
    const startDate = new Date(now.getTime() - (hoursToSubtract * 60 * 60 * 1000))
    return date >= startDate
  })

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Total events</CardTitle>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="48hr" className="rounded-lg">
              Last 48 hours
            </SelectItem>
            <SelectItem value="24hr" className="rounded-lg">
              Last 24 hours  
            </SelectItem>
            <SelectItem value="12hr" className="rounded-lg">
              Last 12 hours
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillEvents" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-events)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-events)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric"
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric"
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="events"
              type="natural"
              fill="url(#fillEvents)"
              stroke="var(--color-events)"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
