"use strict";

const http = require("http");

const PORT = Number(process.env.PORT) || 3783;
const HOST = process.env.HOST || "0.0.0.0";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || "bff-secret";

const USERS = {
  ada: {
    id: "ada",
    name: "Ada Lovelace",
    email: "ada@example.com",
    session: "ada-session",
    token: "ada-token",
  },
  bob: {
    id: "bob",
    name: "Bob Babbage",
    email: "bob@example.com",
    session: "bob-session",
    token: "bob-token",
  },
};

function send(res, status, body, extraHeaders) {
  const json = JSON.stringify(body, null, 2) + "\n";
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(json),
    ...extraHeaders,
  };
  res.writeHead(status, headers);
  res.end(json);
}

function error(res, status, code, message, extraHeaders) {
  send(res, status, { error: { code, message } }, extraHeaders);
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = value;
  }
  return out;
}

function userBySession(req) {
  const session = parseCookies(req.headers.cookie).session;
  if (!session) return null;
  return Object.values(USERS).find((u) => u.session === session) || undefined;
}

function userByBearer(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  return Object.values(USERS).find((u) => u.token === token) || undefined;
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function requireUser(res, user) {
  if (user === null) {
    error(res, 401, "UNAUTHENTICATED", "Missing credentials.");
    return false;
  }
  if (user === undefined) {
    error(res, 401, "UNAUTHENTICATED", "Invalid credentials.");
    return false;
  }
  return true;
}

function requireOwner(res, actor, resourceId) {
  if (actor.id !== resourceId) {
    error(
      res,
      403,
      "FORBIDDEN",
      `Authenticated as ${actor.id}, but cannot access user ${resourceId}.`
    );
    return false;
  }
  return true;
}

function findResource(res, id) {
  const user = USERS[id];
  if (!user) {
    error(res, 404, "USER_NOT_FOUND", `User ${id} does not exist.`);
    return null;
  }
  return user;
}

function handleHealth(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    error(res, 405, "METHOD_NOT_ALLOWED", "Use GET /health.");
    return;
  }
  send(res, 200, { ok: true, versions: ["A", "B", "C", "D", "E", "BFF"] });
}

function handleA(req, res, id) {
  const cors = { "Access-Control-Allow-Origin": "*" };
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      ...cors,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }
  if (req.method !== "GET") {
    error(res, 405, "METHOD_NOT_ALLOWED", "Use GET.", cors);
    return;
  }
  const user = findResource(res, id);
  if (!user) return;
  send(res, 200, { version: "A", note: "Public. Anyone can read this.", user: publicUser(user) }, cors);
}

function handleB(req, res, id) {
  if (req.method !== "GET") {
    error(res, 405, "METHOD_NOT_ALLOWED", "Use GET.");
    return;
  }
  const actor = userBySession(req);
  if (!requireUser(res, actor)) return;
  const user = findResource(res, id);
  if (!user) return;
  send(res, 200, {
    version: "B",
    note: "Cookie authenticates you. This version does not check object-level authorization.",
    authenticatedAs: actor.id,
    user: publicUser(user),
  });
}

function handleC(req, res, id) {
  if (req.method !== "GET") {
    error(res, 405, "METHOD_NOT_ALLOWED", "Use GET.");
    return;
  }
  const actor = userByBearer(req);
  if (!requireUser(res, actor)) return;
  const user = findResource(res, id);
  if (!user) return;
  send(res, 200, {
    version: "C",
    note: "Bearer authenticates you. This version does not check object-level authorization.",
    authenticatedAs: actor.id,
    user: publicUser(user),
  });
}

function handleD(req, res, id) {
  if (req.method !== "GET") {
    error(res, 405, "METHOD_NOT_ALLOWED", "Use GET.");
    return;
  }
  const actor = userByBearer(req);
  if (!requireUser(res, actor)) return;
  const user = findResource(res, id);
  if (!user) return;
  if (!requireOwner(res, actor, id)) return;
  send(res, 200, {
    version: "D",
    note: "Bearer plus object-level authorization. Reading someone else yields 403.",
    authenticatedAs: actor.id,
    user: publicUser(user),
  });
}

function handleE(req, res, id) {
  if (req.method !== "GET") {
    error(res, 405, "METHOD_NOT_ALLOWED", "Use GET.");
    return;
  }
  const secret = req.headers["x-internal-auth"];
  if (!secret) {
    error(res, 401, "UNAUTHENTICATED", "Missing X-Internal-Auth. Anonymous clients cannot call Backend.");
    return;
  }
  if (secret !== INTERNAL_SECRET) {
    error(res, 401, "UNAUTHENTICATED", "Invalid X-Internal-Auth.");
    return;
  }
  const user = findResource(res, id);
  if (!user) return;
  send(res, 200, {
    version: "E",
    note: "Backend only accepts the internal BFF secret. Do not put this secret in browser JavaScript.",
    user: publicUser(user),
  });
}

function handleBff(req, res, id) {
  if (req.method !== "GET") {
    error(res, 405, "METHOD_NOT_ALLOWED", "Use GET.");
    return;
  }
  const actor = userBySession(req);
  if (!requireUser(res, actor)) return;
  const user = findResource(res, id);
  if (!user) return;
  if (!requireOwner(res, actor, id)) return;
  send(res, 200, {
    version: "BFF",
    note: "Browser hits the BFF with a session cookie. The BFF adds X-Internal-Auth and enforces authorization.",
    authenticatedAs: actor.id,
    internalAuthInjected: true,
    user: publicUser(user),
  });
}

function notFound(res) {
  error(res, 404, "NOT_FOUND", "No such route. See GET /health.");
}

function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (path === "/health") {
    handleHealth(req, res);
    return;
  }

  const match = path.match(/^\/(a|b|c|d|e|bff)\/users\/([^/]+)$/);
  if (match) {
    const version = match[1];
    const id = decodeURIComponent(match[2]);
    const handlers = {
      a: handleA,
      b: handleB,
      c: handleC,
      d: handleD,
      e: handleE,
      bff: handleBff,
    };
    handlers[version](req, res, id);
    return;
  }

  notFound(res);
}

const server = http.createServer((req, res) => {
  try {
    route(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      error(res, 500, "INTERNAL", "Unexpected server error.");
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`insecure-api listening on http://${HOST}:${PORT}`);
  console.log("Versions: GET /a|/b|/c|/d|/e|/bff/users/:id  health: GET /health");
});
