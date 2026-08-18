import { getAllPieceMeta, healthDataSets, fetchLiveCollection } from "@/lib/pieceUtils";
import { minMaxValues as staticMinMaxValues } from "@/data/health_data_sets";
import {
  computeKarma, blendDatasets, computeLiberationThreshold, computeMinMaxValues,
  karmaClearanceRate, remainingKarma,
} from "@/data/decay_logic";
import { ENGINE_INSCRIPTION_ID } from "@/data/inscriptions";
import { PieceLink } from "@/components/PieceLink";

// Karma and the liberation threshold are explicitly designed to shift as the
// collection lives and grows — so this page pulls the live sibling collection
// once a day (ISR) rather than computing purely from the frozen genesis snapshot.
export const revalidate = 86400;

// computeMinMaxValues now comes from decay_logic — a local duplicate lived here and
// had already drifted from the engine's version.
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

      {/* Per-piece gradient defs */}
      <defs>
        {pieces.map((p) => (
          <linearGradient key={p.id} id={`dotgrad-${p.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={p.hex1} />
            <stop offset="100%" stopColor={p.hex2} />
          </linearGradient>
        ))}
      </defs>

      {/* Dots */}
      {pieces.map((p, i) => (
        <circle key={i} cx={px(i).toFixed(1)} cy={py(p.healthIndex).toFixed(1)} r="3.5" fill={`url(#dotgrad-${p.id})`} opacity="0.85" />
      ))}
    </svg>
  );
}

export default async function AnalyticsPage() {
  const pieces = getAllPieceMeta();

  // Karma/threshold genuinely shift as the collection lives and grows — pull
  // each minted piece's current on-chain dataset (drifted + collection-influenced)
  // and recompute minMaxValues from it. Pieces not yet minted keep their genesis
  // baseline. Falls back to the static collection if the chain fetch fails.
  const live = ENGINE_INSCRIPTION_ID ? await fetchLiveCollection(ENGINE_INSCRIPTION_ID) : null;
  const ds = live ? healthDataSets.map((staticDs, i) => (i < live.length ? live[i] : staticDs)) : healthDataSets;
  const minMaxValues = live ? computeMinMaxValues(ds) : staticMinMaxValues;

  const threshold = computeLiberationThreshold(ds, minMaxValues);

  // Karma per piece
  const karmas = ds.map((d) => computeKarma(d, minMaxValues));

  // Pairs: (0,1), (2,3), ...
  // A single blend no longer decides anything. Karma clears across rebirths at each
  // piece's own eGFR, so a pair above the threshold today still reaches liberation —
  // it just takes more lifespans. Reporting "above threshold" as a status read as a
  // verdict of never, which was wrong for 10 of 15 pairs. Report the number of cycles
  // instead, simulated the way the engine does it.
  const CYCLE_CAP = 400;
  const pairs: { a: number; b: number | null; karma: number | null; cycles: number | null }[] = [];
  for (let i = 0; i + 1 < ds.length; i += 2) {
    const k = computeKarma(blendDatasets(ds[i], ds[i + 1], minMaxValues), minMaxValues);
    let cur = ds[i];
    let uncleared = 1;
    let cycles: number | null = null;
    for (let n = 1; n <= CYCLE_CAP; n++) {
      cur = blendDatasets(cur, ds[i + 1], minMaxValues);
      uncleared *= 1 - karmaClearanceRate(cur, minMaxValues);
      if (remainingKarma(cur, uncleared, minMaxValues) < threshold) { cycles = n; break; }
    }
    pairs.push({ a: i, b: i + 1, karma: k, cycles });
  }

  // Odd final piece — awaiting partner
  const hasSolo = ds.length % 2 !== 0;
  if (hasSolo) {
    pairs.push({ a: ds.length - 1, b: null, karma: null, cycles: null });
  }


  return (
    <div style={{ padding: "48px 24px", maxWidth: "860px", margin: "0 auto", fontSize: "13px" }}>

      {/* Collection overview */}
      <Section title="COLLECTION">
        <Row label="pieces"            value={ds.length} accent />
        <Row label="pairs"             value={pairs.filter((p) => p.b !== null).length + (hasSolo ? " (+ 1 awaiting partner)" : "")} />
        <Row label="karma threshold" value={threshold.toFixed(4)} accent />
        <Row label="pairs liberating on first cessation" value={pairs.filter((p) => p.cycles === 1).length} />
        <Row label="median cycles to liberation"
          value={(() => {
            const c = pairs.map((p) => p.cycles).filter((v): v is number => v !== null).sort((a, b) => a - b);
            return c.length ? c[Math.floor(c.length / 2)] : "—";
          })()}
        />
        <Row label="health index range"
          value={`${Math.min(...pieces.map((p) => p.healthIndex)).toFixed(3)} – ${Math.max(...pieces.map((p) => p.healthIndex)).toFixed(3)}`}
        />
      </Section>

      {/* Pair karma */}
      <Section title="PAIR KARMA">
        <div style={{ color: "var(--muted)", fontSize: "11px", marginBottom: "12px", fontStyle: "italic" }}>
          Karma computed from current datasets. Each rebirth clears a share of the burden at the piece&apos;s own kidney filtration rate, so cycles are how many lifespans a pair needs to reach liberation — centuries each. The threshold shifts as the collection grows, so these move too.
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
          <span style={{ textAlign: "right" }}>TO LIBERATION</span>
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
            <PieceLink id={pair.a} date={pieces[pair.a].date} hex1={pieces[pair.a].hex1} hex2={pieces[pair.a].hex2} label={`${String(pair.a).padStart(2, "0")} · ${pieces[pair.a].date}`} />

            {/* Piece B — or awaiting partner */}
            {pair.b !== null ? (
              <PieceLink id={pair.b} date={pieces[pair.b].date} hex1={pieces[pair.b].hex1} hex2={pieces[pair.b].hex2} label={`${String(pair.b).padStart(2, "0")} · ${pieces[pair.b].date}`} />
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
              color: pair.cycles !== null ? "var(--foreground)" : "var(--muted)",
            }}>
              {pair.karma === null
                ? "—"
                : pair.cycles === null
                  ? "beyond reach"
                  : pair.cycles === 1
                    ? "1 cycle"
                    : `${pair.cycles} cycles`}
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
          <span style={{ textAlign: "right" }}>TO LIBERATION</span>
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
              <PieceLink id={i} date={pieces[i].date} hex1={pieces[i].hex1} hex2={pieces[i].hex2} />
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
