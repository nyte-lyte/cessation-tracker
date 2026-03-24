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


    </div>
    </div>
  );
}
