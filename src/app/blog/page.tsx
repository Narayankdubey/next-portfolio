"use client";
import { useEffect, useState, useMemo } from "react";
import BlogCard from "@/components/BlogCard";
import EmptyBlogState from "@/components/EmptyBlogState";
import { BlogCardSkeleton } from "@/components/SkeletonLoader";
import Navbar from "@/components/Navbar";
import { Search, SlidersHorizontal } from "lucide-react";
import styles from "./BlogPage.module.css";

interface BlogSummary {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  type: "internal" | "external";
  externalUrl?: string;
  createdAt?: string;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  slug?: string;
}

type SortOption = "newest" | "oldest" | "a-z" | "z-a";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("/api/blog");
        const json = await res.json();
        if (json.success) {
          setBlogs(json.data);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  // Filter and sort blogs
  const filteredAndSortedBlogs = useMemo(() => {
    let result = [...blogs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) || blog.description.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "a-z":
          return a.title.localeCompare(b.title);
        case "z-a":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [blogs, searchQuery, sortBy]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <h1 className={styles.title}>Blog</h1>
          <div className={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.title}>Blog</h1>

        {/* Search and Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.sortBox}>
            <SlidersHorizontal className={styles.sortIcon} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={styles.sortSelect}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">Title (A-Z)</option>
              <option value="z-a">Title (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className={styles.resultsCount}>
            Found {filteredAndSortedBlogs.length}{" "}
            {filteredAndSortedBlogs.length === 1 ? "blog" : "blogs"}
          </p>
        )}

        {filteredAndSortedBlogs.length === 0 ? (
          searchQuery ? (
            <div className={styles.noResults}>
              <p>No blogs found matching &quot;{searchQuery}&quot;</p>
              <button onClick={() => setSearchQuery("")} className={styles.clearButton}>
                Clear search
              </button>
            </div>
          ) : (
            <EmptyBlogState />
          )
        ) : (
          <div className={styles.grid}>
            {filteredAndSortedBlogs.map((b) => (
              <BlogCard
                key={b.id}
                id={b.id}
                title={b.title}
                description={b.description}
                thumbnailUrl={b.thumbnailUrl}
                type={b.type}
                externalUrl={b.externalUrl}
                createdAt={b.createdAt}
                likeCount={b.likeCount}
                commentCount={b.commentCount}
                viewCount={b.viewCount}
                slug={b.slug}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
