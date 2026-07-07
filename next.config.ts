import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package.json/package-lock.json in the parent home directory
  // makes Next.js misdetect the workspace root, which balloons output file
  // tracing to the whole home folder during `next build`. Pin it explicitly.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
