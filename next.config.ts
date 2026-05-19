/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Tells Next.js to generate a static HTML/CSS/JS export
  basePath: '/KK_Wedding_Invitation', // Matches your GitHub repository name
  images: {
    unoptimized: true, // Required for static export as Next.js image optimization needs a server
  },
};

export default nextConfig;
