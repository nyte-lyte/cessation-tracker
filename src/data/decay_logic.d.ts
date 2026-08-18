// Types for decay_logic.js, which is a verbatim copy of cessation/data/decay_logic.js.
//
// The .js is kept byte-identical to the engine's own copy so the tracker computes
// exactly what a piece computes on chain — so it must not be edited here. That file
// assigns `healthIndex` after building its object literal, which TypeScript cannot
// see when inferring types from JS, producing a return type missing that field.
// Declaring the shapes here fixes it without touching the synced source, and pins
// the signatures so a future sync that changes them fails the build instead of
// silently passing an argument into the wrong parameter.

import type { HealthDataSet } from "@/lib/pieceUtils";

export interface MinMaxRange {
  min: number;
  max: number;
}

export type MinMaxValues = Record<string, MinMaxRange>;

export function normalize(val: number, min: number, max: number): number;

export function computeMinMaxValues(allDatasets: HealthDataSet[]): MinMaxValues;

/** Succession blend: `a` keeps 70%, `b` leaves a 30% impression. */
export function blendDatasets(
  a: HealthDataSet,
  b: HealthDataSet,
  minMaxValues?: MinMaxValues
): HealthDataSet;

/** Accumulated disease burden of a dataset. Higher = more cycles before liberation. */
export function computeKarma(
  dataset: HealthDataSet,
  minMaxValues: MinMaxValues
): number;

/** 25th percentile of karma across the collection — shifts as the collection grows. */
export function computeLiberationThreshold(
  allDatasets: HealthDataSet[],
  minMaxValues: MinMaxValues
): number;

/** Chronological drift — the piece moves forward through the real health timeline. */
export function getAgedDataset(
  startIdx: number,
  lifeFraction: number,
  allDatasets: HealthDataSet[],
  minMaxValues?: MinMaxValues
): HealthDataSet;

/**
 * Systemic collection influence — a gentle pull toward the collection average.
 * NOTE the parameter order: `minMaxValues` comes before `influence`. An older copy
 * of this file took `influence` in the fourth position, so a stale call site would
 * pass a number straight into the minMaxValues slot.
 */
export function applyCollectionInfluence(
  dataset: HealthDataSet,
  allDatasets: HealthDataSet[],
  lifeFraction: number,
  minMaxValues?: MinMaxValues,
  influence?: number
): HealthDataSet;

export function calculateHealthIndex(
  data: HealthDataSet,
  minMaxValues: MinMaxValues
): number;

/**
 * Karma cleared per rebirth = the piece's own eGFR, normalised against the live
 * collection. The collection's lowest eGFR clears 0% and cannot release its own
 * burden at all.
 */
export function karmaClearanceRate(
  dataset: HealthDataSet,
  minMaxValues: MinMaxValues
): number;

/** Burden still carried: karma of the piece as it now is, less all that has cleared. */
export function remainingKarma(
  dataset: HealthDataSet,
  uncleared: number,
  minMaxValues: MinMaxValues
): number;

/** Tempo constant for clearance — sets how long liberation takes, not who reaches it. */
export const KARMA_CLEARANCE_K: number;
