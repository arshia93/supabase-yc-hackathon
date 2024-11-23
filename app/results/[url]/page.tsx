"use client";

import React, { Usable, useState } from "react";
import { EventDataTable } from "@/components/ui/event-table";
import { EventChart } from "@/components/ui/event-chart";
import { createClient } from '@supabase/supabase-js'
import { debug } from "console";

export type EventData = {
  domain: string;
  route: string;
  name: string;
  anon_id: string;
  created_at: string;
};

const eventData: EventData[] = [
  {
    id: "m5gr84i9",
    event: "pay_clicked",
    event_action: "user clicks pay button",
    path: "/pay",
    date: "2024-04-01",
  },
  {
    id: "3u1reuv4",
    event: "signup_clicked",
    event_action: "user clicks signup button",
    path: "/signup",
    date: "2024-04-01",
  },
  {
    id: "derv1ws0",
    event: "login_clicked",
    event_action: "user clicks login button",
    path: "/login",
    date: "2024-04-01",
  },
  {
    id: "5kma53ae",
    event: "search_clicked",
    event_action: "user clicks search button",
    path: "/dashboard",
    date: "2024-04-01",
  },
  {
    id: "bhqecj4p",
    event: "menu_clicked",
    event_action: "user clicks menu button",
    path: "/dashboard",
    date: "2024-04-01",
  },
];

function getSupabaseClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
}

type RouteMeta = {
  domain: string;
  path: string;
  created_at: string;
  meta: {haid: string, eventName: string}[]
}

function loadAndSubscribeToRouteMeta(domain: string, onData: (data: RouteMeta) => void, onError: (error: any) => void) {
  const supabase = getSupabaseClient()
  supabase
    .from('route_meta')
    .select()
    .eq("domain", domain)
    .then(({ data, error }) => {
      data?.forEach((item) => {
        onData(item);
      });
    });

  supabase
    .channel("custom-all-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "route_meta" },
      (payload) => {
        const newData = payload.new as RouteMeta;
        if (newData.domain === domain) {
          onData(newData);
        }
      }
    )
    .subscribe();
}

function loadAndSubscribeToEvents(domain: string, onData: (data: EventData) => void, onError: (error: any) => void) {
  const supabase = getSupabaseClient()
  supabase
    .from('event')
    .select()
    .eq("domain", domain)
    .then(({ data, error }) => {
      data?.forEach((item) => {
        onData(item);
      });
    });

  supabase
    .channel("custom-all-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "event" },
      (payload) => {
        const newData = payload.new as EventData;
        if (newData.domain === domain) {
          onData(newData);
        }
      }
    )
    .subscribe();
  }


export default function EventsPage({ params }: { params: Usable<{ url: string }> }) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const unwrappedParams: { url: string } = React.use(params);
  const url = React.useMemo(() => unwrappedParams.url, [unwrappedParams.url])
  console.log("URL", url)
  const filteredData: EventData[] = []

  const [events, setEvents] = React.useState<EventData[]>([]);
  const [routeMeta, setRouteMeta] = React.useState<RouteMeta[]>([]);

  // const uniquePaths = [...new Set(eventData.map((event) => event.path))];

  React.useEffect(() => {
    loadAndSubscribeToRouteMeta(
      url,
      (data) => {
        console.log("Route Meta", data);
        setRouteMeta((prevRouteMeta) => [...prevRouteMeta, data]);
      },
      (error) => {
        console.error("Error", error);
      }
    );
    loadAndSubscribeToEvents(
      url,
      (data) => {
        console.log("Event Data", data);
        setEvents((prevEvents) => [...prevEvents, data]);
      },
      (error) => {
        console.error("Error", error);
      }
    );
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Website url */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-6">Analytics for Wbesite</h1>
        </div>
        {/* toggle paths */}
        <div className="mb-6 flex justify-end">
          <select
            value={selectedPath || ""}
            onChange={(e) => setSelectedPath(e.target.value || null)}
            className="w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">All Paths</option>
            {/* {uniquePaths.map((path) => (
              <option key={path} value={path}>
                {path}
              </option>
            ))} */}
          </select>
        </div>
      </div>
      {/* Chart */}
      <EventChart />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div>
          <EventDataTable data={events} />
        </div>
        {/* Right column */}
        <div>{/* Live Events */}</div>
      </div>
    </div>
  );
}
