"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Calendar, Clock, User, Heart, MessageCircle, Send } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import styles from "../BlogDetail.module.css";

interface BlogDetail {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const portfolio = usePortfolio();
  const id = params?.id as string;
  const [post, setPost] = useState<BlogDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchBlogData();
    // Check if user has already liked this post
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    setHasLiked(likedPosts.includes(id));
  }, [id]);

  const fetchBlogData = async () => {
    try {
      // Fetch blog post
      const postRes = await fetch(`/api/blog/${id}`);
      const postJson = await postRes.json();
      if (postJson.success) {
        setPost(postJson.data);
      }

      // Fetch comments
      const commentsRes = await fetch(`/api/blog/${id}/comments`);
      const commentsJson = await commentsRes.json();
      if (commentsJson.success) {
        setComments(commentsJson.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!id || hasLiked) return;

    try {
      const res = await fetch(`/api/blog/${id}/like`, { method: "POST" });
      const json = await res.json();
      if (json.success && post) {
        setPost({ ...post, likeCount: json.data.likeCount });
        setHasLiked(true);

        // Store in localStorage
        const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
        likedPosts.push(id);
        localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    setSubmitMessage("");

    try {
      const res = await fetch(`/api/blog/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });
      const json = await res.json();

      if (json.success) {
        setCommentText("");
        setSubmitMessage(json.message || "Comment submitted successfully!");
        setTimeout(() => setSubmitMessage(""), 5000);
      } else {
        setSubmitMessage("Failed to submit comment");
      }
    } catch (error) {
      console.error("Comment submit error:", error);
      setSubmitMessage("Failed to submit comment");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <p>Blog not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <article className={styles.container}>
        <Link href="/blog" className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
          Back to Blog
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>{post.title}</h1>

          {/* Creator Info */}
          {portfolio && (
            <div className={styles.creator}>
              <div className={styles.avatar}>
                <User className={styles.avatarIcon} />
              </div>
              <div className={styles.creatorInfo}>
                <p className={styles.creatorName}>{portfolio.personal.name}</p>
                <p className={styles.creatorTitle}>{portfolio.personal.title}</p>
              </div>
            </div>
          )}

          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <Calendar className={styles.metaIcon} />
              {formatDate(post.createdAt)}
            </span>
            <span className={styles.metaItem}>
              <Clock className={styles.metaIcon} />
              {formatTime(post.createdAt)}
            </span>
          </div>
        </header>

        <div className={styles.content} dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Engagement Section */}
        <div className={styles.engagementSection}>
          <button
            onClick={handleLike}
            className={`${styles.likeButton} ${hasLiked ? styles.liked : ""}`}
            disabled={hasLiked}
          >
            <Heart className={styles.likeIcon} />
            <span>
              {hasLiked ? "Liked" : "Like"} ({post.likeCount})
            </span>
          </button>
          <div className={styles.commentCount}>
            <MessageCircle className={styles.commentIcon} />
            <span>
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </span>
          </div>
        </div>

        {/* Comment Form */}
        <div className={styles.commentForm}>
          <h3 className={styles.commentFormTitle}>Leave a Comment</h3>
          <p className={styles.commentFormDesc}>
            Your comment will be visible after admin approval
          </p>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              className={styles.commentInput}
              placeholder="Write your comment... (max 1000 characters)"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={1000}
              rows={4}
              disabled={submitting}
            />
            <div className={styles.commentFormActions}>
              <span className={styles.charCount}>{commentText.length}/1000</span>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!commentText.trim() || submitting}
              >
                <Send className={styles.sendIcon} />
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
          {submitMessage && <p className={styles.submitMessage}>{submitMessage}</p>}
        </div>

        {/* Comments List */}
        {comments.length > 0 && (
          <div className={styles.commentsList}>
            <h3 className={styles.commentsTitle}>Comments ({comments.length})</h3>
            {comments.map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentAvatar}>
                    <User className={styles.commentAvatarIcon} />
                  </div>
                  <div>
                    <p className={styles.commentAuthor}>Anonymous</p>
                    <p className={styles.commentDate}>{formatCommentDate(comment.createdAt)}</p>
                  </div>
                </div>
                <p className={styles.commentContent}>{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </article>
    </>
  );
}
