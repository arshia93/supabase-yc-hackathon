"use client";

import { useState } from "react";
import { EventDataTable } from "@/components/ui/event-table";
import { EventChart } from "@/components/ui/event-chart";

export type EventData = {
  id: string;
  event: string;
  event_action: string;
  path: string;
};

const eventData: EventData[] = [
  {
    id: "m5gr84i9",
    event: "pay_clicked",
    event_action: "user clicks pay button",
    path: "/pay",
  },
  {
    id: "3u1reuv4",
    event: "signup_clicked",
    event_action: "user clicks signup button",
    path: "/signup",
  },
  {
    id: "derv1ws0",
    event: "login_clicked",
    event_action: "user clicks login button",
    path: "/login",
  },
  {
    id: "5kma53ae",
    event: "search_clicked",
    event_action: "user clicks search button",
    path: "/dashboard",
  },
  {
    id: "bhqecj4p",
    event: "menu_clicked",
    event_action: "user clicks menu button",
    path: "/dashboard",
  },
];

export default function EventsPage() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const filteredData = selectedPath
    ? eventData.filter((event) => event.path === selectedPath)
    : eventData;

  const uniquePaths = [...new Set(eventData.map((event) => event.path))];

  return (
    <div className="container mx-auto py-10">
      {/* toggle paths */}
      <div className="mb-6">
        <select
          value={selectedPath || ""}
          onChange={(e) => setSelectedPath(e.target.value || null)}
          className="w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="">All Paths</option>
          {uniquePaths.map((path) => (
            <option key={path} value={path}>
              {path}
            </option>
          ))}
        </select>
      </div>
      
      {/* Chart */}
      <EventChart />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div>
          <EventDataTable data={filteredData} />
        </div>
        {/* Right column */}
        <div>{/* Live Events */}</div>
      </div>
    </div>
  );
}
