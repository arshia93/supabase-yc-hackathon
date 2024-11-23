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
  "Access-Control-Allow-Headers": "Authorization, apikey, Content-Type",
};

console.log(`Function "parse-url" up and running!`);

Deno.serve(async (req) => {
  console.log("req", req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { url } = await req.json();
  console.log(
    `wss://chrome.browserless.io?token=${
      Deno.env.get("PUPPETEER_BROWSERLESS_IO_KEY")
    }`,
  );

  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${
      Deno.env.get(
        "PUPPETEER_BROWSERLESS_IO_KEY",
      )
    }`,
  });
  const page = await browser.newPage();

  // Wait until network is idle (no requests for 500ms)
  await page.goto(url, {
    waitUntil: "networkidle0",
    timeout: 30000, // 30 seconds timeout
  });
  // const screenshot = await page.screenshot()
  // const screenshotDataUrl = `data:image/png;base64,${btoa(String.fromCharCode(...screenshot))}`
  const htmlContent = await page.content();

  const $ = cheerio.load(htmlContent);
  const body = $("body").clone();
  $("script", body).remove();

  function getHierarchyHash(inputNode: cheerio.Cheerio) {
    const result: string[] = [];

    function traverse($node: cheerio.Cheerio) {
      const tagName = $node.prop("tagName")?.toLowerCase();
      if (tagName && tagName !== "script") {
        result.push(tagName);
      }

      $node.children().each((_, child: cheerio.Cheerio) => {
        traverse($(child));
      });
    }

    traverse(inputNode);
    return result.join(".");
  }

  // Function to get DOM path
  function getDomPath($el: cheerio.Cheerio) {
    const path: number[] = [];
    let current = $el;
    while (current.parent().length) {
      const parent = current.parent();
      const children = parent.children();
      const index = children.index(current);
      path.unshift(index);
      current = parent;
    }

    return path.join(".");
  }

  // Walk the DOM tree and add haid attribute
  function addHaidAttribute($el: cheerio.Cheerio) {
    const tagName = $el.prop("tagName")?.toLowerCase() || "text";
    const path = getDomPath($el);
    $el.attr("haid", `${tagName}-${path}`);

    // Recursively process child nodes
    // deno-lint-ignore no-explicit-any
    $el.children().each((_: any, child: cheerio.Cheerio) => {
      addHaidAttribute($(child));
    });
  }

  // Start from body and process entire tree
  addHaidAttribute(body);

  const bodyHtml = "<body>" + body.html() + "</body>";

  const data: RouteMetadata = {
    domain: new URL(url).hostname,
    route: new URL(url).pathname,
    meta: await getNodesToTrack(bodyHtml),
    hierarchy_hash: getHierarchyHash(body),
  };

  await saveRouteMetadata(data);

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
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
        "For the provided HTML, find all element that should be tracked for analytics. Return a JSON list of the elements { haid, eventName } and nothing else. eventName should be in snake_case and should be <descriptive_noun>_<past_tense_verb>.",
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
