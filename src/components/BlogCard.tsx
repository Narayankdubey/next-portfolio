import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User, Heart, MessageCircle } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import styles from "./BlogCard.module.css";

interface BlogCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  type: "internal" | "external";
  externalUrl?: string;
  createdAt?: string;
  likeCount?: number;
  commentCount?: number;
}

// Strip HTML tags from text
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export default function BlogCard({
  id,
  title,
  description,
  thumbnailUrl,
  type,
  externalUrl,
  createdAt,
  likeCount = 0,
  commentCount = 0,
}: BlogCardProps) {
  const portfolio = usePortfolio();
  const isExternal = type === "external" && externalUrl;
  const linkProps = isExternal
    ? { href: externalUrl!, target: "_blank", rel: "noopener noreferrer" }
    : { href: `/blog/${id}` };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  return (
    <Link {...linkProps} className={styles.card}>
      <div className={styles.thumbnailWrapper}>
        {thumbnailUrl ? (
          <Image src={thumbnailUrl} alt={title} fill className={styles.thumbnail} />
        ) : (
          <div className={styles.placeholder}>
            <svg
              className={styles.placeholderIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{stripHtml(description)}</p>}

        {/* Creator Info */}
        {portfolio && (
          <div className={styles.creator}>
            <div className={styles.avatar}>
              <User className={styles.avatarIcon} />
            </div>
            <span className={styles.creatorName}>{portfolio.personal.name}</span>
          </div>
        )}

        {createdAt && (
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <Calendar className={styles.metaIcon} />
              {formatDate(createdAt)}
            </span>
            <span className={styles.metaItem}>
              <Clock className={styles.metaIcon} />
              {formatTime(createdAt)}
            </span>
          </div>
        )}

        {/* Engagement Metrics */}
        <div className={styles.engagement}>
          <span className={styles.engagementItem}>
            <Heart className={styles.engagementIcon} />
            {likeCount}
          </span>
          <span className={styles.engagementItem}>
            <MessageCircle className={styles.engagementIcon} />
            {commentCount}
          </span>
        </div>

        {isExternal && <span className={styles.externalBadge}>External Link ↗</span>}
      </div>
    </Link>
  );
}
