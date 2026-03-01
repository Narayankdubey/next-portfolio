"use client";
import React, { useEffect, useState } from "react";
import BlogForm from "@/components/features/blog/BlogForm";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface BlogPostAdmin {
  id: string;
  title: string;
  description: string;
  content: string;
  type: "internal" | "external";
  externalUrl?: string;
  thumbnailUrl?: string;
  isVisible: boolean;
}

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<BlogPostAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/admin/blog?id=${id}`);
        const json = await res.json();
        if (json.success) {
          setPost(json.data);
        } else {
          console.error("Failed to load blog post", json.error);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleClose = () => {
    router.push("/admin/blog");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Post not found.</p>
        <button
          onClick={handleClose}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-gray-900 flex flex-col p-4 lg:p-6 text-white">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <button
          onClick={handleClose}
          className="flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Edit Blog Post</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <BlogForm onClose={handleClose} existingPost={post} />
      </div>
    </div>
  );
}
