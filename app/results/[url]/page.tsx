"use client";

import { API_KEY } from "@/app/api";
import { EventChart } from "@/components/ui/event-chart";
import { EventDataTable } from "@/components/ui/event-table";
import { EventDataTableLive } from "@/components/ui/event-table-live";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@supabase/supabase-js';
import React, { useState } from "react";

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

function getSupabaseClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
}

type RouteMeta = {
  domain: string;
  route: string;
  created_at: string;
  meta: {haid: string, eventName: string}[]
}

function loadAndSubscribeToRouteMeta(domain: string, onData: (data: RouteMeta) => void, onError: (error: Error) => void) {
  const supabase = getSupabaseClient()
  supabase
    .from('route_meta')
    .select()
    .eq("domain", domain)
    .then(({ data, error }) => {
      data?.forEach((item) => {
        onData(item);
      });
      if (error) {
        onError(error);
      }
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

function loadAndSubscribeToEvents(domain: string, onData: (data: EventData) => void, onError: (error: Error) => void) {
  const supabase = getSupabaseClient()
  supabase
    .from('event')
    .select()
    .eq("domain", domain)
    .then(({ data, error }) => {
      data?.forEach((item) => {
        onData(item);
      });
      if (error) {
        onError(error);
      }
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


export default function EventsPage({ params }: { params: Promise<{ url: string }> }) {
  const unwrappedParams: { url: string } = React.use(params);
  const url = React.useMemo(() => unwrappedParams.url, [unwrappedParams.url])
  
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
          const result = [...prevEvents, data]
          result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          return result
      });
      },
      (error) => {
        console.error("Error", error);
      }
    );
  }, [url]);

  const [newRoute, setNewRoute] = useState<string>("")
  const [isAddingRoute, setIsAddingRoute] = useState(false)
  const { toast } = useToast()  
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
      setNewRoute("")

      console.log(data)
      toast({
        title: "Route " + newRoute + " added successfully.",
        description: "Load that route to see events.",
      })
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
                <span className="text-xl font-bold" onClick={() => window.location.href = '/'}>Supatrack</span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  className="rounded-md border border-gray-300 px-3 py-1"
                  placeholder="/pricing"
                  value={newRoute}
                  onChange={(e) => setNewRoute(e.target.value)}
                />
                <button 
                  className={`rounded-md px-4 py-1 text-white ${isAddingRoute ? 'bg-gray-400' : 'bg-primary'}`}
                  onClick={addRoute} 
                  disabled={isAddingRoute}
                >
                  {isAddingRoute ? "Adding..." : "Add Route"}
                </button>
              </div>
            </div>
          </div>
        </nav>
    <div className="container mx-auto py-6">
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
      <EventChart events={filteredEvents} />
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
    <Toaster />
    </>
  );
}
