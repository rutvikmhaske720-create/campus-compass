import { MetadataRoute } from "next";
import clubsData from "@/data/clubs.json";
import { Club } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const clubs = clubsData as Club[];
  const baseUrl = "https://clubs.mitaoe.ac.in";

  const clubUrls = clubs.map((club) => ({
    url: `${baseUrl}/clubs/${club.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const mainPages = ["", "/clubs", "/events", "/gallery", "/achievements", "/team", "/contact"];
  const mainUrls = mainPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1.0 : 0.9,
  }));

  return [...mainUrls, ...clubUrls];
}
