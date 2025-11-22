"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import styles from "./BlogWidget.module.css";

interface BlogSummary {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  type: "internal" | "external";
  externalUrl?: string;
  createdAt?: string;
}

export default function BlogWidget() {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("/api/blog");
        const json = await res.json();
        if (json.success) {
          // Get only the latest 3 blogs
          setBlogs(json.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className={styles.widget} data-tour="blog-widget">
        <div className={styles.loading}>Loading blogs...</div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <section className={styles.widget} data-tour="blog-widget">
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <BookOpen className={styles.titleIcon} />
          <h2 className={styles.title}>Latest Blog Posts</h2>
        </div>
        <p className={styles.subtitle}>Thoughts, tutorials, and insights</p>
      </div>

      <div className={styles.grid}>
        {blogs.map((blog) => {
          const isExternal = blog.type === "external" && blog.externalUrl;
          const linkProps = isExternal
            ? { href: blog.externalUrl!, target: "_blank", rel: "noopener noreferrer" }
            : { href: `/blog/${blog.id}` };

          return (
            <Link key={blog.id} {...linkProps} className={styles.card}>
              <div className={styles.thumbnail}>
                {blog.thumbnailUrl ? (
                  <Image
                    src={blog.thumbnailUrl}
                    alt={blog.title}
                    fill
                    className={styles.thumbnailImage}
                  />
                ) : (
                  <div className={styles.placeholder}>
                    <BookOpen className={styles.placeholderIcon} />
                  </div>
                )}
              </div>
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{blog.title}</h3>
                <p className={styles.description}>{blog.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <Link href="/blog" className={styles.seeMore}>
        <span>See All Posts</span>
        <ArrowRight className={styles.arrowIcon} />
      </Link>
    </section>
  );
}
