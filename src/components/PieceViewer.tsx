"use client";

import { useEffect, useRef } from "react";
import { minMaxValues } from "@/data/health_data_sets";
import {
  healthDataSets,
  computeHSBFromStats,
  computeStaticUniforms,
  lifespanYearsFromHashDigits,
  normalize,
} from "@/lib/pieceUtils";

const HASH = 88; // placeholder until mint

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const c = canvas!; // non-null ref for use inside closures

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
      decayPerYear:      u("u_decayPerYear"),
      totalYears:        u("u_totalYears"),
      lifespanYears:     u("u_lifespanYears"),
      pAxisNorm:         u("u_pAxisNorm"),
      rAxisNorm:         u("u_rAxisNorm"),
      qtcNorm:           u("u_qtcNorm"),
      prNorm:            u("u_prNorm"),
      ventRateNorm:      u("u_ventRateNorm"),
      tAxisNorm:         u("u_tAxisNorm"),
      qrsTAngle:         u("u_qrsTAngle"),
      inheritedHueDeg:   u("u_inheritedHueDeg"),
      inheritedStrength: u("u_inheritedStrength"),
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
    };

    // Dataset-derived constants
    const ds = healthDataSets[id];
    const statics = computeStaticUniforms(id);
    const lifespanYears = lifespanYearsFromHashDigits(HASH);
    const { hue } = computeHSBFromStats(ds, healthDataSets);
    const baseHueDeg = hue * 360;
    const decayPerYear = statics.u_decayPerYear;

    // BUN/Cr range
    const allBCR = healthDataSets
      .map((d) => d.labs.nitrogen / Math.max(0.1, d.labs.creatinine))
      .sort((a, b) => a - b);
    const bcP05 = allBCR[Math.floor(0.05 * (allBCR.length - 1))];
    const bcP95 = allBCR[Math.ceil(0.95 * (allBCR.length - 1))];
    const bcRatio = ds.labs.nitrogen / Math.max(0.1, ds.labs.creatinine);
    const bunCreatRatioNorm = clamp(
      (bcRatio - bcP05) / Math.max(1e-9, bcP95 - bcP05),
      0,
      1
    );

    // QRS-T angle
    const allAngles = healthDataSets.map((d) =>
      Math.abs(d.ecg.rAxis - d.ecg.tAxis)
    );
    const angMin = Math.min(...allAngles);
    const angMax = Math.max(...allAngles);
    const qrsTAngle = clamp(
      (Math.abs(ds.ecg.rAxis - ds.ecg.tAxis) - angMin) /
        Math.max(1e-6, angMax - angMin),
      0,
      1
    );

    // Normalized ECG axes
    const pAxisNorm = clamp(
      normalize(ds.ecg.pAxis, minMaxValues.pAxis.min, minMaxValues.pAxis.max),
      0, 1
    );
    const rAxisNorm = clamp(
      normalize(ds.ecg.rAxis, minMaxValues.rAxis.min, minMaxValues.rAxis.max),
      0, 1
    );
    const qtcNorm = clamp(
      normalize(ds.ecg.qtcInterval, minMaxValues.qtcInterval.min, minMaxValues.qtcInterval.max),
      0, 1
    );
    const prNorm = clamp(
      normalize(ds.ecg.prInterval, minMaxValues.prInterval.min, minMaxValues.prInterval.max),
      0, 1
    );
    const ventRateNorm = clamp(
      normalize(ds.ecg.ventRate, minMaxValues.ventRate.min, minMaxValues.ventRate.max),
      0, 1
    );
    const tAxisNorm = clamp(
      normalize(ds.ecg.tAxis, minMaxValues.tAxis.min, minMaxValues.tAxis.max),
      0, 1
    );

    // Beam percentiles (winsorized)
    function winsorized(labKey: string) {
      const vals = healthDataSets
        .map((d) => (d.labs as Record<string, number>)[labKey])
        .sort((a, b) => a - b);
      const p05 = vals[Math.floor(0.05 * (vals.length - 1))];
      const p95 = vals[Math.ceil(0.95 * (vals.length - 1))];
      const v = (ds.labs as Record<string, number>)[labKey];
      return clamp(
        (Math.max(p05, Math.min(p95, v)) - p05) / Math.max(1e-9, p95 - p05),
        0,
        1
      );
    }

    const pN   = winsorized("nitrogen");
    const pCr  = winsorized("creatinine");
    const pNa  = winsorized("sodium");
    const pCl  = winsorized("chloride");
    const pCO2 = winsorized("carbonDioxide");
    const pCa  = winsorized("calcium");

    // Beam phases
    const phases = { N: 0, C: 0, Na: 0, Cl: 0, CO2: 0, Ca: 0 };

    function sodiumArrival(t: number) {
      const start = 0.2 * lifespanYears;
      const ramp = Math.max(0.1 * lifespanYears, 0.25);
      return clamp((t - start) / ramp, 0, 1);
    }
    function chlorideArrival(t: number) {
      const start = 0.6 * lifespanYears;
      const ramp = Math.max(0.08 * lifespanYears, 0.2);
      return clamp((t - start) / ramp, 0, 1);
    }

    const inscriptionUnix = 1704067200;
    const YEARS_PER_SEC = 1 / (365 * 24 * 3600);
    let lastT = performance.now() / 1000;

    // Cache canvas size in physical pixels — updated only by ResizeObserver, not on every frame
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

      // Advance beam phases
      phases.N   += (dt * 2 * Math.PI) / 10.0;
      phases.C   += (dt * 2 * Math.PI) / 12.0;
      phases.Na  = (phases.Na  + dt / 7.0)  % 1;
      phases.Cl  = (phases.Cl  + dt / 9.0)  % 1;
      phases.CO2 += (dt * 2 * Math.PI) / 16.0;
      phases.Ca  += (dt * 2 * Math.PI) / 24.0;

      const arrNa = sodiumArrival(totalYears);
      const arrCl = chlorideArrival(totalYears);

      // Beam strengths
      const nStr  = 0.35 + 0.20 * clamp(0.58 * (0.5 + 0.5 * Math.sin(phases.N)), 0, 1);
      const crStr = 0.30 + 0.20 * clamp((0.4 + 0.3 * pCr) * (0.5 + 0.5 * Math.sin(phases.C)), 0, 1);
      const naAmp = arrNa * (0.08 + 0.12 * pNa);
      const naArrivedStr = clamp(naAmp * (0.25 + 0.75 * Math.exp(-0.5 * Math.pow(((phases.Na % 1) - 0.5) / 0.12, 2))), 0, 1);
      const naStr = clamp((0.06 + 0.10 * pNa) + naArrivedStr, 0, 1);
      const clAmp = arrCl * (0.09 + 0.13 * pCl);
      const tri = 1 - Math.abs(2 * (phases.Cl - Math.floor(phases.Cl + 0.5)));
      const clStr = clamp((0.05 + 0.09 * pCl) + clamp(clAmp * tri, 0, 1), 0, 1);
      const co2Str = clamp(0.26 + 0.18 * (1 - pCO2), 0, 0.62);
      const caStr  = clamp(0.06 + 0.08 * (1 - pCO2), 0, 0.30);

      // Beam hues
      const nHue   = baseHueDeg + (10 + 8 * pN)   * Math.sin(phases.N   * 0.93 + 0.14);
      const crHue  = baseHueDeg + 15 + (8 + 5 * pCr) * Math.sin(phases.C * 1.07 + 0.08);
      const naHue  = baseHueDeg - 20 + (16 + 4 * pNa) * Math.sin(phases.Na * 2 * Math.PI * 0.82 + 0.32);
      const clHue  = baseHueDeg + 30 + (12 + 6 * pCl) * Math.sin(phases.Cl * 2 * Math.PI * 0.88 - 0.24);
      const co2Hue = baseHueDeg - 30 + (12 + 6 * pCO2) * Math.sin(phases.CO2 * 1.0 + 0.2);
      const caHue  = baseHueDeg + 55 + (10 + 6 * prNorm) * Math.sin(phases.Ca * 0.92 - 0.13);

      // Set all uniforms
      if (locs.time)              gl.uniform1f(locs.time, nowSec);
      if (locs.resolution)        gl.uniform2f(locs.resolution, cachedW, cachedH);
      if (locs.glucose)           gl.uniform1f(locs.glucose, statics.u_glucose);
      if (locs.potassium)         gl.uniform1f(locs.potassium, statics.u_potassium);
      if (locs.egfr)              gl.uniform1f(locs.egfr, statics.u_eGFR);
      if (locs.decayPerYear)      gl.uniform1f(locs.decayPerYear, decayPerYear);
      if (locs.totalYears)        gl.uniform1f(locs.totalYears, totalYears);
      if (locs.lifespanYears)     gl.uniform1f(locs.lifespanYears, lifespanYears);
      if (locs.pAxisNorm)         gl.uniform1f(locs.pAxisNorm, pAxisNorm);
      if (locs.rAxisNorm)         gl.uniform1f(locs.rAxisNorm, rAxisNorm);
      if (locs.qtcNorm)           gl.uniform1f(locs.qtcNorm, qtcNorm);
      if (locs.prNorm)            gl.uniform1f(locs.prNorm, prNorm);
      if (locs.ventRateNorm)      gl.uniform1f(locs.ventRateNorm, ventRateNorm);
      if (locs.tAxisNorm)         gl.uniform1f(locs.tAxisNorm, tAxisNorm);
      if (locs.qrsTAngle)         gl.uniform1f(locs.qrsTAngle, qrsTAngle);
      if (locs.inheritedHueDeg)   gl.uniform1f(locs.inheritedHueDeg, statics.u_inheritedHueDeg);
      if (locs.inheritedStrength) gl.uniform1f(locs.inheritedStrength, inheritedStrength);
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
      if (locs.bunCreat) gl.uniform1f(locs.bunCreat, bunCreatRatioNorm);

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
      style={{ display: "block", aspectRatio: "1", maxWidth: "100%", maxHeight: "100%" }}
    />
  );
}
