import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms", "/age", "/whats-new", "/uptime", "/support"],
        disallow: ["/app", "/api", "/login", "/register"],
      },
    ],
  };
}
