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

export default function AnalyticsPage() {
  const pieces = getAllPieceMeta();
  const ds = healthDataSets;
  const threshold = computeLiberationThreshold(ds, minMaxValues);

  // Karma per piece
  const karmas = ds.map((d) => computeKarma(d, minMaxValues));

  // Pairs: (0,1), (2,3), ...
  const pairs: { a: number; b: number; karma: number; liberates: boolean }[] = [];
  for (let i = 0; i + 1 < ds.length; i += 2) {
    const blended = blendDatasets(ds[i], ds[i + 1]);
    const k = computeKarma(blended, minMaxValues);
    pairs.push({ a: i, b: i + 1, karma: k, liberates: k < threshold });
  }

  // If odd final piece
  const hasSolo = ds.length % 2 !== 0;

  // Health trend — key markers over time
  const trendFields: { key: string; label: string; unit: string; getter: (d: typeof ds[0]) => number }[] = [
    { key: "eGFR",       label: "eGFR",       unit: "",       getter: (d) => d.labs.eGFR },
    { key: "creatinine", label: "creat",      unit: "",       getter: (d) => d.labs.creatinine },
    { key: "glucose",    label: "glucose",    unit: "",       getter: (d) => d.labs.glucose },
    { key: "qtc",        label: "QTc",        unit: "",       getter: (d) => d.ecg.qtcInterval },
  ];

  return (
    <div style={{ padding: "48px 24px", maxWidth: "860px", margin: "0 auto", fontSize: "13px" }}>

      {/* Collection overview */}
      <Section title="COLLECTION">
        <Row label="pieces"            value={ds.length} accent />
        <Row label="pairs"             value={pairs.length + (hasSolo ? " + 1 solo" : "")} />
        <Row label="liberation threshold (karma)" value={threshold.toFixed(4)} accent />
        <Row label="pairs that liberate cycle 1"  value={pairs.filter((p) => p.liberates).length} />
        <Row label="health index range"
          value={`${Math.min(...pieces.map((p) => p.healthIndex)).toFixed(3)} – ${Math.max(...pieces.map((p) => p.healthIndex)).toFixed(3)}`}
        />
        <Row label="decay rate range"
          value={`${Math.min(...pieces.map((p) => p.decayRate)).toExponential(2)} – ${Math.max(...pieces.map((p) => p.decayRate)).toExponential(2)}`}
        />
      </Section>

      {/* Pair karma */}
      <Section title="PAIR KARMA">
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "60px 1fr 1fr 80px 80px",
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
          <span style={{ textAlign: "right" }}>STATUS</span>
        </div>

        {pairs.map((pair) => (
          <div key={pair.a} style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 1fr 80px 80px",
            gap: "0 12px",
            padding: "6px 0",
            borderBottom: "1px solid var(--border)",
          }}>
            <span style={{ color: "var(--muted)" }}>{String(pair.a / 2).padStart(2, "0")}</span>
            <span style={{ color: "var(--muted)" }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: pieces[pair.a]?.hex, marginRight: 8, verticalAlign: "middle" }} />
              {String(pair.a).padStart(2, "0")} · {pieces[pair.a]?.date}
            </span>
            <span style={{ color: "var(--muted)" }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: pieces[pair.b]?.hex, marginRight: 8, verticalAlign: "middle" }} />
              {String(pair.b).padStart(2, "0")} · {pieces[pair.b]?.date}
            </span>
            <span style={{ textAlign: "right", color: "var(--muted)" }}>{pair.karma.toFixed(3)}</span>
            <span style={{
              textAlign: "right",
              color: pair.liberates ? "var(--foreground)" : "var(--muted)",
            }}>
              {pair.liberates ? "liberates" : "cycles"}
            </span>
          </div>
        ))}

        {hasSolo && (
          <div style={{ padding: "6px 0", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
            piece {String(ds.length - 1).padStart(2, "0")} — eternal vigil (immediate liberation)
          </div>
        )}
      </Section>

      {/* Health trends */}
      <Section title="HEALTH TRENDS">
        {/* Header */}
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
      <Section title="KARMA RANKING (individual pieces)">
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 80px 80px",
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
          <span style={{ textAlign: "right" }}>vs THRESHOLD</span>
        </div>

        {karmas
          .map((k, i) => ({ k, i }))
          .sort((a, b) => a.k - b.k)
          .map(({ k, i }) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 80px 80px",
              gap: "0 12px",
              padding: "6px 0",
              borderBottom: "1px solid var(--border)",
            }}>
              <span style={{ color: "var(--muted)" }}>{String(i).padStart(2, "0")}</span>
              <span style={{ color: "var(--muted)" }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: pieces[i]?.hex, marginRight: 8, verticalAlign: "middle" }} />
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
