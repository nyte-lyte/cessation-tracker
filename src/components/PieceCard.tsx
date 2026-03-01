"use client";

import Link from "next/link";
import type { PieceMeta } from "@/lib/pieceUtils";

export default function PieceCard({ piece }: { piece: PieceMeta }) {
  const year = piece.date.slice(0, 4);

  return (
    <Link href={`/piece/${piece.id}`} style={{ display: "block" }}>
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "2px",
          overflow: "hidden",
          transition: "border-color 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = piece.hex)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--border)")
        }
      >
        {/* Color swatch */}
        <div
          style={{
            height: "4px",
            background: piece.hex,
          }}
        />

        {/* Thumbnail placeholder — replaced by canvas in piece page */}
        <div
          style={{
            aspectRatio: "1 / 1",
            background: `radial-gradient(ellipse at 40% 55%, ${piece.hex}28 0%, #0a0a0a 70%)`,
            display: "flex",
            alignItems: "flex-end",
            padding: "10px 12px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.08em",
            }}
          >
            {year}
          </span>
        </div>

        {/* Metadata row */}
        <div
          style={{
            padding: "10px 12px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span style={{ color: "var(--foreground)" }}>
            {String(piece.id).padStart(2, "0")}
          </span>
          <span style={{ color: "var(--muted)", fontSize: "11px" }}>
            hi {piece.healthIndex.toFixed(2)}
          </span>
          <span style={{ fontSize: "11px" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--muted)",
                marginRight: "4px",
                verticalAlign: "middle",
              }}
            />
            <span style={{ color: "var(--muted)" }}>unminted</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
