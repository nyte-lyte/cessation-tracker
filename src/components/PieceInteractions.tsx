"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PieceInteractionsProps {
  prevId: number | null;
  nextId: number | null;
}

export default function PieceInteractions({ prevId, nextId }: PieceInteractionsProps) {
  const router = useRouter();

  // Arrow key navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && prevId !== null) router.push(`/piece/${prevId}`);
      if (e.key === "ArrowRight" && nextId !== null) router.push(`/piece/${nextId}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevId, nextId, router]);

  // Fullscreen toggle
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  return (
    <button
      onClick={toggleFullscreen}
      title="Fullscreen"
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        background: "none",
        border: "1px solid var(--border)",
        color: "var(--muted)",
        fontSize: "11px",
        letterSpacing: "0.08em",
        padding: "6px 10px",
        cursor: "pointer",
        zIndex: 100,
      }}
    >
      FULLSCREEN
    </button>
  );
}
