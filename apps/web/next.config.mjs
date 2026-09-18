/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: 'api' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
