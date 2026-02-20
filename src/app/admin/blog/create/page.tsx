"use client";
import BlogForm from "@/components/BlogForm";
import { useRouter } from "next/navigation";

export default function CreateBlogPost() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/admin/blog");
    router.refresh();
  };

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
        <h1 className="text-2xl font-bold">Create Blog Post</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <BlogForm onClose={handleClose} />
      </div>
    </div>
  );
}
