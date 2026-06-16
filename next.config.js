/** @type {import('next').NextConfig} */

// Equivalent to `secure: false` in http-proxy-middleware (setupProxy.js)
// Allows proxying to backends with self-signed or untrusted TLS certs in dev
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Corporate proxy support (equivalent to HttpsProxyAgent in setupProxy.js)
// Routes all outbound Node.js HTTP/HTTPS requests through the corporate proxy
// Set HTTP_PROXY or HTTPS_PROXY in your .env.local (e.g. http://proxy.corp.example.com:8080)
const corporateProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
if (corporateProxy) {
  process.env.GLOBAL_AGENT_HTTP_PROXY = corporateProxy;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("global-agent/bootstrap");
}

const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
