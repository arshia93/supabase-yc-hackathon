// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const data = await req.json();
  await saveEvent({
    id: crypto.randomUUID(),
    domain: data.domain,
    route: data.route,
    name: data.name,
    anon_id: data.anon_id,
  });

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  );
});

type Event = {
  id: string;
  domain: string;
  route: string;
  name: string;
  anon_id: string;
};

async function saveEvent(event: Event) {
  const supabase = getSupabaseClient();
  const response = await supabase.from("event").insert(event);
  console.log("Insert events response", response);
}

function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );
}
