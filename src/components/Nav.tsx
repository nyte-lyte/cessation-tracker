import Link from "next/link";

export default function Nav() {
  return (
    <nav
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <Link href="/" style={{ letterSpacing: "0.12em", fontSize: "12px", color: "var(--muted)" }}>
          CESSATION
        </Link>
        <Link href="/about" style={{ letterSpacing: "0.12em", fontSize: "12px", color: "var(--muted)" }}>
          ABOUT
        </Link>
        <Link href="/analytics" style={{ letterSpacing: "0.12em", fontSize: "12px", color: "var(--muted)" }}>
          ANALYTICS
        </Link>
      </div>
      <span style={{ color: "var(--muted)", fontSize: "11px" }}>
        Bitcoin / Ordinals
      </span>
    </nav>
  );
}
