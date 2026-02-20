"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Sun, Moon } from "lucide-react";
import BlogCard from "./BlogCard";
import styles from "./BlogForm.module.css";

interface BlogFormProps {
  onClose: () => void;
  existingPost?: {
    id: string;
    title: string;
    description: string;
    content: string;
    type: "internal" | "external";
    externalUrl?: string;
    thumbnailUrl?: string;
  } | null;
}

export default function BlogForm({ onClose, existingPost }: BlogFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"internal" | "external">("internal");
  const [externalUrl, setExternalUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setDescription(existingPost.description || "");
      setContent(existingPost.content);
      setType(existingPost.type);
      setExternalUrl(existingPost.externalUrl || "");
      setThumbnailUrl(existingPost.thumbnailUrl || "");
    }
  }, [existingPost]);

  const insertFormatting = useCallback(
    (before: string, after: string = before) => {
      const textarea = contentRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const newText =
        content.substring(0, start) + before + selectedText + after + content.substring(end);

      setContent(newText);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
      }, 0);
    },
    [content]
  );

  const formatButtons = useMemo(
    () => [
      { label: "B", title: "Bold", action: () => insertFormatting("<strong>", "</strong>") },
      { label: "I", title: "Italic", action: () => insertFormatting("<em>", "</em>") },
      { label: "Code", title: "Code", action: () => insertFormatting("<code>", "</code>") },
      { label: "H1", title: "Heading 1", action: () => insertFormatting("<h1>", "</h1>") },
      { label: "H2", title: "Heading 2", action: () => insertFormatting("<h2>", "</h2>") },
      { label: "P", title: "Paragraph", action: () => insertFormatting("<p>", "</p>") },
      { label: "List", title: "List Item", action: () => insertFormatting("<li>", "</li>") },
      { label: "Link", title: "Link", action: () => insertFormatting('<a href="url">', "</a>") },
    ],
    [insertFormatting]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      content,
      type,
      externalUrl: type === "external" ? externalUrl : undefined,
      thumbnailUrl: thumbnailUrl || undefined,
    };
    try {
      if (existingPost) {
        const res = await fetch(`/api/admin/blog?id=${existingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) {
          alert("Update failed: " + json.error);
          return;
        }
      } else {
        const res = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) {
          alert("Create failed: " + json.error);
          return;
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  };

  return (
    <div className={styles.container}>
      {/* Form Section */}
      <div className={styles.formSection}>
        <div className={styles.header}>
          <h2>{existingPost ? "Edit Blog Post" : "Create New Blog Post"}</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Title <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description shown in blog listing"
              className={styles.textarea}
              rows={3}
              required
            />
            <span className={styles.hint}>This will be shown in the blog listing preview</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type" className={styles.label}>
              Type <span className={styles.required}>*</span>
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className={styles.select}
            >
              <option value="internal">Internal (Show in app)</option>
              <option value="external">External (Redirect to URL)</option>
            </select>
          </div>

          {type === "external" && (
            <div className={styles.formGroup}>
              <label htmlFor="externalUrl" className={styles.label}>
                External URL <span className={styles.required}>*</span>
              </label>
              <input
                id="externalUrl"
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://example.com/blog-post"
                className={styles.input}
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="thumbnailUrl" className={styles.label}>
              Thumbnail URL
            </label>
            <input
              id="thumbnailUrl"
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={styles.input}
            />
            <span className={styles.hint}>Optional thumbnail image for blog card</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content" className={styles.label}>
              Full Content <span className={styles.required}>*</span>
            </label>
            <div className={styles.editorToolbar}>
              {/* eslint-disable-next-line react-hooks/refs */}
              {formatButtons.map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={btn.action}
                  title={btn.title}
                  className={styles.formatBtn}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <textarea
              id="content"
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content here. Use the formatting buttons above to add HTML formatting."
              className={styles.editor}
              rows={15}
              required={type === "internal"}
            />
            <span className={styles.hint}>Use formatting buttons or write HTML directly</span>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              {existingPost ? "Update Post" : "Create Post"}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      <div
        className={`${styles.previewSection} ${previewTheme === "dark" ? styles.previewDark : styles.previewLight}`}
      >
        <div className={styles.previewHeader}>
          <h2 className="text-xl font-bold flex-1">Live Preview</h2>
          <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setPreviewTheme("light")}
              className={`p-1.5 rounded-md transition-colors ${previewTheme === "light" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
              title="Light Mode"
            >
              <Sun size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme("dark")}
              className={`p-1.5 rounded-md transition-colors ${previewTheme === "dark" ? "bg-gray-700 text-white shadow" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
              title="Dark Mode"
            >
              <Moon size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-10 mt-6">
          {/* Card Preview */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider opacity-60">
              Listing Card Preview
            </h3>
            <div className="max-w-sm rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
              <div className="pointer-events-none">
                <BlogCard
                  id="preview-id"
                  title={title || "Blog Title"}
                  description={description || "Blog Description"}
                  thumbnailUrl={thumbnailUrl}
                  type={type}
                  externalUrl={externalUrl}
                  createdAt={new Date().toISOString()}
                  likeCount={0}
                  commentCount={0}
                  viewCount={0}
                  slug="preview"
                />
              </div>
            </div>
          </div>

          <hr className="border-t border-gray-300 dark:border-gray-700 opacity-50" />

          {/* Detailed Content Preview */}
          <div className="transition-colors">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider opacity-60">
              Full Detail Preview
            </h3>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2 break-words">{title || "Blog Title"}</h1>
              <p className="opacity-70 mb-4 break-words">{description || "Blog Description"}</p>
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full max-h-96 object-cover rounded-lg mb-6 border border-gray-200 dark:border-gray-800"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
            </div>

            {type === "internal" ? (
              <div
                className={styles.previewContent}
                dangerouslySetInnerHTML={{
                  __html: content || "<p class='opacity-50'>Content goes here...</p>",
                }}
              />
            ) : (
              <div className="p-4 bg-blue-50/10 text-blue-800 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-medium">External Link Post</p>
                <p className="text-sm mt-1">
                  This post will redirect users to: {externalUrl || "Enter a URL"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
