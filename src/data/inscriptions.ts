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

// Index matches piece index (0–28). null = not yet minted.
export const PIECE_INSCRIPTIONS: (PieceInscription | null)[] = [
  {
    inscriptionId: "a31a05eb1febd0d99ccadab3622641f3d80c7ecfbed5c39c7aa6a1ed080bccdci0",
    hashTail: 51,
    inscriptionUnix: 1780851771,
    blockHeight: 952744,
  }, // piece 00 — 2018-07-16
  {
    inscriptionId: "d5502e4bcf77add57998142435c748f9cc40cd15c405be1f1ed1dd299aa1c140i0",
    hashTail: 29,
    inscriptionUnix: 1780853110,
    blockHeight: 952746,
  }, // piece 01 — 2018-10-04
  {
    inscriptionId: "d85a9875d6e9d0bdba879268d1c3c790143b7ad281b83089305059e599cc5342i0",
    hashTail: 60,
    inscriptionUnix: 1780854786,
    blockHeight: 952749,
  }, // piece 02 — 2019-01-24
  {
    inscriptionId: "e2f54083f62791f35e82abe6a9206a01a8e0ed8fe7ce96c15ed683236a97e62ci0",
    hashTail: 21,
    inscriptionUnix: 1780864812,
    blockHeight: 952762,
  }, // piece 03 — 2019-04-24
  {
    inscriptionId: "5b6613703551ebc94cd90c2c1a3b90ee42f252861dbda278c6ac18d1cb06258ei0",
    hashTail: 81,
    inscriptionUnix: 1780865859,
    blockHeight: 952765,
  }, // piece 04 — 2019-07-31
  {
    inscriptionId: "9f848ac9a5dba102dd3415d42dce0864bbc408145d14fbdd733df6c3b1ad1a21i0",
    hashTail: 76,
    inscriptionUnix: 1780866591,
    blockHeight: 952767,
  }, // piece 05 — 2020-02-07
  {
    inscriptionId: "b22da7d2e0fc13e8537d64309208c142fc61158a5d41efdf0951c374d630ee8ei0",
    hashTail: 42,
    inscriptionUnix: 1780868047,
    blockHeight: 952769,
  }, // piece 06 — 2020-02-28
  {
    inscriptionId: "23db5688180d5ed9d2d417b1303dab93fcd8c378bdd7cff54450c40499429837i0",
    hashTail: 57,
    inscriptionUnix: 1780870406,
    blockHeight: 952771,
  }, // piece 07 — 2020-03-13
  {
    inscriptionId: "1108b9c25aab94d053e5e909fc90c577b6eb95a4574031bfb6abee652c4a1236i0",
    hashTail: 58,
    inscriptionUnix: 1780873095,
    blockHeight: 952774,
  }, // piece 08 — 2020-05-22
  {
    inscriptionId: "1727e0287ac65671ee58c9f9cd6e5125db126a90d873c8483a6296a59dea8c8ai0",
    hashTail: 22,
    inscriptionUnix: 1780873497,
    blockHeight: 952777,
  }, // piece 09 — 2020-08-11
  {
    inscriptionId: "8394f1e380a0bccf2207cc8ad76e5b6977a63319009f092dd20751666ea01d3di0",
    hashTail: 74,
    inscriptionUnix: 1780875295,
    blockHeight: 952781,
  }, // piece 10 — 2020-11-12
  {
    inscriptionId: "dc5a618e5f7ea851f907744a9c3296bc53371dbd5cbfcd38f5d3d29e85ef1a50i0",
    hashTail: 59,
    inscriptionUnix: 1780878813,
    blockHeight: 952787,
  }, // piece 11 — 2021-02-24
  {
    inscriptionId: "bd3862161dd030a7030e7cc900099e99304e82284f657dd57023410a1f80f277i0",
    hashTail: 73,
    inscriptionUnix: 1780880962,
    blockHeight: 952790,
  }, // piece 12 — 2021-09-01
  null, // piece 13 — 2021-12-01
  null, // piece 14 — 2022-02-14
  null, // piece 15 — 2022-05-13
  null, // piece 16 — 2022-08-25
  null, // piece 17 — 2023-06-12
  null, // piece 18 — 2023-09-05
  null, // piece 19 — 2023-12-05
  null, // piece 20 — 2024-02-05
  null, // piece 21 — 2024-06-10
  null, // piece 22 — 2024-09-16
  null, // piece 23 — 2024-12-30
  null, // piece 24 — 2025-03-26
  null, // piece 25 — 2025-06-18
  null, // piece 26 — 2025-09-12
  null, // piece 27 — 2025-12-11
  null, // piece 28 — 2026-03-20
];

export const ENGINE_INSCRIPTION_ID: string | null =
  "b725884c8a6d63c2499c0f86b8e5863115808f8998697ba23abc0194b8c3323ei0";
