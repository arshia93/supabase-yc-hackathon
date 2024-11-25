const { createClient } = require("@supabase/supabase-js");

const dotenv = require("dotenv");
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
  throw new Error(
    "Missing required environment variables SUPABASE_URL and/or SUPABASE_API_KEY",
  );
}
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

async function uploadFile(filePath: string) {
  const { data, error } = await supabase.storage.from("track").upload(
    "t.js",
    filePath,
    {
      upsert: true,
    },
  );
  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
}

uploadFile("./bundle/dist.js");
