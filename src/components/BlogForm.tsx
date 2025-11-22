"use client";
import { useState, useEffect, useRef } from "react";
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

  const insertFormatting = (before: string, after: string = before) => {
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
  };

  const formatButtons = [
    { label: "B", title: "Bold", action: () => insertFormatting("<strong>", "</strong>") },
    { label: "I", title: "Italic", action: () => insertFormatting("<em>", "</em>") },
    { label: "Code", title: "Code", action: () => insertFormatting("<code>", "</code>") },
    { label: "H1", title: "Heading 1", action: () => insertFormatting("<h1>", "</h1>") },
    { label: "H2", title: "Heading 2", action: () => insertFormatting("<h2>", "</h2>") },
    { label: "P", title: "Paragraph", action: () => insertFormatting("<p>", "</p>") },
    { label: "List", title: "List Item", action: () => insertFormatting("<li>", "</li>") },
    { label: "Link", title: "Link", action: () => insertFormatting('<a href="url">', "</a>") },
  ];

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
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{existingPost ? "Edit Blog Post" : "Create New Blog Post"}</h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
            ×
          </button>
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
              required
            />
            <span className={styles.hint}>Use formatting buttons or write HTML directly</span>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              {existingPost ? "Update Post" : "Create Post"}
            </button>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
