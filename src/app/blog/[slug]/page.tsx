"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { BlogDetailSkeleton } from "@/components/SkeletonLoader";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Heart,
  MessageCircle,
  Send,
  Share2,
  Volume2,
  VolumeX,
  Square,
  Languages,
  Copy,
  Check,
} from "lucide-react";
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
  viewCount: number;
  slug: string;
}

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const portfolio = usePortfolio();
  const slug = params?.slug as string;
  const [post, setPost] = useState<BlogDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [hasLiked, setHasLiked] = useState(false);

  // Share, Audio, Translation states
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const [originalContent, setOriginalContent] = useState("");
  const [translating, setTranslating] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchBlogData = async () => {
      try {
        // Fetch blog post
        const postRes = await fetch(`/api/blog/${slug}`);
        const postJson = await postRes.json();
        if (postJson.success) {
          setPost(postJson.data);
          setOriginalContent(postJson.data.content); // Save original content

          // Handle view count increment
          const viewedPosts = JSON.parse(localStorage.getItem("viewedPosts") || "[]");
          if (!viewedPosts.includes(slug)) {
            // Increment view count
            await fetch(`/api/blog/${slug}/view`, { method: "POST" });

            // Update local storage
            viewedPosts.push(slug);
            localStorage.setItem("viewedPosts", JSON.stringify(viewedPosts));

            // Update local state to reflect new view count immediately
            setPost((prev) => (prev ? { ...prev, viewCount: (prev.viewCount || 0) + 1 } : null));
          }
        }

        // Fetch comments
        const commentsRes = await fetch(`/api/blog/${slug}/comments`);
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

    fetchBlogData();
    // Check if user has already liked this post
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    setHasLiked(likedPosts.includes(slug));
  }, [slug]);

  const handleLike = async () => {
    if (!slug || hasLiked) return;

    try {
      const res = await fetch(`/api/blog/${slug}/like`, { method: "POST" });
      const json = await res.json();
      if (json.success && post) {
        setPost({ ...post, likeCount: json.data.likeCount });
        setHasLiked(true);

        // Store in localStorage
        const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
        likedPosts.push(slug);
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
      const userId = localStorage.getItem("chatUserId");
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText,
          userId,
        }),
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

  // Share functionality
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || "Check out this blog post";
    const text = `${title} - ${url}`;

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Text-to-speech functionality
  const handleReadAloud = () => {
    if (!post?.content) return;

    if (isReading && !isPaused) {
      // Pause
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      // Resume
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      // Start reading
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = post.content;
      const textContent = tempDiv.textContent || tempDiv.innerText || "";

      const utterance = new SpeechSynthesisUtterance(textContent);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        setIsReading(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
      setIsPaused(false);
    }
  };

  const handleStopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
  };

  // Translation functionality
  const handleTranslate = async (lang: string) => {
    if (!post || !originalContent) return;

    setSelectedLang(lang);

    // If switching back to English, restore original content
    if (lang === "en") {
      setPost({ ...post, content: originalContent });
      return;
    }

    // Translate to selected language
    setTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalContent,
          targetLang: lang,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPost({ ...post, content: data.translatedText });
      } else {
        alert("Translation failed. Please try again.");
      }
    } catch (error) {
      console.error("Translation error:", error);
      alert("Translation service unavailable. Please try again later.");
    } finally {
      setTranslating(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <BlogDetailSkeleton />
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
            <span className={styles.metaItem}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.metaIcon}
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {post.viewCount || 0} Views
            </span>
          </div>
        </header>

        {/* Action Bar: Share, Audio, Translation */}
        <div className={styles.actionBar}>
          {/* Share Button */}
          <div className={styles.actionGroup}>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className={styles.actionButton}
              title="Share this post"
            >
              <Share2 className={styles.actionIcon} />
              Share
            </button>
            {showShareMenu && (
              <div className={styles.shareMenu}>
                <button onClick={() => handleShare("twitter")} className={styles.shareOption}>
                  <svg className={styles.shareIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </button>
                <button onClick={() => handleShare("linkedin")} className={styles.shareOption}>
                  <svg className={styles.shareIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </button>
                <button onClick={() => handleShare("facebook")} className={styles.shareOption}>
                  <svg className={styles.shareIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
                <button onClick={handleCopyLink} className={styles.shareOption}>
                  {copied ? (
                    <Check className={styles.shareIcon} />
                  ) : (
                    <Copy className={styles.shareIcon} />
                  )}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            )}
          </div>

          {/* Audio Controls */}
          <div className={styles.actionGroup}>
            {!isReading ? (
              <button onClick={handleReadAloud} className={styles.actionButton} title="Read aloud">
                <Volume2 className={styles.actionIcon} />
                Read Aloud
              </button>
            ) : (
              <>
                <button
                  onClick={handleReadAloud}
                  className={styles.actionButton}
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? (
                    <Volume2 className={styles.actionIcon} />
                  ) : (
                    <VolumeX className={styles.actionIcon} />
                  )}
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button onClick={handleStopReading} className={styles.actionButton} title="Stop">
                  <Square className={styles.actionIcon} />
                  Stop
                </button>
              </>
            )}
          </div>

          {/* Translation */}
          <div className={styles.actionGroup}>
            <select
              value={selectedLang}
              onChange={(e) => handleTranslate(e.target.value)}
              className={styles.langSelect}
              title="Translate"
              disabled={translating}
            >
              <option value="en">🌐 English</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
              <option value="hi">🇮🇳 Hindi</option>
              <option value="zh">🇨🇳 Chinese</option>
              <option value="ja">🇯🇵 Japanese</option>
            </select>
            {translating && <span className={styles.translatingText}>Translating...</span>}
          </div>
        </div>

        <div
          ref={contentRef}
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

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
                    <p className={styles.commentAuthor}>{comment.authorName}</p>
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
