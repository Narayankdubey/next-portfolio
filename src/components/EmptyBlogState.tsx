import Link from "next/link";
import styles from "./EmptyBlogState.module.css";

export default function EmptyBlogState() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
        <h2 className={styles.title}>No blog posts yet</h2>
        <p className={styles.description}>
          Check back soon! We&apos;ll be posting interesting content and updates here.
        </p>
        <Link href="/" className={styles.homeLink}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
