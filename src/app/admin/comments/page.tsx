"use client";
import { useEffect, useState } from "react";
import { MessageCircle, Check, X } from "lucide-react";
import styles from "./AdminComments.module.css";

interface Comment {
  id: string;
  blogId: string;
  blogTitle: string;
  content: string;
  isVisible: boolean;
  createdAt: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/admin/comments");
      const json = await res.json();
      if (json.success) {
        setComments(json.data);
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (commentId: string, isVisible: boolean) => {
    try {
      const res = await fetch("/api/admin/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, isVisible }),
      });
      const json = await res.json();
      if (json.success) {
        setComments(comments.map((c) => (c.id === commentId ? { ...c, isVisible } : c)));
      }
    } catch (error) {
      console.error("Toggle visibility error:", error);
    }
  };

  const filteredComments = comments.filter((c) => {
    if (filter === "pending") return !c.isVisible;
    if (filter === "approved") return c.isVisible;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingCount = comments.filter((c) => !c.isVisible).length;
  const approvedCount = comments.filter((c) => c.isVisible).length;

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <MessageCircle className={styles.titleIcon} />
          Comment Management
        </h1>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total</span>
            <span className={styles.statValue}>{comments.length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pending</span>
            <span className={styles.statValue}>{pendingCount}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Approved</span>
            <span className={styles.statValue}>{approvedCount}</span>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({comments.length})
        </button>
        <button
          className={`${styles.filterButton} ${filter === "pending" ? styles.active : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending ({pendingCount})
        </button>
        <button
          className={`${styles.filterButton} ${filter === "approved" ? styles.active : ""}`}
          onClick={() => setFilter("approved")}
        >
          Approved ({approvedCount})
        </button>
      </div>

      {filteredComments.length === 0 ? (
        <div className={styles.empty}>
          <p>No comments found</p>
        </div>
      ) : (
        <div className={styles.commentsList}>
          {filteredComments.map((comment) => (
            <div key={comment.id} className={styles.commentCard}>
              <div className={styles.commentHeader}>
                <div>
                  <h3 className={styles.blogTitle}>{comment.blogTitle}</h3>
                  <p className={styles.commentDate}>{formatDate(comment.createdAt)}</p>
                </div>
                <div className={styles.status}>
                  {comment.isVisible ? (
                    <span className={styles.approvedBadge}>Approved</span>
                  ) : (
                    <span className={styles.pendingBadge}>Pending</span>
                  )}
                </div>
              </div>

              <p className={styles.commentContent}>{comment.content}</p>

              <div className={styles.actions}>
                {!comment.isVisible ? (
                  <button
                    className={styles.approveButton}
                    onClick={() => handleToggleVisibility(comment.id, true)}
                  >
                    <Check className={styles.actionIcon} />
                    Approve
                  </button>
                ) : (
                  <button
                    className={styles.rejectButton}
                    onClick={() => handleToggleVisibility(comment.id, false)}
                  >
                    <X className={styles.actionIcon} />
                    Hide
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
