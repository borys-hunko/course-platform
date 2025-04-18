import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    localPatterns: [
      {
        pathname: 'public',
        search: '',
      },
    ],
  },
};

export default nextConfig;
