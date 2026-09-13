"use strict";

/*
 * Zero-dependency static file server for the Endfield Protocol Dashboard.
 * Serves the static PWA that lives in the repository root (/app).
 * Sensitive project directories (backend source, apps-script source,
 * tooling, VCS metadata) are never exposed over HTTP.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);

const BLOCKED_TOP_LEVEL = new Set([
  "google-apps-script",
  "scripts",
  "frontend",
  "backend",
  "memory",
  "tests",
  ".git",
  ".emergent"
]);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8"
};

function securityHeaders(res, contentType) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  if (contentType) res.setHeader("Content-Type", contentType);
}

function sendError(res, code, message) {
  securityHeaders(res, "text/plain; charset=utf-8");
  res.statusCode = code;
  res.end(message);
}

const server = http.createServer((req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    let pathname = decodeURIComponent(requestUrl.pathname);

    if (pathname === "/" || pathname === "") pathname = "/index.html";

    const relative = pathname.replace(/^\/+/, "");
    const topLevel = relative.split("/")[0];
    if (BLOCKED_TOP_LEVEL.has(topLevel)) {
      return sendError(res, 403, "Forbidden");
    }

    const resolved = path.resolve(ROOT, relative);
    if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
      return sendError(res, 403, "Forbidden");
    }

    fs.stat(resolved, (statErr, stat) => {
      if (statErr || !stat.isFile()) {
        return sendError(res, 404, "Not Found");
      }
      const ext = path.extname(resolved).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      securityHeaders(res, contentType);
      res.statusCode = 200;
      fs.createReadStream(resolved)
        .on("error", () => sendError(res, 500, "Internal Server Error"))
        .pipe(res);
    });
  } catch (error) {
    sendError(res, 400, "Bad Request");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Endfield Protocol static server running on http://${HOST}:${PORT}`);
});
