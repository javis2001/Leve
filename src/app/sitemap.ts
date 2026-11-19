import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/termos", "/privacidade", "/login", "/cadastro"].map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly" }));
}
