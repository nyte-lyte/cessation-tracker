import { getAllPieceMeta } from "@/lib/pieceUtils";
import PieceCard from "@/components/PieceCard";

export default function Home() {
  const pieces = getAllPieceMeta();

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "13px",
            fontWeight: "normal",
            letterSpacing: "0.12em",
            color: "var(--foreground)",
            margin: "0 0 8px",
          }}
        >
          CESSATION — {pieces.length} PIECES
        </h1>
        <p style={{ color: "var(--muted)", margin: 0, maxWidth: "480px" }}>
          Generative art derived from personal health data, 2018–2025.
          Each piece encodes ECG and metabolic lab readings from a single
          clinical visit. Minting on Bitcoin / Ordinals.
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "12px",
        }}
      >
        {pieces.map((piece) => (
          <PieceCard key={piece.id} piece={piece} />
        ))}
      </div>
    </div>
  );
}
