import { MetadataRoute } from "next";
import { tools } from "@/lib/tools-registry";

export const dynamic = "force-static";

const BASE_URL = "https://payloadify.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL },
    ...tools
      .filter((tool) => tool.status === "live")
      .map((tool) => ({ url: `${BASE_URL}/${tool.slug}` })),
  ];
}
