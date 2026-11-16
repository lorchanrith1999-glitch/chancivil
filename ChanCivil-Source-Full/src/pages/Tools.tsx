import { useState, useMemo } from 'react';
import {
  Calculator,
  Layers,
  Boxes,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Ruler,
} from 'lucide-react';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';

type Tab = 'beam' | 'boq' | 'rebar' | 'units';

const METRIC_BARS = [
  { size: 'T10', dia: 10, area: 78.5, weight: 0.617 },
  { size: 'T12', dia: 12, area: 113.1, weight: 0.888 },
  { size: 'T16', dia: 16, area: 201.1, weight: 1.58 },
  { size: 'T20', dia: 20, area: 314.2, weight: 2.47 },
  { size: 'T25', dia: 25, area: 490.9, weight: 3.85 },
  { size: 'T28', dia: 28, area: 615.8, weight: 4.83 },
  { size: 'T32', dia: 32, area: 804.2, weight: 6.31 },
];

export default function Tools() {
  const { lang } = useLanguage();
  const km = lang === 'km';
  const [activeTab, setActiveTab] = useState<Tab>('beam');
  const [copied, setCopied] = useState(false);

  // TAB 1: RC BEAM FLEXURE DESIGN CHECK (ACI 318-19)
  const [beamWidth, setBeamWidth] = useState(300);
  const [beamHeight, setBeamHeight] = useState(550);
  const [beamDepth, setBeamDepth] = useState(500);
  const [fc, setFc] = useState(28);
  const [fy, setFy] = useState(420);
  const [barCount, setBarCount] = useState(3);
  const [barDia, setBarDia] = useState(25);
  const [factoredMoment, setFactoredMoment] = useState(220);

  const beamCalc = useMemo(() => {
    const As = barCount * (Math.PI * Math.pow(barDia, 2) / 4);
    let beta1 = 0.85;
    if (fc > 28) {
      beta1 = Math.max(0.65, 0.85 - (0.05 * (fc - 28)) / 7);
    }
    const a = (As * fy) / (0.85 * fc * beamWidth);
    const c = a / beta1;
    const et = c > 0 ? 0.003 * ((beamDepth - c) / c) : 0.01;
    let phi = 0.90;
    if (et <= 0.002) {
      phi = 0.65;
    } else if (et < 0.005) {
      phi = 0.65 + 0.25 * ((et - 0.002) / 0.003);
    }
    const Mn = (As * fy * (beamDepth - a / 2)) / 1e6;
    const phiMn = phi * Mn;
    const As_min1 = (0.25 * Math.sqrt(fc) / fy) * beamWidth * beamDepth;
    const As_min2 = (1.4 / fy) * beamWidth * beamDepth;
    const As_min = Math.max(As_min1, As_min2);

    return {
      As: Math.round(As),
      beta1: Number(beta1.toFixed(3)),
      a: Number(a.toFixed(1)),
      c: Number(c.toFixed(1)),
      et: Number(et.toFixed(4)),
      phi: Number(phi.toFixed(3)),
      Mn: Number(Mn.toFixed(1)),
      phiMn: Number(phiMn.toFixed(1)),
      As_min: Math.round(As_min),
      isTensionControlled: et >= 0.005,
      isAsMinOk: As >= As_min,
      dcr: Number((phiMn > 0 ? factoredMoment / phiMn : 999).toFixed(2)),
      isCapacityOk: (phiMn > 0 ? factoredMoment / phiMn : 999) <= 1.0,
    };
  }, [beamWidth, beamDepth, fc, fy, barCount, barDia, factoredMoment]);

  // TAB 2: BoQ & QUANTITY SURVEYING
  const [memberType, setMemberType] = useState<'footing' | 'column' | 'beam' | 'slab'>('beam');
  const [memL, setMemL] = useState(6.0);
  const [memW, setMemW] = useState(0.3);
  const [memH, setMemH] = useState(0.5);
  const [memCount, setMemCount] = useState(4);
  const [rebarDensity, setRebarDensity] = useState(120);

  const boqCalc = useMemo(() => {
    const volSingle = memL * memW * memH;
    let formSingle = 0;
    if (memberType === 'slab') {
      formSingle = memL * memW + 2 * (memL + memW) * memH;
    } else if (memberType === 'column' || memberType === 'footing') {
      formSingle = 2 * (memL + memW) * memH;
    } else {
      // beam sides + soffit
      formSingle = (2 * memH + memW) * memL;
    }

    const totalVol = volSingle * memCount;
    const totalForm = formSingle * memCount;
    const totalRebarKg = totalVol * rebarDensity;
    const totalRebarTons = totalRebarKg / 1000;

    return {
      volSingle: Number(volSingle.toFixed(3)),
      totalVol: Number(totalVol.toFixed(2)),
      totalForm: Number(totalForm.toFixed(2)),
      totalRebarKg: Math.round(totalRebarKg),
      totalRebarTons: Number(totalRebarTons.toFixed(2)),
      cementBags: Math.round(totalVol * 7.5),
      sandM3: Number((totalVol * 0.45).toFixed(2)),
      stoneM3: Number((totalVol * 0.85).toFixed(2)),
    };
  }, [memberType, memL, memW, memH, memCount, rebarDensity]);

  // TAB 3: UNIT CONVERTER
  const [unitCategory, setUnitCategory] = useState<'stress' | 'force' | 'moment' | 'length'>('stress');
  const [unitValue, setUnitValue] = useState(25);

  const convertedUnits = useMemo(() => {
    const v = Number(unitValue) || 0;
    if (unitCategory === 'stress') {
      return [
        { label: 'Megapascal (MPa)', val: v, primary: true },
        { label: 'Kilopascal (kPa)', val: v * 1000 },
        { label: 'Pound / sq inch (psi)', val: Number((v * 145.038).toFixed(1)) },
        { label: 'Kip / sq inch (ksi)', val: Number((v * 0.145038).toFixed(3)) },
        { label: 'Bar', val: Number((v * 10).toFixed(2)) },
        { label: 'kgf/cm²', val: Number((v * 10.1972).toFixed(2)) },
      ];
    } else if (unitCategory === 'force') {
      return [
        { label: 'Kilonewton (kN)', val: v, primary: true },
        { label: 'Newton (N)', val: v * 1000 },
        { label: 'Kip (kips)', val: Number((v * 0.224809).toFixed(3)) },
        { label: 'Pound-force (lbf)', val: Number((v * 224.809).toFixed(1)) },
        { label: 'Tonne-force (tf)', val: Number((v * 0.101972).toFixed(3)) },
        { label: 'Kilogram-force (kgf)', val: Number((v * 101.972).toFixed(1)) },
      ];
    } else if (unitCategory === 'moment') {
      return [
        { label: 'Kilonewton-meter (kN·m)', val: v, primary: true },
        { label: 'Newton-meter (N·m)', val: v * 1000 },
        { label: 'Kip-foot (kip·ft)', val: Number((v * 0.737562).toFixed(3)) },
        { label: 'Kip-inch (kip·in)', val: Number((v * 8.85075).toFixed(2)) },
        { label: 'Tonne-meter (tf·m)', val: Number((v * 0.101972).toFixed(3)) },
      ];
    } else {
      return [
        { label: 'Meters (m)', val: v, primary: true },
        { label: 'Millimeters (mm)', val: v * 1000 },
        { label: 'Feet (ft)', val: Number((v * 3.28084).toFixed(3)) },
        { label: 'Inches (in)', val: Number((v * 39.3701).toFixed(2)) },
      ];
    }
  }, [unitCategory, unitValue]);

  const copyResults = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Seo
        title={km ? 'ឧបករណ៍គណនាវិស្វកម្ម — ChanCivil' : 'Engineering Tools & Calculators — ChanCivil'}
        description={km ? 'ឧបករណ៍គណនាបេតុងអាមេ BoQ ប៉ាន់ស្មានសម្ភារៈ ដែកសរសៃ និងប្រព័ន្ធបំប្លែងខ្នាត យោងតាមស្តង់ដារ ACI 318។' : 'Interactive structural engineering calculators, ACI 318-19 RC beam design, BoQ quantity estimator, rebar table and unit converter.'}
        path="/tools"
      />

      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="container-page py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            {km ? 'ឧបករណ៍គណនាវិស្វកម្មជាក់ស្តែង' : 'CHANCIVIL ENGINEERING TOOLBOX'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold !text-white">
            {km ? 'ឧបករណ៍ និងម៉ាស៊ីនគណនាវិស្វកម្ម' : 'Practical Engineering Calculators & BoQ Suite'}
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300 text-base sm:text-lg">
            {km
              ? 'រចនាឡើងសម្រាប់ការងារវិស្វកម្មរចនាសម្ព័ន្ធ និងការដ្ឋានជាក់ស្តែង ផ្អែកលើស្តង់ដារ ACI 318-19 និងដំណើរការគណនាច្បាស់លាស់។'
              : 'Interactive design calculation tools, BoQ material estimation, rebar properties, and structural conversions built for daily engineering practice.'}
          </p>

          <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-800 pb-px">
            <button
              onClick={() => setActiveTab('beam')}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-semibold text-sm transition-colors ${
                activeTab === 'beam'
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              {km ? 'គណនាធ្នឹម ACI 318-19' : 'RC Beam Flexure (ACI 318)'}
            </button>
            <button
              onClick={() => setActiveTab('boq')}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-semibold text-sm transition-colors ${
                activeTab === 'boq'
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Boxes className="w-4 h-4" />
              {km ? 'ប៉ាន់ស្មាន BoQ & សម្ភារៈ' : 'BoQ & Quantity Surveying'}
            </button>
            <button
              onClick={() => setActiveTab('rebar')}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-semibold text-sm transition-colors ${
                activeTab === 'rebar'
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              {km ? 'តារាងដែកសរសៃ (Rebar Table)' : 'Rebar Spacing & Area'}
            </button>
            <button
              onClick={() => setActiveTab('units')}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-semibold text-sm transition-colors ${
                activeTab === 'units'
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Ruler className="w-4 h-4" />
              {km ? 'បំប្លែងខ្នាតវិស្វកម្ម' : 'Unit Converter'}
            </button>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        {activeTab === 'beam' && (
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-navy">
                      {km ? 'ប៉ារ៉ាម៉ែត្រផ្នែកធ្នឹម (Beam Geometry & Materials)' : 'Beam Section & Material Properties'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">ACI 318-19 Singly Reinforced Rectangular Section</p>
                  </div>
                  <span className="rounded bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 border border-cyan-200">
                    SI Metric
                  </span>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      {km ? 'ទទឹងធ្នឹម b (mm)' : 'Beam Width b (mm)'}
                    </label>
                    <input
                      type="number"
                      value={beamWidth}
                      onChange={(e) => setBeamWidth(Number(e.target.value) || 100)}
                      className="input font-semibold"
                      min={100}
                      step={25}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      {km ? 'កម្ពស់សរុប h (mm)' : 'Total Height h (mm)'}
                    </label>
                    <input
                      type="number"
                      value={beamHeight}
                      onChange={(e) => setBeamHeight(Number(e.target.value) || 150)}
                      className="input font-semibold"
                      min={150}
                      step={25}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      {km ? 'កម្ពស់គិតដល់ដែក d (mm)' : 'Effective Depth d (mm)'}
                    </label>
                    <input
                      type="number"
                      value={beamDepth}
                      onChange={(e) => setBeamDepth(Number(e.target.value) || 100)}
                      className="input font-semibold"
                      min={100}
                      step={25}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      {km ? "កម្លាំងបេតុង f'c (MPa)" : "Concrete Strength f'c (MPa)"}
                    </label>
                    <select
                      value={fc}
                      onChange={(e) => setFc(Number(e.target.value))}
                      className="input font-semibold"
                    >
                      <option value={21}>21 MPa (~3000 psi)</option>
                      <option value={24}>24 MPa (~3500 psi)</option>
                      <option value={28}>28 MPa (~4000 psi)</option>
                      <option value={32}>32 MPa (~4600 psi)</option>
                      <option value={35}>35 MPa (~5000 psi)</option>
                      <option value={40}>40 MPa (~5800 psi)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      {km ? 'កម្លាំងដែក fy (MPa)' : 'Steel Yield fy (MPa)'}
                    </label>
                    <select
                      value={fy}
                      onChange={(e) => setFy(Number(e.target.value))}
                      className="input font-semibold"
                    >
                      <option value={300}>300 MPa (Grade 40)</option>
                      <option value={420}>420 MPa (Grade 60 - Standard)</option>
                      <option value={500}>500 MPa (Grade 75 / High Strength)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      {km ? 'ម៉ូម៉ង់រងបន្ទុក Mu (kN·m)' : 'Factored Moment Mu (kN·m)'}
                    </label>
                    <input
                      type="number"
                      value={factoredMoment}
                      onChange={(e) => setFactoredMoment(Number(e.target.value) || 0)}
                      className="input font-semibold text-brand"
                      step={5}
                    />
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-bold text-navy mb-3">
                    {km ? 'ការជ្រើសរើសដែកកំហាប់ទាញ (Tension Reinforcement)' : 'Tension Reinforcement Selection'}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        {km ? 'ចំនួនដើមដែក (Bar Count)' : 'Number of Bars'}
                      </label>
                      <div className="flex items-center gap-2">
                        {[2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setBarCount(num)}
                            className={`h-9 flex-1 rounded-md font-bold text-sm border transition-colors ${
                              barCount === num
                                ? 'bg-navy text-white border-navy shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        {km ? 'ទំហំដែក (Diameter)' : 'Bar Diameter'}
                      </label>
                      <select
                        value={barDia}
                        onChange={(e) => setBarDia(Number(e.target.value))}
                        className="input font-bold"
                      >
                        {METRIC_BARS.map((b) => (
                          <option key={b.dia} value={b.dia}>
                            {b.size} (Ø {b.dia} mm) — {b.area} mm²
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Total As provided: <b className="text-navy">{barCount} × {barDia} mm = {beamCalc.As} mm²</b> (Minimum required: {beamCalc.As_min} mm²)
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4">
                  {km ? 'លទ្ធផលនៃការវិភាគលម្អិត (Analysis Breakdown)' : 'Engineering Analysis Breakdown'}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-600">Whitney Block (a):</span>
                    <b className="font-mono text-navy">{beamCalc.a} mm</b>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-600">Neutral Axis (c):</span>
                    <b className="font-mono text-navy">{beamCalc.c} mm</b>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-600">Steel Strain (εt):</span>
                    <b className={`font-mono ${beamCalc.isTensionControlled ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {beamCalc.et} {beamCalc.isTensionControlled ? '(Tension Controlled)' : '(Transition)'}
                    </b>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-600">Reduction Factor (φ):</span>
                    <b className="font-mono text-navy">{beamCalc.phi}</b>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-600">Nominal Capacity (Mn):</span>
                    <b className="font-mono text-navy">{beamCalc.Mn} kN·m</b>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-600">Design Capacity (φMn):</span>
                    <b className="font-mono text-emerald-700 font-bold">{beamCalc.phiMn} kN·m</b>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium ${
                    beamCalc.isAsMinOk ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {beamCalc.isAsMinOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    As ≥ As,min ({beamCalc.As} ≥ {beamCalc.As_min} mm²)
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium ${
                    beamCalc.isCapacityOk ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {beamCalc.isCapacityOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    DCR = {beamCalc.dcr} ({beamCalc.isCapacityOk ? 'PASS' : 'FAIL'})
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-navy mb-4 text-center">
                  {km ? 'គំនូរផ្នែកកាត់ធ្នឹម (Cross Section Diagram)' : 'Live Section Diagram'}
                </h3>

                <div className="flex justify-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <svg width="240" height="280" viewBox="0 0 240 280" className="max-w-full">
                    {/* Concrete Section */}
                    <rect x="40" y="20" width="160" height="230" fill="#f1f5f9" stroke="#334155" strokeWidth="2.5" rx="2" />
                    
                    {/* Whitney stress block 'a' */}
                    <rect
                      x="40"
                      y="20"
                      width="160"
                      height={Math.min(220, Math.max(15, (beamCalc.a / beamHeight) * 230))}
                      fill="#fed7aa"
                      opacity="0.75"
                    />

                    {/* Neutral Axis */}
                    <line
                      x1="30"
                      y1={20 + Math.min(225, (beamCalc.c / beamHeight) * 230)}
                      x2="210"
                      y2={20 + Math.min(225, (beamCalc.c / beamHeight) * 230)}
                      stroke="#ea580c"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <text
                      x="8"
                      y={24 + Math.min(225, (beamCalc.c / beamHeight) * 230)}
                      fontSize="9"
                      fill="#ea580c"
                      fontWeight="bold"
                    >
                      N.A.
                    </text>

                    {/* Stirrup */}
                    <rect x="52" y="32" width="136" height="206" fill="none" stroke="#0284c7" strokeWidth="1.8" rx="4" />

                    {/* Rebars */}
                    {Array.from({ length: barCount }).map((_, idx) => {
                      const spacing = 120 / Math.max(1, barCount - 1);
                      const cx = barCount === 1 ? 120 : 60 + idx * spacing;
                      const cy = 20 + (beamDepth / beamHeight) * 230;
                      return (
                        <circle
                          key={idx}
                          cx={cx}
                          cy={cy}
                          r={Math.max(4, Math.min(10, barDia / 3))}
                          fill="#1e293b"
                          stroke="#0284c7"
                          strokeWidth="1.5"
                        />
                      );
                    })}

                    {/* Dimension labels */}
                    <text x="120" y="14" fontSize="11" textAnchor="middle" fill="#475569" fontWeight="bold">
                      b = {beamWidth} mm
                    </text>
                    <text x="206" y="140" fontSize="11" fill="#475569" fontWeight="bold">
                      h = {beamHeight}
                    </text>
                    <text x="120" y="270" fontSize="10" textAnchor="middle" fill="#0284c7" fontWeight="bold">
                      {barCount} T{barDia} (As = {beamCalc.As} mm²)
                    </text>
                  </svg>
                </div>

                <div className={`mt-5 rounded-lg p-4 border text-center ${
                  beamCalc.isCapacityOk
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/70 border-rose-200 text-rose-900'
                }`}>
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">
                    {km ? 'សមត្ថភាពទ្រម៉ូម៉ង់រចនា (Design Capacity)' : 'Factored Moment Capacity'}
                  </p>
                  <p className={`text-3xl font-extrabold mt-1 ${beamCalc.isCapacityOk ? 'text-emerald-700' : 'text-rose-700'}`}>
                    φMn = {beamCalc.phiMn} kN·m
                  </p>
                  <p className="text-xs mt-1 text-slate-600">
                    Mu = {factoredMoment} kN·m · DCR = <b>{beamCalc.dcr}</b> ({beamCalc.isCapacityOk ? 'SAFE' : 'OVERLOAD'})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyResults(
                    `ChanCivil Beam Check (ACI 318-19):\n` +
                    `Section: ${beamWidth}x${beamHeight} mm (d=${beamDepth} mm)\n` +
                    `Materials: f'c=${fc} MPa, fy=${fy} MPa\n` +
                    `Rebar: ${barCount}xT${barDia} (As = ${beamCalc.As} mm2)\n` +
                    `Capacity: phi*Mn = ${beamCalc.phiMn} kNm (Mu = ${factoredMoment} kNm)\n` +
                    `Status: ${beamCalc.isCapacityOk ? 'SAFE' : 'OVERLOAD'} (DCR = ${beamCalc.dcr})`
                  )}
                  className="btn-outline w-full mt-3 text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? (km ? 'បានចម្លង!' : 'Copied to Clipboard!') : (km ? 'ចម្លងលទ្ធផលគណនា' : 'Copy Summary Report')}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'boq' && (
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-navy">
                      {km ? 'ប៉ាន់ស្មានបរិមាណបេតុង និងដែក (BoQ Material Estimator)' : 'Structural Member BoQ Estimator'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Automated quantity calculation for structural engineering</p>
                  </div>
                  <span className="rounded bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 border border-cyan-200">
                    Concrete & Rebar
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                    {km ? 'ប្រភេទធាតុសំណង់ (Structural Element)' : 'Select Structural Element'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'beam', label: km ? 'ធ្នឹម (Beam)' : 'Beam' },
                      { id: 'column', label: km ? 'សសរ (Column)' : 'Column' },
                      { id: 'footing', label: km ? 'គ្រឹះ (Footing)' : 'Footing' },
                      { id: 'slab', label: km ? 'កម្រាល (Slab)' : 'Slab' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMemberType(item.id as any)}
                        className={`p-3 rounded-lg border font-bold text-sm text-center transition-colors ${
                          memberType === item.id
                            ? 'bg-navy text-white border-navy shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      {memberType === 'column' ? (km ? 'កម្ពស់សសរ H (m)' : 'Height H (m)') : (km ? 'ប្រវែង L (m)' : 'Length L (m)')}
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={0.1}
                      value={memL}
                      onChange={(e) => setMemL(Number(e.target.value) || 0.1)}
                      className="input font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      {km ? 'ទទឹង W (m)' : 'Width W (m)'}
                    </label>
                    <input
                      type="number"
                      step={0.05}
                      min={0.05}
                      value={memW}
                      onChange={(e) => setMemW(Number(e.target.value) || 0.05)}
                      className="input font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      {memberType === 'slab' ? (km ? 'កម្រាស់កម្រាល (m)' : 'Thickness (m)') : (km ? 'កម្រាស់/កម្ពស់ (m)' : 'Depth/Height (m)')}
                    </label>
                    <input
                      type="number"
                      step={0.05}
                      min={0.05}
                      value={memH}
                      onChange={(e) => setMemH(Number(e.target.value) || 0.05)}
                      className="input font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      {km ? 'ចំនួនសរុប (Quantity / Member Count)' : 'Total Members (Quantity)'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={memCount}
                      onChange={(e) => setMemCount(Number(e.target.value) || 1)}
                      className="input font-semibold text-brand"
                    />
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    {km ? 'ដង់ស៊ីតេដែកសរសៃមធ្យម (Rebar Ratio kg/m³)' : 'Typical Rebar Ratio (kg/m³)'}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={80}
                      max={200}
                      step={5}
                      value={rebarDensity}
                      onChange={(e) => setRebarDensity(Number(e.target.value))}
                      className="flex-1 accent-cyan-600"
                    />
                    <span className="font-bold text-navy text-sm w-20 text-right">{rebarDensity} kg/m³</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4">
                  {km ? 'តារាងបែងចែកសម្ភារៈសំណង់ (Material Takeoff Breakdown)' : 'Estimated Material Takeoff'}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase bg-slate-50">
                        <th className="py-2.5 px-3">Material</th>
                        <th className="py-2.5 px-3">Quantity</th>
                        <th className="py-2.5 px-3">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-navy">Ready-Mix Concrete</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">{boqCalc.totalVol}</td>
                        <td className="py-2.5 px-3 text-slate-600">m³</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-navy">Reinforcement Steel</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">{boqCalc.totalRebarTons}</td>
                        <td className="py-2.5 px-3 text-slate-600">Tonnes ({boqCalc.totalRebarKg.toLocaleString()} kg)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-navy">Formwork Contact Area</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">{boqCalc.totalForm}</td>
                        <td className="py-2.5 px-3 text-slate-600">m²</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-slate-600">Portland Cement (Site Mix approx)</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">~{boqCalc.cementBags}</td>
                        <td className="py-2.5 px-3 text-slate-600">Bags (50kg)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24">
                <h3 className="text-base font-bold text-navy mb-4">
                  {km ? 'សង្ខេប BoQ សរុប' : 'BoQ Calculation Summary'}
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Total Concrete Volume</p>
                    <p className="text-3xl font-extrabold text-navy mt-1">{boqCalc.totalVol} <span className="text-lg font-normal text-slate-500">m³</span></p>
                    <p className="text-xs text-slate-500 mt-1">{memCount} × {boqCalc.volSingle} m³ per member</p>
                  </div>
                  <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-200">
                    <p className="text-xs uppercase text-cyan-800 font-semibold">Total Rebar Steel Weight</p>
                    <p className="text-3xl font-extrabold text-cyan-800 mt-1">{boqCalc.totalRebarTons} <span className="text-lg font-normal">Tons</span></p>
                    <p className="text-xs text-cyan-700 mt-1">({boqCalc.totalRebarKg.toLocaleString()} kg)</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Formwork Area</p>
                    <p className="text-2xl font-bold text-navy mt-1">{boqCalc.totalForm} <span className="text-sm font-normal text-slate-500">m²</span></p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyResults(
                    `ChanCivil BoQ Summary (${memberType.toUpperCase()}):\n` +
                    `Quantity: ${memCount} members\n` +
                    `Total Concrete: ${boqCalc.totalVol} m3\n` +
                    `Total Rebar: ${boqCalc.totalRebarTons} Tonnes (${boqCalc.totalRebarKg} kg)\n` +
                    `Total Formwork: ${boqCalc.totalForm} m2`
                  )}
                  className="btn-primary w-full mt-6 text-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? (km ? 'បានចម្លង!' : 'Copied!') : (km ? 'ចម្លងតារាង BoQ' : 'Copy BoQ Summary')}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rebar' && (
          <div className="space-y-8">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-navy mb-2">
                {km ? 'តារាងផ្ទៃក្រឡាដែកសរសៃតាមចំនួនដើម (Total Rebar Area Table)' : 'Standard Metric Rebar Area Matrix (mm²)'}
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Unit weight calculated by formula: <code className="bg-slate-100 px-2 py-0.5 rounded text-navy font-mono font-bold">Weight = D² / 162 (kg/m)</code>
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-sm border-collapse">
                  <thead>
                    <tr className="bg-navy text-white text-xs">
                      <th className="p-3 text-left">Bar Size</th>
                      <th className="p-3">Weight (kg/m)</th>
                      <th className="p-3">1 Bar</th>
                      <th className="p-3">2 Bars</th>
                      <th className="p-3">3 Bars</th>
                      <th className="p-3">4 Bars</th>
                      <th className="p-3">5 Bars</th>
                      <th className="p-3">6 Bars</th>
                      <th className="p-3">8 Bars</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {METRIC_BARS.map((b) => (
                      <tr key={b.size} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-navy text-left">{b.size} (Ø{b.dia})</td>
                        <td className="p-3 font-mono text-slate-600">{b.weight}</td>
                        <td className="p-3 font-mono font-semibold">{b.area}</td>
                        <td className="p-3 font-mono">{(b.area * 2).toFixed(1)}</td>
                        <td className="p-3 font-mono">{(b.area * 3).toFixed(1)}</td>
                        <td className="p-3 font-mono">{(b.area * 4).toFixed(1)}</td>
                        <td className="p-3 font-mono">{(b.area * 5).toFixed(1)}</td>
                        <td className="p-3 font-mono">{(b.area * 6).toFixed(1)}</td>
                        <td className="p-3 font-mono">{(b.area * 8).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-navy mb-4">
                {km ? 'កម្មវិធីបំប្លែងខ្នាតវិស្វកម្មសំណង់ស៊ីវិល' : 'Civil & Structural Engineering Unit Converter'}
              </h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: 'stress', label: 'Stress / Pressure (MPa, psi, ksi)' },
                  { id: 'force', label: 'Force (kN, kips, tonnes)' },
                  { id: 'moment', label: 'Bending Moment (kN·m, kip·ft)' },
                  { id: 'length', label: 'Length & Dimensions (m, mm, ft)' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setUnitCategory(c.id as any);
                      setUnitValue(c.id === 'stress' ? 25 : c.id === 'force' ? 100 : c.id === 'moment' ? 150 : 6);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${
                      unitCategory === c.id
                        ? 'bg-navy text-white border-navy'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                  Enter Input Value ({convertedUnits[0].label}):
                </label>
                <input
                  type="number"
                  step="any"
                  value={unitValue}
                  onChange={(e) => setUnitValue(Number(e.target.value) || 0)}
                  className="input text-lg font-bold text-navy"
                />
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Equivalent Converted Values:
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {convertedUnits.map((u) => (
                    <div
                      key={u.label}
                      className={`flex items-center justify-between p-3.5 rounded-lg border ${
                        u.primary ? 'bg-cyan-50/50 border-cyan-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-xs text-slate-600">{u.label}</span>
                      <b className="font-mono text-base text-navy">{u.val.toLocaleString()}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
