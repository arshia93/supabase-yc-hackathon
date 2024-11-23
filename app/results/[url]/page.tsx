"use client";

import React, { Usable, useState } from "react";
import { EventDataTable } from "@/components/ui/event-table";
import { EventChart } from "@/components/ui/event-chart";
import { createClient } from '@supabase/supabase-js'
import { debug } from "console";
import { EventDataTableLive } from "@/components/ui/event-table-live";
import { API_KEY } from "@/app/api";

export type EventDefinition = {
  name: string;
  domain: string;
  route: string;
}

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
  route: string;
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
  const unwrappedParams: { url: string } = React.use(params);
  const url = React.useMemo(() => unwrappedParams.url, [unwrappedParams.url])
  console.log("URL", url)
  
  const [events, setEvents] = React.useState<EventData[]>([]);
  const [routeMeta, setRouteMeta] = React.useState<RouteMeta[]>([]);
  
  const paths = React.useMemo(() => {
    return [...new Set(routeMeta.map((route: RouteMeta) => route.route))];
  }, [routeMeta]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const eventDefinitions = React.useMemo(() => {
    return routeMeta.map((route: RouteMeta) => route.meta.map((meta) => ({
      name: meta.eventName,
      domain: route.domain,
      route: route.route,
    }))).flat().filter((event) => selectedPath ? event.route === selectedPath : true);
  }, [routeMeta, selectedPath]);

  const filteredEvents = React.useMemo(() => {
    return events.filter((event) => selectedPath ? event.route === selectedPath : true);
  }, [events, selectedPath]);

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
        setEvents((prevEvents) => {
          let result = [...prevEvents, data]
          result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          return result
      });
      },
      (error) => {
        console.error("Error", error);
      }
    );
  }, []);

  const [newRoute, setNewRoute] = useState<string>("")
  const [isAddingRoute, setIsAddingRoute] = useState(false)
  const addRoute = async () => {
    setIsAddingRoute(true)
    try {
      const response = await fetch('https://qvarloofqmysycykstty.supabase.co/functions/v1/parse-url', {
        method: 'POST',
        mode: "cors",
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'apikey': API_KEY
        },
        body: JSON.stringify({
          url: "https://" + url + newRoute,
        })
      });
      const data = await response.json()
      console.log(data)
    } catch (error) {
      console.error("Error", error);
    } finally {
      setIsAddingRoute(false)
    } 
  }

  return (
    <>
    <nav className="border-b">
          <div className="container mx-auto">
            <div className="flex h-16 items-center justify-between">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold">Supatrack</span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  className="rounded-md border border-gray-300 px-3 py-1.5"
                  placeholder="/pricing"
                  value={newRoute}
                  onChange={(e) => setNewRoute(e.target.value)}
                />
                <button className="rounded-md bg-primary px-4 py-1.5 text-white" onClick={addRoute} disabled={isAddingRoute}>
                  {isAddingRoute ? "Adding..." : "Add Route"}
                </button>
              </div>
            </div>
          </div>
        </nav>
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Website url */}
          <h1 className="text-2xl font-bold mb-6">{url}</h1>
        {/* toggle paths */}
        <div className="mb-6 flex justify-end">
          <select
            value={selectedPath || ""}
            onChange={(e) => setSelectedPath(e.target.value || null)}
            className="w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">All Paths</option>
            {paths.map((path) => (
              <option key={path} value={path}>
                {path}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Chart */}
      <EventChart eventDefinitions={eventDefinitions} events={filteredEvents} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div>
          <EventDataTable data={eventDefinitions} />
        </div>
        {/* Right column */}
        <div>
          <EventDataTableLive data={filteredEvents} />
        </div>
      </div>
    </div>
    </>
  );
}
