import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    SUPABASE_URL: "https://qvarloofqmysycykstty.supabase.co",
    SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2YXJsb29mcW15c3ljeWtzdHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5MzY5NzksImV4cCI6MjA0MjUxMjk3OX0.5000000000000000000000000000000000000000",
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    // Create a new watchOptions object that includes both existing and new ignored patterns
    const ignored = ["**/supabase/**"];
    if (config.watchOptions?.ignored && config.watchOptions.length > 0) {
      ignored.push(config.watchOptions.ignored);
    }
    config.watchOptions = {
      ...config.watchOptions,
      ignored,
    };
    return config;
  },
};

export default nextConfig;
