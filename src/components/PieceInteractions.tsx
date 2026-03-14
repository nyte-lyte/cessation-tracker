"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface PieceInteractionsProps {
  prevId: number | null;
  nextId: number | null;
}

export default function PieceInteractions({ prevId, nextId }: PieceInteractionsProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Arrow key navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft"  && prevId !== null) router.push(`/piece/${prevId}`);
      if (e.key === "ArrowRight" && nextId !== null) router.push(`/piece/${nextId}`);
      if (e.key === "Escape" && isFullscreen) document.exitFullscreen();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevId, nextId, router, isFullscreen]);

  // Track fullscreen state
  useEffect(() => {
    function onChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggleFullscreen() {
    const el = document.querySelector(".piece-canvas-wrap") as HTMLElement;
    if (!document.fullscreenElement && el) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        top: "49px",
        left: 0,
        right: "300px",
        bottom: 0,
        zIndex: 50,
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.7)",
          width: "32px",
          height: "32px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
          pointerEvents: hovered ? "auto" : "none",
          padding: 0,
        }}
      >
        {isFullscreen ? (
          // Compress icon
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 1v4H1M9 1v4h4M5 13v-4H1M9 13v-4h4"/>
          </svg>
        ) : (
          // Expand icon
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9"/>
          </svg>
        )}
      </button>
    </div>
  );
}
