import { ImageResponse } from "next/og";
import { getPieceMeta, getAllPieceMeta } from "@/lib/pieceUtils";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return getAllPieceMeta().map((p) => ({ id: String(p.id) }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  const piece = getPieceMeta(id);
  const hex = piece.hex;
  const num = String(id).padStart(2, "0");

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "monospace",
        }}
      >
        {/* Top: site name */}
        <div style={{ color: "#444", fontSize: 18, letterSpacing: "0.12em" }}>
          CESSATION
        </div>

        {/* Center: piece color dot + number */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: hex,
            }}
          />
          <div style={{ color: "#e5e5e5", fontSize: 72, letterSpacing: "0.06em" }}>
            {"PIECE " + num}
          </div>
        </div>

        {/* Bottom: date + health index */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ color: "#444", fontSize: 18 }}>{piece.date}</div>
          <div style={{ color: "#444", fontSize: 18 }}>
            {"health index " + piece.healthIndex.toFixed(3)}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
