import dbConnect from "@/lib/mongodb";
import SEOSettings from "@/models/SEOSettings";
import type { Metadata } from "next";

// Default SEO fallback values
const DEFAULT_SEO = {
  title: "Narayan Dubey | Full Stack Developer",
  description:
    "Portfolio of Narayan Dubey, a Full Stack Developer specializing in React, Node.js, and Cloud Technologies.",
  keywords:
    "Narayan Dubey, Full Stack Developer, React, Node.js, Next.js, Web Developer, Portfolio",
  ogTitle: "Narayan Dubey | Full Stack Developer",
  ogDescription:
    "Portfolio of Narayan Dubey, a Full Stack Developer specializing in React, Node.js, and Cloud Technologies.",
  ogImage: "",
  twitterHandle: "@narayandubey",
};

/**
 * Fetches SEO settings from the database, falling back to defaults.
 * Safe to call from server components and generateMetadata functions.
 */
export async function getSEOSettings() {
  try {
    await dbConnect();
    const settings = (await (SEOSettings as any).findOne().lean()) as typeof DEFAULT_SEO | null;
    return settings ?? DEFAULT_SEO;
  } catch {
    return DEFAULT_SEO;
  }
}

/**
 * Builds a Next.js-compatible Metadata object from SEO settings.
 * Optionally override per-page values.
 */
export function buildMetadata(
  seo: typeof DEFAULT_SEO,
  overrides?: Partial<{
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    url: string;
  }>
): Metadata {
  const title = overrides?.title ?? seo.title;
  const description = overrides?.description ?? seo.description;
  const ogTitle = overrides?.ogTitle ?? seo.ogTitle ?? title;
  const ogDescription = overrides?.ogDescription ?? seo.ogDescription ?? description;
  const ogImage = overrides?.ogImage ?? seo.ogImage;

  return {
    title,
    description,
    keywords: seo.keywords,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      ...(overrides?.url ? { url: overrides.url } : {}),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      ...(seo.twitterHandle ? { site: seo.twitterHandle } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
