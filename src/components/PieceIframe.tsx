"use client";

import { useState, useEffect } from "react";

const MIN_LOADING_MS = 15000;

export default function PieceIframe({ src, title }: { src: string; title: string }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_LOADING_MS);
    return () => clearTimeout(t);
  }, []);

  const showContent = iframeLoaded && minElapsed;

  return (
    <div style={{ position: "relative", aspectRatio: "3 / 2", maxWidth: "100%", maxHeight: "100%" }}>
      {!showContent && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--foreground)", fontSize: "13px", letterSpacing: "0.12em",
        }}>
          fetching from blockchain
        </div>
      )}
      <iframe
        src={src}
        title={title}
        onLoad={() => setIframeLoaded(true)}
        allow="fullscreen"
        style={{
          display: "block", width: "100%", height: "100%", border: "none",
          opacity: showContent ? 1 : 0, transition: "opacity 0.6s ease",
        }}
      />
    </div>
  );
}
