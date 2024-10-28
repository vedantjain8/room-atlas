/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_HOSTNAME: process.env.HOSTNAME,
  },
};

export default nextConfig;
