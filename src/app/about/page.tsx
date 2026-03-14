export default function AboutPage() {
  return (
    <div
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "64px 24px",
      }}
    >
      <p
        style={{
          fontSize: "13px",
          lineHeight: "2",
          color: "var(--muted)",
          marginBottom: "32px",
        }}
      >
        Cessation is a generative art project built from a custom health index.
        Each piece in the collection is bound to a partner piece through the
        power of recursive design. Carrying an inheritance of hue over multiple
        lifespans, this collection is in a constant state of change.
      </p>
      <p
        style={{
          fontSize: "13px",
          lineHeight: "2",
          color: "var(--muted)",
          marginBottom: "32px",
        }}
      >
        Built upon the belief that one returns multiple times in order to move
        toward something greater inside all of us.
      </p>
      <p
        style={{
          fontSize: "13px",
          lineHeight: "2",
          color: "var(--muted)",
          marginBottom: "64px",
        }}
      >
        Like soul mates bound together across time each piece has a partner it
        shares data with on their journey towards liberation. Cessation explores
        death, rebirth, and the beauty of process.
      </p>

      {/* THE SYSTEM */}
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.12em",
          color: "var(--muted)",
          marginBottom: "32px",
        }}
      >
        THE SYSTEM
      </p>

      <p
        style={{
          fontSize: "13px",
          lineHeight: "2",
          color: "var(--muted)",
          marginBottom: "32px",
        }}
      >
        <span style={{ color: "var(--foreground)" }}>health index</span> — a
        normalized value derived from the metabolic panel and ECG. Higher means
        healthier. It drives the brightness and energy of the piece.
      </p>

      <p
        style={{
          fontSize: "13px",
          lineHeight: "2",
          color: "var(--muted)",
          marginBottom: "32px",
        }}
      >
        <span style={{ color: "var(--foreground)" }}>visual output</span> — six
        electrolyte beams pulse across the canvas, each mapped to a specific
        lab marker. Their hue, tempo, and position shift with the data.
        Background fields layer hue from glucose, kidney function, and cardiac
        rhythm.
      </p>

      <p
        style={{
          fontSize: "13px",
          lineHeight: "2",
          color: "var(--muted)",
          marginBottom: "32px",
        }}
      >
        <span style={{ color: "var(--foreground)" }}>decay</span> — each piece
        has a lifespan determined at mint by the Bitcoin block hash.
      </p>

      <p
        style={{
          fontSize: "13px",
          lineHeight: "2",
          color: "var(--muted)",
        }}
      >
        <span style={{ color: "var(--foreground)" }}>on-chain</span> — the
        entire engine lives in a single parent inscription. Each piece is a
        child inscription holding only its dataset.
      </p>
    </div>
  );
}
