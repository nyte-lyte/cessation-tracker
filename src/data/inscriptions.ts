// inscriptions.ts — Per-piece on-chain data, filled in after minting.
// All values null until the piece is inscribed.
// After minting each piece, update the corresponding entry with:
//   inscriptionId: the txid+i0 string
//   hashTail:      0-99, from the dist/cessation_piece_NN_metadata.json
//   inscriptionUnix: Unix seconds, from the same metadata file
//   blockHeight:   block height at inscription time

export interface PieceInscription {
  inscriptionId: string;
  hashTail: number;        // 0–99
  inscriptionUnix: number; // Unix seconds
  blockHeight: number;
}

// Index matches piece index (0–28). null = not yet minted.
export const PIECE_INSCRIPTIONS: (PieceInscription | null)[] = [
  null, // piece 00 — 2018-07-16
  null, // piece 01 — 2018-10-04
  null, // piece 02 — 2019-01-24
  null, // piece 03 — 2019-04-24
  null, // piece 04 — 2019-07-31
  null, // piece 05 — 2020-02-07
  null, // piece 06 — 2020-02-28
  null, // piece 07 — 2020-03-13
  null, // piece 08 — 2020-05-22
  null, // piece 09 — 2020-08-11
  null, // piece 10 — 2020-11-12
  null, // piece 11 — 2021-02-24
  null, // piece 12 — 2021-09-01
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

export const ENGINE_INSCRIPTION_ID: string | null = null;
