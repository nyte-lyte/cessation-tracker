"use client";

import { useState } from "react";
import Link from "next/link";
import type { PieceMeta } from "@/lib/pieceUtils";

export default function PieceCard({ piece }: { piece: PieceMeta }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/piece/${piece.id}`} style={{ display: "block" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: "1px",
          borderRadius: "2px",
          background: hovered
            ? `linear-gradient(90deg, ${piece.hex1}, ${piece.hex2})`
            : "var(--border)",
          transition: "background 0.15s",
          cursor: "pointer",
        }}
      >
        {/* Inner card */}
        <div style={{ borderRadius: "1px", overflow: "hidden", background: "var(--background)" }}>
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
      </div>
    </Link>
  );
}
