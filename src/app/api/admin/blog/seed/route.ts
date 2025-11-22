"use server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

// Sample blog posts related to skills and projects
const samplePosts = [
  {
    title: "Building a Modern Portfolio with Next.js",
    description:
      "A walkthrough of creating a sleek, responsive portfolio using Next.js, Tailwind CSS, and MongoDB.",
    content: `<p>In this post I share the steps I took to build my personal portfolio website. I used Next.js for server‑side rendering, integrated a MongoDB backend for storing projects, and styled everything with a custom design system.</p>`,
    type: "internal",
    thumbnailUrl: "/images/portfolio-thumbnail.jpg",
    isVisible: true,
    likeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Deploying a Full‑Stack App to Vercel",
    description:
      "How I deployed a full‑stack application with API routes, authentication, and CI/CD.",
    content: `<p>This article explains the deployment pipeline I set up for my full‑stack app, including environment variables, Vercel serverless functions, and automated tests.</p>`,
    type: "internal",
    thumbnailUrl: "/images/deploy-thumbnail.jpg",
    isVisible: true,
    likeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Integrating MongoDB Atlas with Next.js API Routes",
    description: "A guide to securely connecting Next.js API routes to MongoDB Atlas.",
    content: `<p>Learn how to configure a connection to MongoDB Atlas, use Mongoose models, and protect credentials with Vercel environment variables.</p>`,
    type: "internal",
    thumbnailUrl: "/images/mongodb-thumbnail.jpg",
    isVisible: true,
    likeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function GET() {
  try {
    await dbConnect();
    // Insert sample posts only if they don't already exist (by title)
    const existing = await BlogPost.find({
      title: { $in: samplePosts.map((p) => p.title) },
    }).lean();
    const existingTitles = existing.map((p) => p.title);
    const toInsert = samplePosts.filter((p) => !existingTitles.includes(p.title));
    if (toInsert.length > 0) {
      await BlogPost.insertMany(toInsert);
    }
    return NextResponse.json({
      success: true,
      inserted: toInsert.length,
      total: await BlogPost.countDocuments(),
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
