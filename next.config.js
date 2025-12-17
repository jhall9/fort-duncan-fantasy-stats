/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  // Set basePath for GitHub Pages deployment
  basePath:
    process.env.NODE_ENV === "production" ? "/fort-duncan-fantasy-stats" : "",
  assetPrefix:
    process.env.NODE_ENV === "production" ? "/fort-duncan-fantasy-stats/" : "",
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
