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

function HealthIndexChart({ pieces }: { pieces: ReturnType<typeof getAllPieceMeta> }) {
  const W = 800, H = 160;
  const padL = 8, padR = 8, padT = 16, padB = 8;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const n = pieces.length;

  const vals = pieces.map((p) => p.healthIndex);
  const min = Math.min(...vals);
  const max = Math.max(...vals);

  function px(i: number) { return padL + (i / (n - 1)) * plotW; }
  function py(v: number) { return padT + (1 - (max === min ? 0.5 : (v - min) / (max - min))) * plotH; }

  const linePoints = pieces.map((p, i) => `${px(i).toFixed(1)},${py(p.healthIndex).toFixed(1)}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((v) => {
        const y = (padT + (1 - v) * plotH).toFixed(1);
        return <line key={v} x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}

      {/* Line */}
      <polyline points={linePoints} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinejoin="round" />

      {/* Dots — tinted with piece hex */}
      {pieces.map((p, i) => (
        <circle key={i} cx={px(i).toFixed(1)} cy={py(p.healthIndex).toFixed(1)} r="3.5" fill={p.hex} opacity="0.85" />
      ))}
    </svg>
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


  return (
    <div style={{ padding: "48px 24px", maxWidth: "860px", margin: "0 auto", fontSize: "13px" }}>

      {/* Collection overview */}
      <Section title="COLLECTION">
        <Row label="pieces"            value={ds.length} accent />
        <Row label="pairs"             value={pairs.filter((p) => p.b !== null).length + (hasSolo ? " (+ 1 awaiting partner)" : "")} />
        <Row label="karma threshold" value={threshold.toFixed(4)} accent />
        <Row label="pairs below threshold" value={pairs.filter((p) => p.belowThreshold).length} />
        <Row label="health index range"
          value={`${Math.min(...pieces.map((p) => p.healthIndex)).toFixed(3)} – ${Math.max(...pieces.map((p) => p.healthIndex)).toFixed(3)}`}
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
            <a href={`/piece/${pair.a}`} style={{ color: "var(--muted)", textDecoration: "none" }}>
              <Dot hex={pieces[pair.a]?.hex} />
              {String(pair.a).padStart(2, "0")} · {pieces[pair.a]?.date}
            </a>

            {/* Piece B — or awaiting partner */}
            {pair.b !== null ? (
              <a href={`/piece/${pair.b}`} style={{ color: "var(--muted)", textDecoration: "none" }}>
                <Dot hex={pieces[pair.b]?.hex} />
                {String(pair.b).padStart(2, "0")} · {pieces[pair.b]?.date}
              </a>
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
        <HealthIndexChart pieces={pieces} />
      </Section>

      {/* Karma ranking */}
      <Section title="KARMA RANKING">
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
              <a href={`/piece/${i}`} style={{ color: "var(--muted)", textDecoration: "none" }}>
                <Dot hex={pieces[i]?.hex} />
                {pieces[i]?.date}
              </a>
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
