import { getAllPieceMeta, healthDataSets } from "@/lib/pieceUtils";
import { minMaxValues } from "@/data/health_data_sets";
import { computeKarma, blendDatasets, computeLiberationThreshold } from "@/data/decay_logic";

function Row({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "6px 0",
      borderBottom: "1px solid var(--border)",
    }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ color: accent ? "var(--foreground)" : "var(--muted)" }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "48px" }}>
      <p style={{ fontSize: "11px", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: "16px", marginTop: 0 }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Dot({ hex }: { hex: string }) {
  return (
    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: hex, marginRight: 8, verticalAlign: "middle" }} />
  );
}

export default function AnalyticsPage() {
  const pieces = getAllPieceMeta();
  const ds = healthDataSets;
  const threshold = computeLiberationThreshold(ds, minMaxValues);

  // Karma per piece
  const karmas = ds.map((d) => computeKarma(d, minMaxValues));

  // Pairs: (0,1), (2,3), ...
  const pairs: { a: number; b: number | null; karma: number | null; belowThreshold: boolean }[] = [];
  for (let i = 0; i + 1 < ds.length; i += 2) {
    const blended = blendDatasets(ds[i], ds[i + 1]);
    const k = computeKarma(blended, minMaxValues);
    pairs.push({ a: i, b: i + 1, karma: k, belowThreshold: k < threshold });
  }

  // Odd final piece — awaiting partner
  const hasSolo = ds.length % 2 !== 0;
  if (hasSolo) {
    pairs.push({ a: ds.length - 1, b: null, karma: null, belowThreshold: false });
  }

  // Health trend — key markers over time
  const trendFields: { key: string; label: string; getter: (d: typeof ds[0]) => number }[] = [
    { key: "eGFR",       label: "eGFR",    getter: (d) => d.labs.eGFR },
    { key: "creatinine", label: "creat",   getter: (d) => d.labs.creatinine },
    { key: "glucose",    label: "glucose", getter: (d) => d.labs.glucose },
    { key: "qtc",        label: "QTc",     getter: (d) => d.ecg.qtcInterval },
  ];

  return (
    <div style={{ padding: "48px 24px", maxWidth: "860px", margin: "0 auto", fontSize: "13px" }}>

      {/* Collection overview */}
      <Section title="COLLECTION">
        <Row label="pieces"            value={ds.length} accent />
        <Row label="pairs"             value={pairs.filter((p) => p.b !== null).length + (hasSolo ? " (+ 1 awaiting partner)" : "")} />
        <Row label="liberation threshold (karma — current snapshot)" value={threshold.toFixed(4)} accent />
        <Row label="pairs below threshold" value={pairs.filter((p) => p.belowThreshold).length} />
        <Row label="health index range"
          value={`${Math.min(...pieces.map((p) => p.healthIndex)).toFixed(3)} – ${Math.max(...pieces.map((p) => p.healthIndex)).toFixed(3)}`}
        />
        <Row label="decay rate range"
          value={`${Math.min(...pieces.map((p) => p.decayRate)).toExponential(2)} – ${Math.max(...pieces.map((p) => p.decayRate)).toExponential(2)}`}
        />
      </Section>

      {/* Pair karma */}
      <Section title="PAIR KARMA">
        <div style={{ color: "var(--muted)", fontSize: "11px", marginBottom: "12px", fontStyle: "italic" }}>
          Karma computed from current datasets. Threshold shifts as collection grows — liberation status unknown until cessation.
        </div>

        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "60px 1fr 1fr 80px 120px",
          gap: "0 12px",
          padding: "6px 0",
          borderBottom: "1px solid var(--border)",
          color: "var(--muted)",
          fontSize: "11px",
          letterSpacing: "0.06em",
        }}>
          <span>PAIR</span>
          <span>PIECE A</span>
          <span>PIECE B</span>
          <span style={{ textAlign: "right" }}>KARMA</span>
          <span style={{ textAlign: "right" }}>VS THRESHOLD</span>
        </div>

        {pairs.map((pair, idx) => (
          <div key={pair.a} style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 1fr 80px 120px",
            gap: "0 12px",
            padding: "6px 0",
            borderBottom: "1px solid var(--border)",
          }}>
            <span style={{ color: "var(--muted)" }}>{String(idx).padStart(2, "0")}</span>

            {/* Piece A */}
            <span style={{ color: "var(--muted)" }}>
              <Dot hex={pieces[pair.a]?.hex} />
              {String(pair.a).padStart(2, "0")} · {pieces[pair.a]?.date}
            </span>

            {/* Piece B — or awaiting partner */}
            {pair.b !== null ? (
              <span style={{ color: "var(--muted)" }}>
                <Dot hex={pieces[pair.b]?.hex} />
                {String(pair.b).padStart(2, "0")} · {pieces[pair.b]?.date}
              </span>
            ) : (
              <span style={{ color: "var(--muted)", fontStyle: "italic" }}>awaiting partner</span>
            )}

            {/* Karma */}
            <span style={{ textAlign: "right", color: "var(--muted)" }}>
              {pair.karma !== null ? pair.karma.toFixed(3) : "—"}
            </span>

            {/* Status */}
            <span style={{
              textAlign: "right",
              color: pair.karma !== null
                ? (pair.belowThreshold ? "var(--foreground)" : "var(--muted)")
                : "var(--muted)",
            }}>
              {pair.karma !== null
                ? (pair.belowThreshold ? "below threshold" : "above threshold")
                : "—"}
            </span>
          </div>
        ))}
      </Section>

      {/* Health trends */}
      <Section title="HEALTH TRENDS">
        <div style={{ color: "var(--muted)", fontSize: "11px", marginBottom: "12px", fontStyle: "italic" }}>
          Glucose reflects fasting state at time of draw — variation is not purely disease-driven.
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "110px repeat(4, 1fr)",
          gap: "0 8px",
          padding: "6px 0",
          borderBottom: "1px solid var(--border)",
          color: "var(--muted)",
          fontSize: "11px",
          letterSpacing: "0.06em",
        }}>
          <span>DATE</span>
          {trendFields.map((f) => (
            <span key={f.key} style={{ textAlign: "right" }}>{f.label.toUpperCase()}</span>
          ))}
        </div>

        {ds.map((d, i) => (
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "110px repeat(4, 1fr)",
            gap: "0 8px",
            padding: "6px 0",
            borderBottom: "1px solid var(--border)",
          }}>
            <span style={{ color: "var(--muted)" }}>{d.date}</span>
            {trendFields.map((f) => (
              <span key={f.key} style={{ textAlign: "right", color: "var(--muted)" }}>
                {f.getter(d)}
              </span>
            ))}
          </div>
        ))}
      </Section>

      {/* Karma ranking */}
      <Section title="KARMA RANKING (individual pieces, ascending)">
        <div style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 80px 100px",
          gap: "0 12px",
          padding: "6px 0",
          borderBottom: "1px solid var(--border)",
          color: "var(--muted)",
          fontSize: "11px",
          letterSpacing: "0.06em",
        }}>
          <span>#</span>
          <span>PIECE</span>
          <span style={{ textAlign: "right" }}>KARMA</span>
          <span style={{ textAlign: "right" }}>VS THRESHOLD</span>
        </div>

        {karmas
          .map((k, i) => ({ k, i }))
          .sort((a, b) => a.k - b.k)
          .map(({ k, i }) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 80px 100px",
              gap: "0 12px",
              padding: "6px 0",
              borderBottom: "1px solid var(--border)",
            }}>
              <span style={{ color: "var(--muted)" }}>{String(i).padStart(2, "0")}</span>
              <span style={{ color: "var(--muted)" }}>
                <Dot hex={pieces[i]?.hex} />
                {pieces[i]?.date}
              </span>
              <span style={{ textAlign: "right", color: k < threshold ? "var(--foreground)" : "var(--muted)" }}>
                {k.toFixed(3)}
              </span>
              <span style={{ textAlign: "right", color: "var(--muted)" }}>
                {k < threshold ? `−${(threshold - k).toFixed(3)}` : `+${(k - threshold).toFixed(3)}`}
              </span>
            </div>
          ))}
      </Section>

    </div>
  );
}
