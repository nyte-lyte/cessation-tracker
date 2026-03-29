// Shared utilities ported from ~/cessation/src/main.js
// Used to compute visual properties for each piece from health data.

import { healthDataSets, minMaxValues } from "@/data/health_data_sets";

export interface HealthDataSet {
  date: string;
  ecg: {
    ventRate: number;
    prInterval: number;
    qrsInterval: number;
    qtInterval: number;
    qtcInterval: number;
    pAxis: number;
    rAxis: number;
    tAxis: number;
  };
  labs: {
    glucose: number;
    nitrogen: number;
    creatinine: number;
    eGFR: number;
    sodium: number;
    potassium: number;
    chloride: number;
    carbonDioxide: number;
    calcium: number;
  };
  healthIndex: number;
}

// Cast once so all downstream code has proper types
const ds_all = healthDataSets as HealthDataSet[];
export { ds_all as healthDataSets };

// ─── Core helpers ─────────────────────────────────────────────

function percentile(value: number, sortedArray: number[]): number {
  const rank = sortedArray.filter((v) => v < value).length;
  return rank / (sortedArray.length - 1);
}

export function computeHSBFromStats(
  dataSet: HealthDataSet,
  allDatasets: HealthDataSet[]
): { hue: number; sat: number; bri: number } {
  const glucoseValues = allDatasets.map((d) => d.labs.glucose).sort((a, b) => a - b);
  const potassiumValues = allDatasets.map((d) => d.labs.potassium).sort((a, b) => a - b);
  const egfrValues = allDatasets.map((d) => d.labs.eGFR).sort((a, b) => a - b);

  return {
    hue: percentile(dataSet.labs.glucose, glucoseValues),
    sat: percentile(dataSet.labs.potassium, potassiumValues),
    bri: percentile(dataSet.labs.eGFR, egfrValues),
  };
}

