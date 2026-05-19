/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ? `/${process.env.NEXT_PUBLIC_BASE_PATH}` : "";
const assetPrefix = basePath;

const nextConfig = {
  output: 'export', // generate a static export for GitHub Pages
  basePath,
  assetPrefix,
  trailingSlash: true,
  images: {
    unoptimized: true, // necessary for static export
  },
};

export default nextConfig;