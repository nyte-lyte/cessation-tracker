'use client';

import { useState } from "react";

function Dot({ hex }: { hex: string }) {
  return (
    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: hex, marginRight: 8, verticalAlign: "middle" }} />
  );
}

export function PieceLink({ id, date, hex, label }: { id: number; date: string; hex: string; label?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={`/piece/${id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: hovered ? hex : "var(--muted)",
        textDecoration: "none",
        transition: "color 0.15s ease",
      }}
    >
      <Dot hex={hex} />
      {label ?? date}
    </a>
  );
}
