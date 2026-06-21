"use client";

import { useState } from "react";

export default function PieceIframe({ src, title }: { src: string; title: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: "relative", aspectRatio: "3 / 2", maxWidth: "100%", maxHeight: "100%" }}>
      {!loaded && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--muted)", fontSize: "11px", letterSpacing: "0.12em",
        }}>
          loading
        </div>
      )}
      <iframe
        src={src}
        title={title}
        onLoad={() => setLoaded(true)}
        allow="fullscreen"
        style={{
          display: "block", width: "100%", height: "100%", border: "none",
          opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease",
        }}
      />
    </div>
  );
}
