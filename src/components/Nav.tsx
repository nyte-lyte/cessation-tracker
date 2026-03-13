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
      <Link href="/" style={{ letterSpacing: "0.12em", fontSize: "12px", color: "var(--muted)" }}>
        CESSATION
      </Link>
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <Link href="/about" style={{ letterSpacing: "0.12em", fontSize: "11px", color: "var(--muted)" }}>
          ABOUT
        </Link>
        <span style={{ color: "var(--muted)", fontSize: "11px" }}>
          Bitcoin / Ordinals
        </span>
      </div>
    </nav>
  );
}
