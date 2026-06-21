// inscriptions.ts — Per-piece on-chain data, filled in after minting.
// All values null until the piece is inscribed.
// Synced from chain via ordinals.com /r/children, /r/inscription, /r/metadata
// (CBOR-decoded). Re-run sync to pick up newly minted pieces.

export interface PieceInscription {
  inscriptionId: string;
  hashTail: number;        // 0–99
  inscriptionUnix: number; // Unix seconds
  blockHeight: number;
}

// Index matches piece index (0–29). null = not yet minted.
// inscriptionId = latest/current inscription on each sat (v2 engine).
// hashTail/inscriptionUnix/blockHeight = original birth values (v1 inscription),
// which are baked into each piece's HTML attributes and determine lifespan.
export const PIECE_INSCRIPTIONS: (PieceInscription | null)[] = [
  {
    inscriptionId: "625d803e9bf5e532905d30b9701f7132bf27056893c36dc45ca5fa3f05d960bai0",
    hashTail: 51,
    inscriptionUnix: 1780851771,
    blockHeight: 952744,
  }, // piece 00 — 2018-07-16
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i0",
    hashTail: 29,
    inscriptionUnix: 1780853110,
    blockHeight: 952746,
  }, // piece 01 — 2018-10-04
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i1",
    hashTail: 60,
    inscriptionUnix: 1780854786,
    blockHeight: 952749,
  }, // piece 02 — 2019-01-24
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i2",
    hashTail: 21,
    inscriptionUnix: 1780864812,
    blockHeight: 952762,
  }, // piece 03 — 2019-04-24
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i3",
    hashTail: 81,
    inscriptionUnix: 1780865859,
    blockHeight: 952765,
  }, // piece 04 — 2019-07-31
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i4",
    hashTail: 76,
    inscriptionUnix: 1780866591,
    blockHeight: 952767,
  }, // piece 05 — 2020-02-07
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i5",
    hashTail: 42,
    inscriptionUnix: 1780868047,
    blockHeight: 952769,
  }, // piece 06 — 2020-02-28
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i6",
    hashTail: 57,
    inscriptionUnix: 1780870406,
    blockHeight: 952771,
  }, // piece 07 — 2020-03-13
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i7",
    hashTail: 58,
    inscriptionUnix: 1780873095,
    blockHeight: 952774,
  }, // piece 08 — 2020-05-22
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i8",
    hashTail: 22,
    inscriptionUnix: 1780873497,
    blockHeight: 952777,
  }, // piece 09 — 2020-08-11
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i9",
    hashTail: 74,
    inscriptionUnix: 1780875295,
    blockHeight: 952781,
  }, // piece 10 — 2020-11-12
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i10",
    hashTail: 59,
    inscriptionUnix: 1780878813,
    blockHeight: 952787,
  }, // piece 11 — 2021-02-24
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i11",
    hashTail: 73,
    inscriptionUnix: 1780880962,
    blockHeight: 952790,
  }, // piece 12 — 2021-09-01
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i12",
    hashTail: 58,
    inscriptionUnix: 1780883403,
    blockHeight: 952792,
  }, // piece 13 — 2021-12-01
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i13",
    hashTail: 15,
    inscriptionUnix: 1780885373,
    blockHeight: 952794,
  }, // piece 14 — 2022-02-14
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i14",
    hashTail: 42,
    inscriptionUnix: 1780886934,
    blockHeight: 952796,
  }, // piece 15 — 2022-05-13
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i15",
    hashTail: 49,
    inscriptionUnix: 1780888133,
    blockHeight: 952798,
  }, // piece 16 — 2022-08-25
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i16",
    hashTail: 82,
    inscriptionUnix: 1780892165,
    blockHeight: 952800,
  }, // piece 17 — 2023-06-12
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i17",
    hashTail: 58,
    inscriptionUnix: 1780893567,
    blockHeight: 952802,
  }, // piece 18 — 2023-09-05
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i18",
    hashTail: 34,
    inscriptionUnix: 1780894802,
    blockHeight: 952804,
  }, // piece 19 — 2023-12-05
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i19",
    hashTail: 4,
    inscriptionUnix: 1780895440,
    blockHeight: 952806,
  }, // piece 20 — 2024-02-05
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i20",
    hashTail: 66,
    inscriptionUnix: 1780898132,
    blockHeight: 952808,
  }, // piece 21 — 2024-06-10
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i21",
    hashTail: 16,
    inscriptionUnix: 1780899111,
    blockHeight: 952810,
  }, // piece 22 — 2024-09-16
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i22",
    hashTail: 9,
    inscriptionUnix: 1780899973,
    blockHeight: 952813,
  }, // piece 23 — 2024-12-30
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i23",
    hashTail: 66,
    inscriptionUnix: 1780901092,
    blockHeight: 952815,
  }, // piece 24 — 2025-03-26
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i24",
    hashTail: 79,
    inscriptionUnix: 1780902895,
    blockHeight: 952817,
  }, // piece 25 — 2025-06-18
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i25",
    hashTail: 5,
    inscriptionUnix: 1780903858,
    blockHeight: 952821,
  }, // piece 26 — 2025-09-12
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i26",
    hashTail: 67,
    inscriptionUnix: 1780907945,
    blockHeight: 952827,
  }, // piece 27 — 2025-12-11
  {
    inscriptionId: "5d643a3ed027346871718780233c65890e4de866e78b9242fad2ca5cf1bc19e7i27",
    hashTail: 60,
    inscriptionUnix: 1780910280,
    blockHeight: 952829,
  }, // piece 28 — 2026-03-20
  {
    inscriptionId: "ebf6532aa5b0deaaa26b56c1874dbb1989961bdd4085411570f80cb264d5304bi0",
    hashTail: 54,
    inscriptionUnix: 1781977542,
    blockHeight: 954611,
  }, // piece 29 — 2026-06-19
];

export const ENGINE_INSCRIPTION_ID: string | null =
  "6a53d56958589b9f9bf191646fc0eddfb560e2873bb39d714c5c6e34f00e4f60i0";
