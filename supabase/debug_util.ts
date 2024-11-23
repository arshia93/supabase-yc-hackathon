const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

const args = process.argv.slice(2);
const env = args[0] || "local";

module.exports.getSupabaseClient = function getSupabaseClient() {
  if (env === "local") {
    return createClient(
      "http://localhost:54321",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
    );
  } else if (env === "prod") {
    return createClient(process.env.SUPABASE_URL!, "public-anon-key");
  }
  throw new Error(`Unknown environment: ${env}`);
};
