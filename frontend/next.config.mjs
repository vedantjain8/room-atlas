/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_HOSTNAME: process.env.HOSTNAME,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        // port: "3100",
        // pathname: '**',
      },
    ],
  },
};

export default nextConfig;
