'use client';

import { useState } from "react";

function Dot({ hex1, hex2 }: { hex1: string; hex2: string }) {
  return (
    <span style={{
      display: "inline-block",
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: `linear-gradient(90deg, ${hex1}, ${hex2})`,
      marginRight: 8,
      verticalAlign: "middle",
      flexShrink: 0,
    }} />
  );
}

export function PieceLink({ id, date, hex1, hex2, label }: { id: number; date: string; hex1: string; hex2: string; label?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={`/piece/${id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
    >
      <Dot hex1={hex1} hex2={hex2} />
      <span
        style={hovered ? {
          background: `linear-gradient(90deg, ${hex1}, ${hex2})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        } : { color: "var(--muted)" }}
      >
        {label ?? date}
      </span>
    </a>
  );
}
