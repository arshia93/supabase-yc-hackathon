import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    // Create a new watchOptions object that includes both existing and new ignored patterns
    const ignored = ['**/supabase/**']
    if (config.watchOptions?.ignored && config.watchOptions.length > 0) {
      ignored.push(config.watchOptions.ignored)
    }
    config.watchOptions = {
      ...config.watchOptions,
      ignored
    };
    return config;
  }
};

export default nextConfig;