export function hsbToHex(h: number, s: number, b: number): string {
  const H = (h * 360) % 360;
  const C = b * s;
  const Hp = H / 60;
  const X = C * (1 - Math.abs((Hp % 2) - 1));

  let r1 = 0, g1 = 0, b1 = 0;
  if (Hp < 1)       [r1, g1, b1] = [C, X, 0];
  else if (Hp < 2)  [r1, g1, b1] = [X, C, 0];
  else if (Hp < 3)  [r1, g1, b1] = [0, C, X];
  else if (Hp < 4)  [r1, g1, b1] = [0, X, C];
  else if (Hp < 5)  [r1, g1, b1] = [X, 0, C];
  else              [r1, g1, b1] = [C, 0, X];

  const m = b - C;
  const to2 = (n: number) =>
    Math.max(0, Math.min(255, Math.round((n + m) * 255)))
      .toString(16)
      .padStart(2, "0");
  return `#${to2(r1)}${to2(g1)}${to2(b1)}`;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function normalize(value: number, min: number, max: number): number {
  if (max - min === 0) return 0;
  return (value - min) / (max - min);
}

export function lifespanYearsFromHashDigits(x: number): number {
  const n = x / 99;
  const offset = Math.pow(n, 2.5);
  let lifespan = 5 + offset * 35;
  if (x < 5) lifespan = 5 + n * 10;
  else if (x > 95) lifespan = 40 + n * 25;
  return lifespan;
}

// ─── Piece metadata ────────────────────────────────────────────

export interface PieceMeta {
  id: number;
  date: string;
  hex: string;
  hue: number;
  sat: number;
  bri: number;
  healthIndex: number;
  ecg: HealthDataSet["ecg"];
  labs: HealthDataSet["labs"];
}

export function getPieceMeta(id: number): PieceMeta {
  const ds = ds_all[id];
  const { hue, sat, bri } = computeHSBFromStats(ds, ds_all);
  return {
    id,
    date: ds.date,
    hex: hsbToHex(hue, Math.max(0.4, sat), Math.max(0.35, bri)),
    hue,
    sat,
    bri,
    healthIndex: ds.healthIndex ?? 0.5,
    ecg: ds.ecg,
    labs: ds.labs,
  };
}

export function getAllPieceMeta(): PieceMeta[] {
  return ds_all.map((_, i) => getPieceMeta(i));
}

// ─── Uniforms (snapshot at year=0) ────────────────────────────

export function computeStaticUniforms(id: number) {
  const ds = ds_all[id];
  const { hue, sat, bri } = computeHSBFromStats(ds, ds_all);
  const HASH = 88;
  const lifespanYears = lifespanYearsFromHashDigits(HASH);

  const allBCR = ds_all
    .map((d) => d.labs.nitrogen / Math.max(0.1, d.labs.creatinine))
    .sort((a, b) => a - b);
  const bcP05 = allBCR[Math.floor(0.05 * (allBCR.length - 1))];
  const bcP95 = allBCR[Math.ceil(0.95 * (allBCR.length - 1))];

  const allAngles = ds_all.map((d) => Math.abs(d.ecg.rAxis - d.ecg.tAxis));
  const angMin = Math.min(...allAngles);
  const angMax = Math.max(...allAngles);

  // Percentile-ranked axis arrays — prevents the 2025-03-26 outlier (pAxis:148, rAxis:143, tAxis:142)
  // from compressing all other datasets into the bottom third of the normalized range.

  const bcRatio = ds.labs.nitrogen / Math.max(0.1, ds.labs.creatinine);

  return {
    u_glucose: hue,
    u_potassium: sat,
    u_eGFR: bri,
    u_totalYears: 0,
    u_lifespanYears: lifespanYears,
    u_pAxisNorm: clamp(normalize(ds.ecg.pAxis, minMaxValues.pAxis.min, minMaxValues.pAxis.max), 0, 1),
    u_rAxisNorm: clamp(normalize(ds.ecg.rAxis, minMaxValues.rAxis.min, minMaxValues.rAxis.max), 0, 1),
    u_qtcNorm:        clamp(normalize(ds.ecg.qtcInterval, minMaxValues.qtcInterval.min, minMaxValues.qtcInterval.max), 0, 1),
    u_qtcPercentile:  percentile(ds.ecg.qtcInterval, ds_all.map((d) => d.ecg.qtcInterval).sort((a, b) => a - b)),
    u_prNorm:    clamp(normalize(ds.ecg.prInterval, minMaxValues.prInterval.min, minMaxValues.prInterval.max), 0, 1),
    u_ventRateNorm: clamp(normalize(ds.ecg.ventRate, minMaxValues.ventRate.min, minMaxValues.ventRate.max), 0, 1),
    u_tAxisNorm: clamp(normalize(ds.ecg.tAxis, minMaxValues.tAxis.min, minMaxValues.tAxis.max), 0, 1),
    u_qrsTAngle: clamp(
      (Math.abs(ds.ecg.rAxis - ds.ecg.tAxis) - angMin) / Math.max(1e-6, angMax - angMin),
      0, 1
    ),
    u_qrsNorm: clamp(normalize(ds.ecg.qrsInterval, minMaxValues.qrsInterval.min, minMaxValues.qrsInterval.max), 0, 1),
    u_co2Norm: clamp(normalize(ds.labs.carbonDioxide, minMaxValues.carbonDioxide.min, minMaxValues.carbonDioxide.max), 0, 1),
    u_inheritedHueDeg: computeHSBFromStats(ds_all[Math.max(0, id - 1)], ds_all).hue * 360,
    u_inheritedStrength: 1.0,
    u_nitrogenStrength: 0.42,
    u_nitrogenHueDeg: hue * 360,
    u_creatinineStrength: 0.38,
    u_creatinineHueDeg: hue * 360 + 15,
    u_sodiumStrength: 0.0,
    u_sodiumHueDeg: hue * 360 - 20,
    u_chlorideStrength: 0.0,
    u_chlorideHueDeg: hue * 360 + 30,
    u_co2Strength: 0.28,
    u_co2HueDeg: hue * 360 - 30,
    u_calciumStrength: 0.08,
    u_calciumHueDeg: hue * 360 + 55,
    u_nitrogenRadius: 0.5,
    u_creatinineRadius: 0.5,
    u_sodiumRadius: 0.5,
    u_chlorideRadius: 0.5,
    u_calciumRadius: 0.5,
    u_bunCreatRatioNorm: clamp((bcRatio - bcP05) / Math.max(1e-9, bcP95 - bcP05), 0, 1),
  };
}
