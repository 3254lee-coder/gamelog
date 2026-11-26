"use client";

import { Analytics } from "@vercel/analytics/next";

const allowedPaths = [
  "/",
  "/community",
  "/guide",
  "/species",
];

export default function SiteAnalytics() {
  return (
    <Analytics
      mode="production"
      beforeSend={(event) => {
        try {
          const url = new URL(
            event.url,
            window.location.origin
          );

          if (
            url.hostname !==
            "like-turtle.vercel.app"
          ) {
            return null;
          }

          const pathname =
            url.pathname.replace(/\/+$/, "") || "/";

          const isPublicPage =
            allowedPaths.includes(pathname) ||
            pathname.startsWith("/guide/") ||
            pathname.startsWith("/species/") ||
            (
              pathname.startsWith("/community/") &&
              pathname !== "/community/write" &&
              pathname.split("/").length === 3
            );

          if (!isPublicPage) {
            return null;
          }

          url.search = "";
          url.hash = "";

          return {
            ...event,
            url: url.toString(),
          };
        } catch {
          return null;
        }
      }}
    />
  );
}
