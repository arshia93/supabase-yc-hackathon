import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer }) => {
    // Ignore Deno specific files
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [...(config.watchOptions?.ignored ?? []), '**/supabase/functions/**']
    };
    return config;
  }
};

export default nextConfig;