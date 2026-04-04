import { getPieceMeta, getAllPieceMeta } from "@/lib/pieceUtils";
import { notFound } from "next/navigation";
import PieceViewer from "@/components/PieceViewer";
import PieceInteractions from "@/components/PieceInteractions";
import Link from "next/link";
import { readFileSync } from "fs";
import path from "path";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id) || id < 0 || id >= getAllPieceMeta().length) return {};
  const piece = getPieceMeta(id);
  const title = `cessation — piece ${String(id).padStart(2, "0")}`;
  const description = `A generative art project using personal health data to reach digital nirvana.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `/piece/${id}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function generateStaticParams() {
  return getAllPieceMeta().map((p) => ({ id: String(p.id) }));
}

function DataRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ color: "var(--foreground)" }}>{value}</span>
    </div>
  );
}

export default async function PiecePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id) || id < 0 || id >= getAllPieceMeta().length) notFound();

  const piece = getPieceMeta(id);
  const all = getAllPieceMeta();
  const prev = id > 0 ? all[id - 1] : null;
  const next = id < all.length - 1 ? all[id + 1] : null;

  // Read shaders server-side (avoids Turbopack raw-loader config)
  const shadersDir = path.join(process.cwd(), "src", "shaders");
  const vertexSrc = readFileSync(path.join(shadersDir, "vertex.glsl"), "utf8");
  const fragmentSrc = readFileSync(path.join(shadersDir, "fragment.glsl"), "utf8");

  return (
    <>
      <style>{`
        html, body { overflow: hidden; }
        .piece-canvas-wrap:fullscreen {
          padding: 0;
          width: 100vw;
          height: 100vh;
        }
        .piece-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          height: calc(100vh - 49px);
          overflow: hidden;
        }
        .piece-canvas-wrap {
          background: #000;
          padding: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .piece-sidebar {
          border-left: 1px solid var(--border);
          overflow-y: auto;
        }
        @media (max-width: 600px) {
          html, body { overflow: auto; }
          .piece-layout {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
            height: auto;
            min-height: calc(100vh - 49px);
            overflow: visible;
          }
          .piece-canvas-wrap {
            padding: 24px;
            overflow: visible;
          }
          .piece-sidebar {
            border-left: none;
            border-top: 1px solid var(--border);
          }
        }
        @media (orientation: landscape) and (max-height: 600px) {
          html, body { overflow: hidden; }
          .piece-layout {
            grid-template-columns: 1fr 220px;
            grid-template-rows: 1fr;
            height: calc(100vh - 49px);
            min-height: unset;
            overflow: hidden;
          }
          .piece-canvas-wrap {
            padding: 16px;
            overflow: hidden;
          }
          .piece-sidebar {
            border-left: 1px solid var(--border);
            border-top: none;
            overflow-y: auto;
          }
        }
      `}</style>
    <PieceInteractions prevId={prev?.id ?? null} nextId={next?.id ?? null} />
    <div className="piece-layout">
      {/* Canvas */}
      <div className="piece-canvas-wrap">
        <PieceViewer id={id} vertexSrc={vertexSrc} fragmentSrc={fragmentSrc} />
      </div>

      {/* Sidebar */}
      <div
        className="piece-sidebar"
        style={{
          padding: "24px 20px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Prev / Next */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {prev ? (
            <Link
              href={`/piece/${prev.id}`}
              style={{ color: "var(--muted)", fontSize: "11px" }}
            >
              ← {String(prev.id).padStart(2, "0")}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/piece/${next.id}`}
              style={{ color: "var(--muted)", fontSize: "11px" }}
            >
              {String(next.id).padStart(2, "0")} →
            </Link>
          ) : (
            <span />
          )}
        </div>

        {/* Piece header */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${piece.hex1} 50%, ${piece.hex2} 50%)`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                color: "var(--muted)",
              }}
            >
              PIECE {String(id).padStart(2, "0")}
            </span>
          </div>
          <p
            style={{ color: "var(--foreground)", margin: "0 0 16px", fontSize: "13px" }}
          >
            {piece.date}
          </p>

          {/* Health index bar */}
          <p
            style={{
              margin: "0 0 6px",
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--muted)",
            }}
          >
            HEALTH INDEX
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                flex: 1,
                height: "3px",
                background: "var(--border)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(piece.healthIndex * 100).toFixed(1)}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${piece.hex1}, ${piece.hex2})`,
                  borderRadius: "2px",
                }}
              />
            </div>
            <span style={{ fontSize: "11px", color: "var(--muted)", flexShrink: 0 }}>
              {piece.healthIndex.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Mint status — compact */}
        <DataRow label="MINT STATUS" value="not yet minted" />

        {/* ECG */}
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--muted)",
            }}
          >
            ECG
          </p>
          <DataRow label="vent rate" value={`${piece.ecg.ventRate} bpm`} />
          <DataRow label="PR interval" value={`${piece.ecg.prInterval} ms`} />
          <DataRow label="QRS interval" value={`${piece.ecg.qrsInterval} ms`} />
          <DataRow label="QT interval" value={`${piece.ecg.qtInterval} ms`} />
          <DataRow label="QTc interval" value={`${piece.ecg.qtcInterval} ms`} />
          <DataRow label="P axis" value={`${piece.ecg.pAxis}°`} />
          <DataRow label="R axis" value={`${piece.ecg.rAxis}°`} />
          <DataRow label="T axis" value={`${piece.ecg.tAxis}°`} />
        </div>

        {/* Labs */}
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--muted)",
            }}
          >
            METABOLIC PANEL
          </p>
          <DataRow label="glucose" value={`${piece.labs.glucose} mg/dL`} />
          <DataRow label="BUN" value={`${piece.labs.nitrogen} mg/dL`} />
          <DataRow label="creatinine" value={`${piece.labs.creatinine} mg/dL`} />
          <DataRow label="eGFR" value={piece.labs.eGFR} />
          <DataRow label="sodium" value={`${piece.labs.sodium} mEq/L`} />
          <DataRow label="potassium" value={`${piece.labs.potassium} mEq/L`} />
          <DataRow label="chloride" value={`${piece.labs.chloride} mEq/L`} />
          <DataRow label="CO₂" value={`${piece.labs.carbonDioxide} mEq/L`} />
          <DataRow label="calcium" value={`${piece.labs.calcium} mg/dL`} />
        </div>

        {/* Lifecycle */}
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--muted)",
            }}
          >
            LIFECYCLE
          </p>
          <DataRow label="lifespan" value="—" />
        </div>

      </div>
    </div>
    </>
  );
}
