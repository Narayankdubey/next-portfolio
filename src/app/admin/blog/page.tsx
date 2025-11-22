"use client";
import { useEffect, useState } from "react";
import styles from "./AdminBlogPage.module.css";
import BlogForm from "@/components/BlogForm";
import ToggleSwitch from "@/components/ToggleSwitch";

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

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState<BlogPostAdmin | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/blog");
      const json = await res.json();
      if (json.success) {
        setPosts(json.data);
      } else {
        console.error("Failed to load blog posts", json.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchPosts();
      } else {
        alert("Delete failed: " + json.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    console.log(
      "Toggle called for ID:",
      id,
      "Current:",
      currentVisibility,
      "New:",
      !currentVisibility
    );
    try {
      const payload = { isVisible: !currentVisibility };
      console.log("Sending payload:", payload);

      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log("Response:", json);

      if (json.success) {
        console.log("Toggle successful, refreshing...");
        fetchPosts();
      } else {
        console.error("Toggle failed:", json.error);
        alert("Toggle failed: " + json.error);
      }
    } catch (e) {
      console.error("Toggle error:", e);
      alert("Toggle failed");
    }
  };

  const openCreate = () => {
    setEditPost(null);
    setShowForm(true);
  };

  const openEdit = (post: BlogPostAdmin) => {
    setEditPost(post);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    fetchPosts();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Blog Management</h1>
      <button className={styles.addButton} onClick={openCreate}>
        Add New Post
      </button>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Visibility</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.type}</td>
              <td>
                <div className={styles.visibilityCell}>
                  <ToggleSwitch
                    checked={p.isVisible}
                    onChange={() => handleToggleVisibility(p.id, p.isVisible)}
                  />
                  <span className={p.isVisible ? styles.visibleText : styles.hiddenText}>
                    {p.isVisible ? "Public" : "Hidden"}
                  </span>
                </div>
              </td>
              <td>
                <button onClick={() => openEdit(p)} className={styles.editBtn}>
                  Edit
                </button>
                <button onClick={() => handleDelete(p.id)} className={styles.deleteBtn}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <BlogForm onClose={closeForm} existingPost={editPost} />}
    </div>
  );
}
