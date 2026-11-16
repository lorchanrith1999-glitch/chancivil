import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, Activity, TrendingUp, Sliders } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function InteractiveBeamSimulator() {
  const { lang } = useLanguage();
  const km = lang === 'km';

  // State for interactive sliders
  const [span, setSpan] = useState(6.0); // meters (3m - 12m)
  const [load, setLoad] = useState(25.0); // kN/m (5 kN/m - 60 kN/m)
  const [diagramMode, setDiagramMode] = useState<'moment' | 'shear'>('moment');

  // Calculations for simply supported beam with uniform distributed load (UDL)
  const results = useMemo(() => {
    const L = Number(span) || 1;
    const w = Number(load) || 1;

    // Maximum Bending Moment: M_max = (w * L^2) / 8  (kN.m)
    const maxMoment = (w * Math.pow(L, 2)) / 8;

    // Maximum Shear Force: V_max = (w * L) / 2  (kN)
    const maxShear = (w * L) / 2;

    // Approximate midspan deflection delta for typical RC beam (E = 25 GPa, I = b*h^3/12 for 300x550mm)
    // E = 25e6 kN/m^2, I = 0.3 * (0.55)^3 / 12 = 0.00416 m^4 -> EI ~ 104,000 kN.m^2
    const EI = 104000;
    const deltaMeters = (5 * w * Math.pow(L, 4)) / (384 * EI);
    const deltaMm = deltaMeters * 1000;
    const allowableDeltaMm = (L * 1000) / 240; // L / 240 standard limit

    return {
      moment: Number(maxMoment.toFixed(1)),
      shear: Number(maxShear.toFixed(1)),
      deflection: Number(deltaMm.toFixed(1)),
      allowableDeflection: Number(allowableDeltaMm.toFixed(1)),
      isDeflectionOk: deltaMm <= allowableDeltaMm,
    };
  }, [span, load]);

  // Generate SVG path points for Bending Moment Diagram (parabola)
  const momentSvgPath = useMemo(() => {
    const startX = 40;
    const endX = 320;
    const baselineY = 25;
    const maxDrop = 55;

    let path = `M ${startX} ${baselineY}`;
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const x = startX + frac * (endX - startX);
      // Parabolic equation: 4 * frac * (1 - frac) reaches 1 at frac=0.5
      const y = baselineY + 4 * frac * (1 - frac) * maxDrop;
      path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    path += ` L ${endX} ${baselineY} Z`;
    return path;
  }, []);

  // Generate SVG path points for Shear Force Diagram (linear diagonal: +V at left, -V at right)
  const shearSvgPath = useMemo(() => {
    const startX = 40;
    const endX = 320;
    const baselineY = 45;
    const drop = 35;

    // Left triangle (+V): from (startX, baselineY) up to (startX, baselineY - drop), down to (midX, baselineY)
    // Right triangle (-V): from (midX, baselineY) down to (endX, baselineY + drop), up to (endX, baselineY)
    const midX = (startX + endX) / 2;
    return {
      positive: `M ${startX} ${baselineY} L ${startX} ${baselineY - drop} L ${midX} ${baselineY} Z`,
      negative: `M ${midX} ${baselineY} L ${endX} ${baselineY + drop} L ${endX} ${baselineY} Z`,
      baselineY,
      startX,
      endX,
      midX,
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/20 bg-[#122840]/90 p-5 shadow-2xl backdrop-blur-md sm:p-6 text-white transition-all">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
            <Activity className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              {km ? 'ការពិសោធន៍ធ្នឹមបន្តផ្ទាល់' : 'LIVE BEAM SOLVER'}
            </p>
            <h3 className="text-sm font-bold text-white">
              {km ? 'ការគណនាបន្ទុក និងម៉ូម៉ង់រចនា' : 'Simply Supported Beam (UDL)'}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-950/50 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setDiagramMode('moment')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              diagramMode === 'moment'
                ? 'bg-cyan-500 text-navy font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            BMD (M)
          </button>
          <button
            type="button"
            onClick={() => setDiagramMode('shear')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              diagramMode === 'shear'
                ? 'bg-cyan-500 text-navy font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            SFD (V)
          </button>
        </div>
      </div>

      {/* Live Interactive SVG Diagram */}
      <div className="relative rounded-xl border border-white/10 bg-[#0a1827] p-3 text-center overflow-hidden">
        {/* Load indicators (arrows) */}
        <div className="mb-1 flex justify-between px-10 text-[9px] font-mono text-cyan-300/80">
          <span>w = {load} kN/m</span>
          <span>Span L = {span} m</span>
        </div>

        <svg viewBox="0 0 360 110" className="w-full h-auto max-h-32 select-none">
          {/* Background grid */}
          <g stroke="#ffffff" strokeWidth="0.5" opacity="0.07">
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`gh${i}`} x1="20" y1={10 + i * 11} x2="340" y2={10 + i * 11} />
            ))}
            {Array.from({ length: 17 }, (_, i) => (
              <line key={`gv${i}`} x1={20 + i * 20} y1="10" x2={20 + i * 20} y2="100" />
            ))}
          </g>

          {/* Beam element */}
          <line x1="40" y1="25" x2="320" y2="25" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />

          {/* Supports: Pin support left */}
          <polygon points="40,25 32,38 48,38" fill="#94a3b8" />
          <line x1="28" y1="40" x2="52" y2="40" stroke="#64748b" strokeWidth="2" />

          {/* Supports: Roller support right */}
          <polygon points="320,25 312,38 328,38" fill="#94a3b8" />
          <circle cx="316" cy="42" r="2.5" fill="#64748b" />
          <circle cx="324" cy="42" r="2.5" fill="#64748b" />
          <line x1="308" y1="46" x2="332" y2="46" stroke="#64748b" strokeWidth="2" />

          {/* Distributed load arrows on top of beam */}
          {Array.from({ length: 9 }, (_, i) => {
            const x = 50 + i * 32.5;
            return (
              <g key={`arr${i}`} stroke="#f59e0b" strokeWidth="1.5">
                <line x1={x} y1="8" x2={x} y2="21" markerEnd="url(#arrow)" />
                <polygon points={`${x},23 ${x - 2.5},17 ${x + 2.5},17`} fill="#f59e0b" />
              </g>
            );
          })}
          <line x1="48" y1="8" x2="312" y2="8" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />

          {/* Render BMD or SFD */}
          {diagramMode === 'moment' ? (
            <g>
              <path d={momentSvgPath} fill="rgba(56, 189, 248, 0.22)" stroke="#38bdf8" strokeWidth="2" />
              <text x="180" y="70" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">
                Mmax = {results.moment} kN·m
              </text>
            </g>
          ) : (
            <g>
              <path d={shearSvgPath.positive} fill="rgba(34, 197, 94, 0.25)" stroke="#22c55e" strokeWidth="1.8" />
              <path d={shearSvgPath.negative} fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1.8" />
              <line x1={shearSvgPath.startX} y1={shearSvgPath.baselineY} x2={shearSvgPath.endX} y2={shearSvgPath.baselineY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
              <text x="75" y="32" fill="#22c55e" fontSize="9" fontWeight="bold" fontFamily="monospace">
                +{results.shear} kN
              </text>
              <text x="285" y="75" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">
                -{results.shear} kN
              </text>
            </g>
          )}
        </svg>

        {/* Real-time Result Values Cards */}
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-left">
          <div className="rounded-lg bg-white/5 p-2 border border-white/5">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Max Moment</span>
            <p className="font-mono text-xs sm:text-sm font-extrabold text-cyan-300">
              {results.moment} <span className="text-[9px] font-normal text-slate-400">kN·m</span>
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-2 border border-white/5">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Max Shear</span>
            <p className="font-mono text-xs sm:text-sm font-extrabold text-amber-300">
              {results.shear} <span className="text-[9px] font-normal text-slate-400">kN</span>
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-2 border border-white/5">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Deflection Δ</span>
            <p className="font-mono text-xs sm:text-sm font-extrabold text-emerald-400">
              {results.deflection} <span className="text-[9px] font-normal text-slate-400">mm</span>
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Controls (Sliders) */}
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1 font-semibold">
              <Sliders className="h-3 w-3 text-cyan-400" />
              {km ? 'ប្រវែងធ្នឹម L (Span)' : 'Span Length (L)'}
            </span>
            <span className="font-mono font-bold text-cyan-300">{span} m</span>
          </div>
          <input
            type="range"
            min="3"
            max="12"
            step="0.5"
            value={span}
            onChange={(e) => setSpan(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1 font-semibold">
              <TrendingUp className="h-3 w-3 text-amber-400" />
              {km ? 'បន្ទុកបន្តបន្ទាប់ w (UDL Load)' : 'Uniform Load (w)'}
            </span>
            <span className="font-mono font-bold text-amber-300">{load} kN/m</span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="1"
            value={load}
            onChange={(e) => setLoad(parseFloat(e.target.value))}
            className="w-full accent-amber-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Launch CTA directly to Tools */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          {km ? 'ស្តង់ដារ ACI 318-19 & Eurocode 2' : 'Formulas: wL²/8 · wL/2'}
        </span>
        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors"
        >
          <Calculator className="h-3.5 w-3.5" />
          {km ? 'បើកម៉ាស៊ីនគណនាពេញលេញ' : 'Open Full ACI 318 Tool'}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
