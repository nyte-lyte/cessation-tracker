"use client";

import { useEffect, useRef } from "react";
import { minMaxValues } from "@/data/health_data_sets";
import {
  healthDataSets,
  computeHSBFromStats,
  computeStaticUniforms,
  lifespanYearsFromHashDigits,
  normalize,
  type HealthDataSet,
} from "@/lib/pieceUtils";
import { getAgedDataset, applyCollectionInfluence } from "@/data/decay_logic";

const HASH = 88; // placeholder until mint

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function hsbToRgb(hDeg: number, s: number, b: number): [number, number, number] {
  const H = ((hDeg % 360) + 360) % 360;
  const C = b * s;
  const Hp = H / 60;
  const X = C * (1 - Math.abs((Hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (Hp < 1)      [r1, g1, b1] = [C, X, 0];
  else if (Hp < 2) [r1, g1, b1] = [X, C, 0];
  else if (Hp < 3) [r1, g1, b1] = [0, C, X];
  else if (Hp < 4) [r1, g1, b1] = [0, X, C];
  else if (Hp < 5) [r1, g1, b1] = [X, 0, C];
  else             [r1, g1, b1] = [C, 0, X];
  const m = b - C;
  return [r1 + m, g1 + m, b1 + m];
}

function wrapDeg(h: number) {
  return ((h % 360) + 360) % 360;
}

function guardHueGap(baseDeg: number, candDeg: number, minGapDeg: number, pushSign: number) {
  baseDeg = wrapDeg(baseDeg);
  candDeg = wrapDeg(candDeg);
  const diff = Math.abs(((candDeg - baseDeg + 540) % 360) - 180);
  if (diff < minGapDeg) candDeg = wrapDeg(candDeg + pushSign * (minGapDeg - diff));
  return candDeg;
}

function percentile(value: number, sortedArray: number[]): number {
  const rank = sortedArray.filter((v) => v < value).length;
  return rank / (sortedArray.length - 1);
}

function compileShader(
  gl: WebGL2RenderingContext,
  src: string,
  type: number
): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error:\n${info}`);
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vSrc: string,
  fSrc: string
): WebGLProgram {
  const program = gl.createProgram()!;
  gl.attachShader(program, compileShader(gl, vSrc, gl.VERTEX_SHADER));
  gl.attachShader(program, compileShader(gl, fSrc, gl.FRAGMENT_SHADER));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error("Program link error:\n" + gl.getProgramInfoLog(program));
  }
  return program;
}

interface PieceViewerProps {
  id: number;
  vertexSrc: string;
  fragmentSrc: string;
}

export default function PieceViewer({ id, vertexSrc, fragmentSrc }: PieceViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas!;

    const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
    if (!gl) {
      console.error("WebGL2 not available");
      return;
    }

    let program: WebGLProgram;
    try {
      program = createProgram(gl, vertexSrc, fragmentSrc);
    } catch (e) {
      console.error(e);
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad
    const posLoc = gl.getAttribLocation(program, "a_position");
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const u = (name: string) => gl.getUniformLocation(program, name);
    const locs = {
      time:              u("u_time"),
      resolution:        u("u_resolution"),
      glucose:           u("u_glucose"),
      potassium:         u("u_potassium"),
      egfr:              u("u_eGFR"),
      totalYears:        u("u_totalYears"),
      lifespanYears:     u("u_lifespanYears"),
      pAxisNorm:         u("u_pAxisNorm"),
      rAxisNorm:         u("u_rAxisNorm"),
      qtcNorm:           u("u_qtcNorm"),
      qtcPercentile:     u("u_qtcPercentile"),
      pAxisPct:          u("u_pAxisPct"),
      rAxisPct:          u("u_rAxisPct"),
      tAxisPct:          u("u_tAxisPct"),
      ventRatePct:       u("u_ventRatePct"),
      prPct:             u("u_prPct"),
      qrsPct:            u("u_qrsPct"),
      qrsTAnglePct:      u("u_qrsTAnglePct"),
      qrsNorm:           u("u_qrsNorm"),
      prNorm:            u("u_prNorm"),
      ventRateNorm:      u("u_ventRateNorm"),
      tAxisNorm:         u("u_tAxisNorm"),
      qrsTAngle:         u("u_qrsTAngle"),
      inheritedHueDeg:      u("u_inheritedHueDeg"),
      inheritedStrength:    u("u_inheritedStrength"),
      reanimationProgress:  u("u_reanimationProgress"),
      partnerInheritedHue:  u("u_partnerInheritedHueDeg"),
      isLiberated:          u("u_isLiberated"),
      voidProgress:         u("u_voidProgress"),
      nStr:              u("u_nitrogenStrength"),
      nHue:              u("u_nitrogenHueDeg"),
      nR:                u("u_nitrogenRadius"),
      crStr:             u("u_creatinineStrength"),
      crHue:             u("u_creatinineHueDeg"),
      crR:               u("u_creatinineRadius"),
      naStr:             u("u_sodiumStrength"),
      naHue:             u("u_sodiumHueDeg"),
      naR:               u("u_sodiumRadius"),
      clStr:             u("u_chlorideStrength"),
      clHue:             u("u_chlorideHueDeg"),
      clR:               u("u_chlorideRadius"),
      co2Str:            u("u_co2Strength"),
      co2Hue:            u("u_co2HueDeg"),
      caStr:             u("u_calciumStrength"),
      caHue:             u("u_calciumHueDeg"),
      caR:               u("u_calciumRadius"),
      bunCreat:          u("u_bunCreatRatioNorm"),
      nRGB:    gl.getUniformLocation(program, "u_nitrogenRGB"),
      crRGB:   gl.getUniformLocation(program, "u_creatRGB"),
      naRGB:   gl.getUniformLocation(program, "u_sodiumRGB"),
      clRGB:   gl.getUniformLocation(program, "u_chlorideRGB"),
      co2RGB:  gl.getUniformLocation(program, "u_co2RGB"),
      caRGB:   gl.getUniformLocation(program, "u_calciumRGB"),
      nirvanaRGB: gl.getUniformLocation(program, "u_nirvanaRGB"),
      partnerRGB: gl.getUniformLocation(program, "u_partnerRGB"),
    };

    // Dataset-derived constants
    const statics = computeStaticUniforms(id);
    const lifespanYears = lifespanYearsFromHashDigits(HASH);

    // Hash-derived nudges (match main.js)
    const hash01 = HASH / 99;
    const signed = (hash01 - 0.5) * 2;
    const nudgeNa  = 12 * signed;
    const nudgeCl  = 14 * signed;
    const nudgeCO2 = 18 * signed;
    const nudgeCa  = 12 * signed;

    // BUN/Cr range (static bounds, value computed per-frame from activeDs)
    const allBCR = healthDataSets
      .map((d) => d.labs.nitrogen / Math.max(0.1, d.labs.creatinine))
      .sort((a, b) => a - b);
    const bcP05 = allBCR[Math.floor(0.05 * (allBCR.length - 1))];
    const bcP95 = allBCR[Math.ceil(0.95 * (allBCR.length - 1))];

    // QRS-T angle bounds (static, value computed per-frame from activeDs)
    const allAngles = healthDataSets.map((d) => Math.abs(d.ecg.rAxis - d.ecg.tAxis));
    const angMin = Math.min(...allAngles);
    const angMax = Math.max(...allAngles);

    // Precompute sorted lab arrays — these never change, safe to cache outside draw()
    const sortedNitrogen   = healthDataSets.map((d) => d.labs.nitrogen).sort((a, b) => a - b);
    const sortedEGFR       = healthDataSets.map((d) => d.labs.eGFR).sort((a, b) => a - b);
    const sortedPotassium  = healthDataSets.map((d) => d.labs.potassium).sort((a, b) => a - b);
    const labSorted: Record<string, number[]> = {};
    for (const key of ["nitrogen","creatinine","sodium","chloride","carbonDioxide","calcium"]) {
      labSorted[key] = healthDataSets.map((d) => (d.labs as Record<string,number>)[key]).sort((a,b) => a-b);
    }

    // Pure helper functions (no ds closure)
    function winsorizedVal(value: number, sortedVals: number[]): number {
      const p05 = sortedVals[Math.floor(0.05 * (sortedVals.length - 1))];
      const p95 = sortedVals[Math.ceil(0.95 * (sortedVals.length - 1))];
      return clamp((Math.max(p05, Math.min(p95, value)) - p05) / Math.max(1e-9, p95 - p05), 0, 1);
    }

    function sodiumPulseShape(phase01: number, k: number, width = 0.12): number {
      let acc = 0;
      for (let i = 0; i < k; i++) {
        const center = (i + 0.5) / k;
        const d = Math.min(Math.abs(phase01 - center), 1 - Math.abs(phase01 - center));
        acc += Math.exp(-0.5 * Math.pow(d / Math.max(1e-3, width), 2));
      }
      return 0.25 + 0.75 * (acc / k);
    }

    function sodiumHueDeg(pNa_: number, bHueDeg: number): number {
      const targetOffset = -25 + 50 * clamp(pNa_, 0, 1);
      let cand = wrapDeg(bHueDeg + targetOffset);
      const base = wrapDeg(bHueDeg);
      const diff = Math.abs(((cand - base + 540) % 360) - 180);
      if (diff < 36) cand = wrapDeg(cand + (32 - diff) * Math.sign(targetOffset || 1));
      return cand;
    }

    function chlorideTriWithWarble(phase01: number, tAxisN: number): number {
      const tri = 1 - Math.abs(2 * (phase01 - Math.floor(phase01 + 0.5)));
      const wf = 1.6 + 2.2 * tAxisN;
      const war = 0.92 + 0.08 * Math.sin(2 * Math.PI * (phase01 * wf));
      return clamp(tri * war, 0, 1);
    }

    function chlorideHueDeg(pCl_: number, bHueDeg: number): number {
      const targetOffset = -20 + 40 * clamp(pCl_, 0, 1);
      let cand = wrapDeg(bHueDeg + targetOffset);
      const base = wrapDeg(bHueDeg);
      const diff = Math.abs(((cand - base + 540) % 360) - 180);
      if (diff < 32) cand = wrapDeg(cand + Math.sign(targetOffset || 1) * (32 - diff));
      return cand;
    }

    // Pre-sorted values for percentile ranking (field hues)
    const sortedQtcValues       = healthDataSets.map((d) => d.ecg.qtcInterval).sort((a, b) => a - b);
    const sortedPAxisValues     = healthDataSets.map((d) => d.ecg.pAxis).sort((a, b) => a - b);
    const sortedRAxisValues     = healthDataSets.map((d) => d.ecg.rAxis).sort((a, b) => a - b);
    const sortedTAxisValues     = healthDataSets.map((d) => d.ecg.tAxis).sort((a, b) => a - b);
    const sortedVentRateValues  = healthDataSets.map((d) => d.ecg.ventRate).sort((a, b) => a - b);
    const sortedPRValues        = healthDataSets.map((d) => d.ecg.prInterval).sort((a, b) => a - b);
    const sortedQRSValues       = healthDataSets.map((d) => d.ecg.qrsInterval).sort((a, b) => a - b);
    const sortedQRSTAngleValues = healthDataSets.map((d) => Math.abs(d.ecg.rAxis - d.ecg.tAxis)).sort((a, b) => a - b);

    // Beam phases — seeded from HASH (match main.js phaseSeed per beam)
    const phases = {
      N:   (HASH / 99) * 2 * Math.PI,
      C:   (HASH / 99) * 1.3 * Math.PI,
      Na:  (HASH / 99 + 0.57) % 1,
      Cl:  (HASH / 99 + 0.11) % 1,
      CO2: 0,
      Ca:  0,
    };

    const inscriptionUnix = 1704067200;
    const YEARS_PER_SEC = 1 / (365 * 24 * 3600);
    let lastT = performance.now() / 1000;

    // Cache canvas size in physical pixels — updated only by ResizeObserver
    const dpr = () => window.devicePixelRatio || 1;
    let cachedW = Math.round((c.clientWidth || 1) * dpr());
    let cachedH = Math.round((c.clientHeight || 1) * dpr());
    c.width = cachedW;
    c.height = cachedH;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const w = Math.round(entry.contentRect.width * dpr()) || 1;
      const h = Math.round(entry.contentRect.height * dpr()) || 1;
      if (w !== cachedW || h !== cachedH) {
        cachedW = w;
        cachedH = h;
        c.width = w;
        c.height = h;
      }
    });
    ro.observe(c);

    function draw() {
      gl.viewport(0, 0, cachedW, cachedH);

      const nowSec = performance.now() / 1000;
      const dt = Math.min(0.1, Math.max(0, nowSec - lastT));
      lastT = nowSec;

      const totalYears =
        Math.max(0, Date.now() / 1000 - inscriptionUnix) * YEARS_PER_SEC;
      const lifeFraction = clamp(totalYears / lifespanYears, 0, 1);
      const inheritedStrength = Math.pow(Math.max(0, 1 - lifeFraction), 0.7);

      // Chronological drift + systemic influence — matches main.js activeDataSet
      const activeDs = applyCollectionInfluence(
        getAgedDataset(id, lifeFraction, healthDataSets),
        healthDataSets,
        lifeFraction
      );
      const { hue: aHue, sat: aSat, bri: aBri } = computeHSBFromStats(activeDs, healthDataSets);
      const aPAxisNorm    = clamp(normalize(activeDs.ecg.pAxis,       minMaxValues.pAxis.min,       minMaxValues.pAxis.max),       0, 1);
      const aRAxisNorm    = clamp(normalize(activeDs.ecg.rAxis,       minMaxValues.rAxis.min,       minMaxValues.rAxis.max),       0, 1);
      const aQtcNorm      = clamp(normalize(activeDs.ecg.qtcInterval, minMaxValues.qtcInterval.min, minMaxValues.qtcInterval.max), 0, 1);
      const aPrNorm       = clamp(normalize(activeDs.ecg.prInterval,  minMaxValues.prInterval.min,  minMaxValues.prInterval.max),  0, 1);
      const aVentRateNorm = clamp(normalize(activeDs.ecg.ventRate,    minMaxValues.ventRate.min,    minMaxValues.ventRate.max),    0, 1);
      const aTAxisNorm    = clamp(normalize(activeDs.ecg.tAxis,       minMaxValues.tAxis.min,       minMaxValues.tAxis.max),       0, 1);
      const aQrsNorm      = clamp(normalize(activeDs.ecg.qrsInterval, minMaxValues.qrsInterval.min, minMaxValues.qrsInterval.max), 0, 1);
      const aRawQrsTAngle = Math.abs(activeDs.ecg.rAxis - activeDs.ecg.tAxis);
      const aQrsTAngle    = clamp((aRawQrsTAngle - angMin) / Math.max(1e-6, angMax - angMin), 0, 1);
      const aBcRatio      = activeDs.labs.nitrogen / Math.max(0.1, activeDs.labs.creatinine);
      const aBunCreat     = clamp((aBcRatio - bcP05) / Math.max(1e-9, bcP95 - bcP05), 0, 1);
      // Per-frame beam values from activeDs
      const activeBaseHueDeg = aHue * 360;
      const pN   = winsorizedVal(activeDs.labs.nitrogen,      labSorted["nitrogen"]);
      const pCr  = winsorizedVal(activeDs.labs.creatinine,    labSorted["creatinine"]);
      const pNa  = winsorizedVal(activeDs.labs.sodium,        labSorted["sodium"]);
      const pCl  = winsorizedVal(activeDs.labs.chloride,      labSorted["chloride"]);
      const pCO2 = winsorizedVal(activeDs.labs.carbonDioxide, labSorted["carbonDioxide"]);
      const pCa  = winsorizedVal(activeDs.labs.calcium,       labSorted["calcium"]);

      const breathAmp = (() => {
        const pv = normalize(activeDs.ecg.ventRate, minMaxValues.ventRate.min, minMaxValues.ventRate.max);
        const pq = normalize(activeDs.ecg.qtcInterval, minMaxValues.qtcInterval.min, minMaxValues.qtcInterval.max);
        const V = 2 * Math.max(Math.abs(pv - 0.5), Math.abs(pq - 0.5));
        let amp = 0.05 + 0.07 * V;
        if (pv < 0.1 || pv > 0.9 || pq < 0.1 || pq > 0.9) amp = Math.min(0.18, amp + 0.03);
        return amp;
      })();

      const nTempo   = 10 - 3 * percentile(activeDs.labs.nitrogen, sortedNitrogen);
      const crTempo  = 9 + 6 * aPrNorm;
      const naTempo  = 10 - 5.5 * aVentRateNorm;
      const clTempo  = 11 - 5.5 * clamp((activeDs.ecg.qtInterval - minMaxValues.qtInterval.min) / Math.max(1e-6, minMaxValues.qtInterval.max - minMaxValues.qtInterval.min), 0, 1);
      const co2Tempo = 12 + 8 * percentile(activeDs.labs.eGFR, sortedEGFR);
      const caTempo  = 18 + 12 * (1 - aTAxisNorm);

      const nHueAnchor  = activeBaseHueDeg + (percentile(activeDs.labs.eGFR, sortedEGFR) - 0.5) * 160;
      const crHueAnchor = activeBaseHueDeg + (percentile(activeDs.labs.potassium, sortedPotassium) - 0.5) * 120;

      const naPulseCount = Math.max(3, Math.min(6, Math.round(3 + (1 - clamp((activeDs.ecg.qrsInterval - minMaxValues.qrsInterval.min) / Math.max(1e-6, minMaxValues.qrsInterval.max - minMaxValues.qrsInterval.min), 0, 1)) * 3)));

      // Advance beam phases using data-driven tempos
      phases.N   += (dt * 2 * Math.PI) / Math.max(1e-3, nTempo);
      phases.C   += (dt * 2 * Math.PI) / Math.max(1e-3, crTempo);
      phases.Na   = (phases.Na  + dt / Math.max(1e-3, naTempo))  % 1;
      phases.Cl   = (phases.Cl  + dt / Math.max(1e-3, clTempo))  % 1;
      phases.CO2 += (dt * 2 * Math.PI) / Math.max(1e-3, co2Tempo);
      phases.Ca  += (dt * 2 * Math.PI) / Math.max(1e-3, caTempo);

      const arrNa = clamp((totalYears - 0.2 * lifespanYears) / Math.max(0.1 * lifespanYears, 0.25), 0, 1);
      const arrCl = clamp((totalYears - 0.6 * lifespanYears) / Math.max(0.08 * lifespanYears, 0.2), 0, 1);

      // Beam strengths
      const nStr   = 0.35 + 0.20 * clamp(0.58 * (0.5 + 0.5 * Math.sin(phases.N) * breathAmp), 0, 1);
      const crStr  = 0.30 + 0.20 * clamp((0.4 + 0.3 * pCr) * (0.5 + 0.5 * Math.sin(phases.C) * breathAmp), 0, 1);
      const naAmp  = arrNa * (0.08 + 0.12 * pNa) * (0.85 + 0.15 * (1 - clamp(activeDs.healthIndex ?? 0.5, 0, 1)));
      const naStr  = clamp((0.06 + 0.10 * pNa) + clamp(naAmp * sodiumPulseShape(phases.Na, naPulseCount, 0.12), 0, 1), 0, 1);
      const clAmp  = arrCl * (0.09 + 0.13 * pCl) * (0.9 + 0.1 * (1 - (activeDs.healthIndex ?? 0.5)));
      const clStr  = clamp((0.05 + 0.09 * pCl) + clamp(clAmp * chlorideTriWithWarble(phases.Cl, aTAxisNorm), 0, 1), 0, 1);
      const co2Str = clamp(0.26 + 0.18 * (1 - pCO2), 0, 0.62);
      const caStr  = clamp(0.06 + 0.08 * (1 - pCO2), 0, 0.30);

      // Beam hues — data-driven anchors + wobble + nudges
      const nHue  = nHueAnchor + (10 + 8 * pN) * Math.sin(phases.N * 0.93 + 0.14);
      const crHue = crHueAnchor + (8 + 5 * pCr) * Math.sin(phases.C * 1.07 + 0.08);
      const naHue = sodiumHueDeg(pNa, activeBaseHueDeg) + nudgeNa + (16 + 4 * pNa) * Math.sin(phases.Na * 2 * Math.PI * 0.82 + 0.32);
      const clHue = chlorideHueDeg(pCl, activeBaseHueDeg) + nudgeCl + (12 + 6 * pCl) * Math.sin(phases.Cl * 2 * Math.PI * 0.88 - 0.24);
      let co2Hue  = activeBaseHueDeg - (24 + 12 * pCO2) + nudgeCO2 + (12 + 6 * pCO2) * Math.sin(phases.CO2 * 1.0 + 0.2);
      co2Hue = guardHueGap(activeBaseHueDeg, co2Hue, 30, -1);
      let caHue   = activeBaseHueDeg + (45 + 25 * pCa) + nudgeCa + (10 + 6 * aPrNorm) * Math.sin(phases.Ca * 0.92 - 0.13);
      caHue = guardHueGap(activeBaseHueDeg, caHue, 32, +1);

      // Set all uniforms
      if (locs.time)              gl.uniform1f(locs.time, nowSec);
      if (locs.resolution)        gl.uniform2f(locs.resolution, cachedW, cachedH);
      if (locs.glucose)           gl.uniform1f(locs.glucose, aHue);
      if (locs.potassium)         gl.uniform1f(locs.potassium, aSat);
      if (locs.egfr)              gl.uniform1f(locs.egfr, aBri);
      if (locs.totalYears)        gl.uniform1f(locs.totalYears, totalYears);
      if (locs.lifespanYears)     gl.uniform1f(locs.lifespanYears, lifespanYears);
      if (locs.pAxisNorm)         gl.uniform1f(locs.pAxisNorm, aPAxisNorm);
      if (locs.rAxisNorm)         gl.uniform1f(locs.rAxisNorm, aRAxisNorm);
      if (locs.qtcNorm)           gl.uniform1f(locs.qtcNorm, aQtcNorm);
      const aQtcPercentile = percentile(activeDs.ecg.qtcInterval, sortedQtcValues);
      if (locs.qtcPercentile)     gl.uniform1f(locs.qtcPercentile, aQtcPercentile);
      const aPAxisPct     = percentile(activeDs.ecg.pAxis,       sortedPAxisValues);
      const aRAxisPct     = percentile(activeDs.ecg.rAxis,       sortedRAxisValues);
      const aTAxisPct     = percentile(activeDs.ecg.tAxis,       sortedTAxisValues);
      const aVentRatePct  = percentile(activeDs.ecg.ventRate,    sortedVentRateValues);
      const aPrPct        = percentile(activeDs.ecg.prInterval,  sortedPRValues);
      const aQrsPct       = percentile(activeDs.ecg.qrsInterval, sortedQRSValues);
      const aQrsTAnglePct = percentile(aRawQrsTAngle,            sortedQRSTAngleValues);
      if (locs.pAxisPct)     gl.uniform1f(locs.pAxisPct,     aPAxisPct);
      if (locs.rAxisPct)     gl.uniform1f(locs.rAxisPct,     aRAxisPct);
      if (locs.tAxisPct)     gl.uniform1f(locs.tAxisPct,     aTAxisPct);
      if (locs.ventRatePct)  gl.uniform1f(locs.ventRatePct,  aVentRatePct);
      if (locs.prPct)        gl.uniform1f(locs.prPct,        aPrPct);
      if (locs.qrsPct)       gl.uniform1f(locs.qrsPct,       aQrsPct);
      if (locs.qrsTAnglePct) gl.uniform1f(locs.qrsTAnglePct, aQrsTAnglePct);
      if (locs.qrsNorm)      gl.uniform1f(locs.qrsNorm,      aQrsNorm);
      if (locs.prNorm)       gl.uniform1f(locs.prNorm,      aPrNorm);
      if (locs.ventRateNorm) gl.uniform1f(locs.ventRateNorm, aVentRateNorm);
      if (locs.tAxisNorm)    gl.uniform1f(locs.tAxisNorm,   aTAxisNorm);
      if (locs.qrsTAngle)    gl.uniform1f(locs.qrsTAngle,   aQrsTAngle);
      if (locs.inheritedHueDeg)     gl.uniform1f(locs.inheritedHueDeg, statics.u_inheritedHueDeg);
      if (locs.inheritedStrength)   gl.uniform1f(locs.inheritedStrength, inheritedStrength);
      if (locs.reanimationProgress) gl.uniform1f(locs.reanimationProgress, 0.0);
      if (locs.partnerInheritedHue) gl.uniform1f(locs.partnerInheritedHue, 0.0);
      if (locs.isLiberated)         gl.uniform1f(locs.isLiberated, 0.0);
      if (locs.voidProgress)        gl.uniform1f(locs.voidProgress, 0.0);
      if (locs.bunCreat)            gl.uniform1f(locs.bunCreat, aBunCreat);
      if (locs.nStr)   gl.uniform1f(locs.nStr, nStr);
      if (locs.nHue)   gl.uniform1f(locs.nHue, nHue);
      if (locs.nR)     gl.uniform1f(locs.nR, pN);
      if (locs.crStr)  gl.uniform1f(locs.crStr, crStr);
      if (locs.crHue)  gl.uniform1f(locs.crHue, crHue);
      if (locs.crR)    gl.uniform1f(locs.crR, pCr);
      if (locs.naStr)  gl.uniform1f(locs.naStr, naStr);
      if (locs.naHue)  gl.uniform1f(locs.naHue, naHue);
      if (locs.naR)    gl.uniform1f(locs.naR, pNa);
      if (locs.clStr)  gl.uniform1f(locs.clStr, clStr);
      if (locs.clHue)  gl.uniform1f(locs.clHue, clHue);
      if (locs.clR)    gl.uniform1f(locs.clR, pCl);
      if (locs.co2Str) gl.uniform1f(locs.co2Str, co2Str);
      if (locs.co2Hue) gl.uniform1f(locs.co2Hue, co2Hue);
      if (locs.caStr)  gl.uniform1f(locs.caStr, caStr);
      if (locs.caHue)  gl.uniform1f(locs.caHue, caHue);
      if (locs.caR)    gl.uniform1f(locs.caR, pCa);
      // Beam RGB vec3 uniforms (shader uses these, not the hue degree floats)
      if (locs.nRGB)    gl.uniform3fv(locs.nRGB,   hsbToRgb(nHue,   0.90, 0.78));
      if (locs.crRGB)   gl.uniform3fv(locs.crRGB,  hsbToRgb(crHue,  0.90, 0.78));
      if (locs.naRGB)   gl.uniform3fv(locs.naRGB,  hsbToRgb(naHue,  0.94, 0.80));
      if (locs.clRGB)   gl.uniform3fv(locs.clRGB,  hsbToRgb(clHue,  0.75, 0.85));
      if (locs.co2RGB)  gl.uniform3fv(locs.co2RGB, hsbToRgb(co2Hue, 0.75, 1.00));
      if (locs.caRGB)   gl.uniform3fv(locs.caRGB,  hsbToRgb(caHue,  0.70, 0.95));
      if (locs.nirvanaRGB) gl.uniform3fv(locs.nirvanaRGB, hsbToRgb(statics.u_inheritedHueDeg, 0.85, 0.92));
      if (locs.partnerRGB) gl.uniform3fv(locs.partnerRGB, hsbToRgb(0.0, 0.85, 0.92));

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(draw);
    }

    gl.clearColor(0, 0, 0, 1);
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [id, vertexSrc, fragmentSrc]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", aspectRatio: "3 / 2", maxWidth: "100%", maxHeight: "100%" }}
    />
  );
}
