import type { Metadata } from "next";
import { getSEOSettings, buildMetadata, getProfileImage } from "@/lib/seo";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

async function getBlogPost(slug: string) {
  try {
    await dbConnect();
    const post = (await (BlogPost as any).findOne({ slug }).lean()) as {
      title?: string;
      description?: string;
      thumbnailUrl?: string;
    } | null;
    return post;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const [seo, post, profileImage] = await Promise.all([
    getSEOSettings(),
    getBlogPost(params.slug),
    getProfileImage(),
  ]);

  if (!post) {
    return buildMetadata(seo, {
      title: `Blog | ${seo.title}`,
      description: seo.description,
      favicon: profileImage,
    });
  }

  return buildMetadata(seo, {
    title: `${post.title} | ${seo.title}`,
    description: post.description ?? seo.description,
    ogTitle: post.title ?? seo.ogTitle,
    ogDescription: post.description ?? seo.ogDescription,
    ogImage: post.thumbnailUrl ?? seo.ogImage,
    favicon: profileImage,
  });
}

export default function BlogDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
