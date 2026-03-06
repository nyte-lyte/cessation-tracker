import { getPieceMeta, getAllPieceMeta } from "@/lib/pieceUtils";
import { notFound } from "next/navigation";
import PieceViewer from "@/components/PieceViewer";
import Link from "next/link";
import { readFileSync } from "fs";
import path from "path";

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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        height: "calc(100vh - 49px)",
      }}
    >
      {/* Canvas */}
      <div style={{ background: "#000", padding: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PieceViewer id={id} vertexSrc={vertexSrc} fragmentSrc={fragmentSrc} />
      </div>

      {/* Sidebar */}
      <div
        style={{
          borderLeft: "1px solid var(--border)",
          padding: "24px 20px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
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
                background: piece.hex,
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
            style={{ color: "var(--foreground)", margin: "0 0 4px", fontSize: "13px" }}
          >
            {piece.date}
          </p>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: "11px" }}>
            health index {piece.healthIndex.toFixed(3)}
          </p>
        </div>

        {/* Mint status */}
        <div
          style={{
            padding: "12px",
            border: "1px solid var(--border)",
            borderRadius: "2px",
          }}
        >
          <p
            style={{
              margin: "0 0 4px",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.08em",
            }}
          >
            MINT STATUS
          </p>
          <p style={{ margin: 0, color: "var(--muted)" }}>not yet minted</p>
        </div>

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

        {/* Decay */}
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
          <DataRow label="decay rate" value={piece.decayRate.toExponential(3)} />
        </div>

        {/* Prev / Next */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: "16px",
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
      </div>
    </div>
  );
}
