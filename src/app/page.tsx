import { getAllPieceMeta } from "@/lib/pieceUtils";
import PieceCard from "@/components/PieceCard";

export default function Home() {
  const pieces = getAllPieceMeta();

  return (
    <div style={{ padding: "32px 24px", maxWidth: "560px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <p style={{ color: "var(--muted)", margin: 0 }}>
          A generative art project using personal health data to reach digital nirvana.
        </p>
      </div>

      {/* Pairs grid — two columns so each row is a partner pair */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
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
