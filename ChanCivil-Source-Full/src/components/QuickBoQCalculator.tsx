import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, ArrowRight, Layers, Copy, Check, Calculator } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function QuickBoQCalculator() {
  const { lang } = useLanguage();
  const km = lang === 'km';

  const [member, setMember] = useState<'beam' | 'column' | 'footing' | 'slab'>('beam');
  const [length, setLength] = useState(5.0); // m
  const [width, setWidth] = useState(0.3); // m
  const [height, setHeight] = useState(0.5); // m
  const [count, setCount] = useState(6);
  const [rebarRatio, setRebarRatio] = useState(120); // kg/m3
  const [copied, setCopied] = useState(false);

  // Calculate volume, formwork area, rebar weight
  const boq = useMemo(() => {
    const volSingle = length * width * height;
    let formSingle = 0;
    if (member === 'slab') {
      formSingle = length * width + 2 * (length + width) * height;
    } else if (member === 'column' || member === 'footing') {
      formSingle = 2 * (length + width) * height;
    } else {
      // Beam sides + soffit: 2*H + W * L
      formSingle = (2 * height + width) * length;
    }

    const totalVol = volSingle * count;
    const totalForm = formSingle * count;
    const totalRebarKg = totalVol * rebarRatio;
    const totalRebarTons = totalRebarKg / 1000;
    const cementBags = Math.round(totalVol * 7.5); // approx 350kg cement / m3 -> 7 bags

    return {
      volSingle: Number(volSingle.toFixed(3)),
      totalVol: Number(totalVol.toFixed(2)),
      totalForm: Number(totalForm.toFixed(2)),
      totalRebarKg: Math.round(totalRebarKg),
      totalRebarTons: Number(totalRebarTons.toFixed(2)),
      cementBags,
    };
  }, [member, length, width, height, count, rebarRatio]);

  const handleCopy = () => {
    const text = `ChanCivil Quick BoQ:
Element: ${member.toUpperCase()}
Quantity: ${count}
Total Concrete: ${boq.totalVol} m³
Total Rebar: ${boq.totalRebarTons} Tons (${boq.totalRebarKg} kg)
Formwork Area: ${boq.totalForm} m²
Cement (approx): ${boq.cementBags} bags (50kg)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-10 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-50 blur-3xl pointer-events-none" />

      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100/70 text-cyan-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Boxes className="h-3.5 w-3.5" />
            {km ? 'ការគណនាបរិមាណសំណង់រហ័ស' : 'QUICK BoQ ESTIMATOR'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
            {km ? 'ប៉ាន់ស្មានបរិមាណបេតុង និងដែកសរសៃ' : 'Instant Structural Material Takeoff'}
          </h2>
          <p className="mt-1.5 text-sm text-slate-600 max-w-xl">
            {km
              ? 'ជ្រើសរើសប្រភេទធាតុសំណង់ និងបញ្ចូលទំហំ ដើម្បីគណនាបរិមាណបេតុង ដែកសរសៃ និងផ្ទៃពុម្ពភ្លាមៗ។'
              : 'Select member type and dimensions to instantly compute concrete volume, rebar tonnage, and formwork area.'}
          </p>
        </div>
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-cyan-700 transition-colors"
        >
          <Calculator className="h-4 w-4" />
          {km ? 'ចូលទៅកាន់ម៉ាស៊ីនគណនាពេញលេញ' : 'Open Complete Tools Suite'}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Controls */}
        <div className="space-y-6">
          {/* Member selector tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {km ? '១. ជ្រើសរើសធាតុសំណង់ (Structural Element)' : '1. Choose Structural Member'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'beam', en: 'Beam', km: 'ធ្នឹម (Beam)' },
                { id: 'column', en: 'Column', km: 'សសរ (Column)' },
                { id: 'footing', en: 'Footing', km: 'គ្រឹះ (Footing)' },
                { id: 'slab', en: 'Slab', km: 'កម្រាល (Slab)' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMember(m.id as any);
                    if (m.id === 'slab') {
                      setLength(6.0);
                      setWidth(4.0);
                      setHeight(0.15);
                      setCount(1);
                    } else if (m.id === 'column') {
                      setLength(0.4);
                      setWidth(0.4);
                      setHeight(3.6);
                      setCount(8);
                    } else if (m.id === 'footing') {
                      setLength(1.5);
                      setWidth(1.5);
                      setHeight(0.45);
                      setCount(6);
                    } else {
                      setLength(5.0);
                      setWidth(0.3);
                      setHeight(0.5);
                      setCount(6);
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm border transition-all text-center ${
                    member === m.id
                      ? 'bg-navy text-white border-navy shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {km ? m.km : m.en}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Inputs */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {member === 'column' ? (km ? 'កម្ពស់សសរ H (m)' : 'Height H (m)') : (km ? 'ប្រវែង L (m)' : 'Length L (m)')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={length}
                  onChange={(e) => setLength(parseFloat(e.target.value) || 0.1)}
                  className="input font-bold text-navy bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {km ? 'ទទឹង W (m)' : 'Width W (m)'}
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value) || 0.05)}
                  className="input font-bold text-navy bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {member === 'slab' ? (km ? 'កម្រាស់កម្រាល (m)' : 'Thickness (m)') : (km ? 'កម្ពស់/កម្រាស់ (m)' : 'Depth/Height (m)')}
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 0.05)}
                  className="input font-bold text-navy bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {km ? 'ចំនួនសរុប (Quantity / Units)' : 'Member Count (Units)'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="input font-bold text-brand bg-white"
                />
              </div>
            </div>

            {/* Rebar density quick selector */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-600">
                  {km ? 'ដង់ស៊ីតេដែកសរសៃ (Rebar Density):' : 'Rebar Ratio:'}
                </span>
                <span className="font-mono text-xs font-bold text-navy">{rebarRatio} kg/m³</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: km ? 'ស្រាល (90 kg/m³)' : 'Light (90 kg/m³)', val: 90 },
                  { label: km ? 'មធ្យម (120 kg/m³)' : 'Standard (120 kg/m³)', val: 120 },
                  { label: km ? 'ធ្ងន់ (160 kg/m³)' : 'Heavy (160 kg/m³)', val: 160 },
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setRebarRatio(r.val)}
                    className={`py-1.5 px-2 text-xs rounded-lg border font-semibold transition-all ${
                      rebarRatio === r.val
                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Result Summary Cards */}
        <div className="flex flex-col justify-between rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-900 via-navy to-slate-900 p-6 text-white shadow-lg">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  {km ? 'លទ្ធផលគណនាភ្លាមៗ' : 'INSTANT TAKEOFF RESULTS'}
                </span>
                <h3 className="text-base font-bold text-white">
                  {count} × {member.toUpperCase()} ({length}m × {width}m × {height}m)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-400/20 text-cyan-200 text-xs font-bold border border-cyan-400/30">
                Live Sync
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-4 border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {km ? 'មាឌបេតុងសរុប' : 'Total Concrete'}
                </span>
                <p className="mt-1 font-mono text-2xl sm:text-3xl font-extrabold text-white">
                  {boq.totalVol} <span className="text-xs font-normal text-cyan-300">m³</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  ~{boq.volSingle} m³ per unit
                </p>
              </div>

              <div className="rounded-xl bg-cyan-500/20 p-4 border border-cyan-400/30 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                  {km ? 'ទម្ងន់ដែកសរុប' : 'Total Rebar'}
                </span>
                <p className="mt-1 font-mono text-2xl sm:text-3xl font-extrabold text-cyan-200">
                  {boq.totalRebarTons} <span className="text-xs font-normal text-white">Tons</span>
                </p>
                <p className="mt-1 text-[11px] text-cyan-300/80">
                  ({boq.totalRebarKg.toLocaleString()} kg)
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4 border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {km ? 'ផ្ទៃពុម្ព Formwork' : 'Formwork Area'}
                </span>
                <p className="mt-1 font-mono text-xl sm:text-2xl font-bold text-white">
                  {boq.totalForm} <span className="text-xs font-normal text-cyan-300">m²</span>
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4 border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {km ? 'ស៊ីម៉ងត៍ប៉ាន់ស្មាន' : 'Cement Bags'}
                </span>
                <p className="mt-1 font-mono text-xl sm:text-2xl font-bold text-white">
                  ~{boq.cementBags} <span className="text-xs font-normal text-cyan-300">Bags</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-400">50kg site bags</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 px-4 text-xs font-bold text-navy hover:bg-cyan-400 transition-colors shadow-md"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? (km ? 'បានចម្លង!' : 'Copied!') : (km ? 'ចម្លងតារាងលទ្ធផល' : 'Copy Takeoff')}
            </button>
            <Link
              to="/tools"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 py-3 px-4 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
            >
              <Layers className="h-4 w-4 text-cyan-300" />
              {km ? 'ឧបករណ៍លម្អិត' : 'Deep Analysis'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
