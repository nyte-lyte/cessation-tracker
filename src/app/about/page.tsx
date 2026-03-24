export default function AboutPage() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 50px)",
        display: "flex",
        alignItems: "center",
      }}
    >
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
        Partner pieces blend data across shared lifespans on their journey
        towards liberation. Built upon the belief that one returns multiple
        times in order to move toward something greater inside all of us —
        Cessation explores death, rebirth, and the beauty of process.
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
        normalized value derived from the metabolic panel and ECG. Scales with
        the intensity and energy of the piece.
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
        }}
      >
        <span style={{ color: "var(--foreground)" }}>decay</span> — the health
        data itself evolves over the lifetime of each piece through chronological
        drift and collection influence. The lifespan of each cycle is determined
        by the Bitcoin block hash — the mint block for the first lifespan, the
        cessation block for each rebirth.
      </p>

    </div>
    </div>
  );
}
