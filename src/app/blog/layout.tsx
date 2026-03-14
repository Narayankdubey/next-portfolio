import type { Metadata } from "next";
import { getSEOSettings, buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOSettings();
  return buildMetadata(seo, {
    title: `Blog | ${seo.title}`,
    description: `Read articles, thoughts, and insights from ${seo.title}.`,
    ogTitle: `Blog | ${seo.title}`,
    ogDescription: `Read articles, thoughts, and insights from ${seo.title}.`,
  });
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
