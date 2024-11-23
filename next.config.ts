import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    // Ignore Deno specific files
    if (config.watchOptions) {
      config.watchOptions.ignored = config.watchOptions.ignored || [];
      if (Array.isArray(config.watchOptions.ignored)) {
        config.watchOptions.ignored.push('**/supabase/functions/**');
      }
    } else {
      config.watchOptions = {
        ignored: ['**/supabase/functions/**']
      };
    }
    return config;
  }
};

export default nextConfig;