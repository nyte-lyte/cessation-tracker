"use client";

import { useState } from "react";
import Link from "next/link";
import type { PieceMeta } from "@/lib/pieceUtils";

export default function PieceCard({ piece }: { piece: PieceMeta }) {
  const [hovered, setHovered] = useState(false);
  const gradient = `linear-gradient(90deg, ${piece.hex1}, ${piece.hex2})`;

  return (
    <Link href={`/piece/${piece.id}`} style={{ display: "block" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: "1px",
          borderRadius: "2px",
          background: hovered ? gradient : "var(--border)",
          transition: "background 0.15s",
          cursor: "pointer",
        }}
      >
        <div style={{ borderRadius: "1px", background: "var(--background)", padding: "14px 14px 12px" }}>

          {/* Piece number + date */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px" }}>
            <span style={{ color: "var(--foreground)", fontSize: "13px" }}>
              {String(piece.id).padStart(2, "0")}
            </span>
            <span style={{ color: "var(--muted)", fontSize: "11px" }}>
              {piece.date}
            </span>
          </div>

          {/* Health index bar */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ height: "2px", background: "var(--border)", borderRadius: "1px", overflow: "hidden" }}>
              <div style={{
                width: `${(piece.healthIndex * 100).toFixed(1)}%`,
                height: "100%",
                background: gradient,
                borderRadius: "1px",
              }} />
            </div>
          </div>

          {/* Mint status */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: gradient,
              flexShrink: 0,
            }} />
            <span style={{ color: "var(--muted)", fontSize: "11px" }}>unminted</span>
          </div>

        </div>
      </div>
    </Link>
  );
}
