"use client";

import Link from "next/link";
import type { PieceMeta } from "@/lib/pieceUtils";

export default function PieceCard({ piece }: { piece: PieceMeta }) {
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
          (e.currentTarget.style.borderColor = piece.hex1)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--border)")
        }
      >
        {/* Thumbnail */}
        <div
          style={{
            aspectRatio: "1 / 1",
            background: `linear-gradient(90deg, ${piece.hex1}, ${piece.hex2})`,
          }}
        />

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
