// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// steps:
// install deno
// insall deno vscode plugin

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "jsr:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

console.log(`Function "parse-url" up and running!`);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url, html } = await req.json();
    const htmlContent = html ? html : await getHtmlContentForUrl(url);
    const data = await routeMetadataFromHtml(url, htmlContent);
    
    console.log("RouteMeta", data);
    await saveRouteMetadata(data);

    return new Response(JSON.stringify(data), { 
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json"
      } 
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json"
      }
    });
  }
});

async function getNodesToTrack(bodyHtml: string) {
  const anthropic = new Anthropic({
    apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
  });

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1000,
    messages: [{ role: "user", content: bodyHtml }, {
      role: "user",
      content:
        "For the provided HTML, find all element that should be tracked for analytics. Return a JSON list of the elements { haid, eventName } and nothing else. eventName should be in snake_case and about actions (not views). For example, github_link_clicked.",
    }],
  });

  return JSON.parse(response.content[0].text);
}

type RouteMetadata = {
  domain: string;
  route: string;
  meta: { haid: string; event_name: string }[];
  hierarchy_hash: string;
};

async function saveRouteMetadata(routeMetadata: RouteMetadata) {
  const supabase = getSupabaseClient();
  const response = await supabase.from("route_meta").upsert(routeMetadata)
    .select();
  console.log("Insert route_meta response", response);
}

function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );
}
