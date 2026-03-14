import type { Metadata } from "next";
import { getSEOSettings, buildMetadata, getProfileImage } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, profileImage] = await Promise.all([getSEOSettings(), getProfileImage()]);
  return buildMetadata(seo, {
    title: `Blog | ${seo.title}`,
    description: `Read articles, thoughts, and insights from ${seo.title}.`,
    ogTitle: `Blog | ${seo.title}`,
    ogDescription: `Read articles, thoughts, and insights from ${seo.title}.`,
    favicon: profileImage,
  });
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
