import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Workflow,
  CheckCircle2,
  Cpu,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Code2,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function BimWorkflowShowcase() {
  const { lang } = useLanguage();
  const km = lang === 'km';

  const [activeTab, setActiveTab] = useState<'bim' | 'design' | 'boq' | 'api'>('bim');

  const workflows = [
    {
      id: 'bim',
      title: km ? 'CAD ទៅជា BIM ស្វ័យប្រវត្តិ' : 'CAD-to-BIM Automation',
      subtitle: km ? 'បង្កើត Footing, Column, Beam, Slab ក្នុង Revit ដោយស្វ័យប្រវត្តិ' : 'Automated 3D modeling for footings, columns, beams & slabs',
      icon: Boxes,
      badge: 'Revit · Dynamo · CAD',
      points: km
        ? [
            'បំលែងប្លង់ស្ថាបត្យកម្ម 2D CAD ទៅជាម៉ូដែល 3D BIM ច្បាស់លាស់',
            'បង្កើតកម្រាល ធ្នឹម សសរ និងគ្រឹះតាម Gridline ដោយស្វ័យប្រវត្តិ',
            'កាត់បន្ថយកំហុសឆ្គងពីការគូសដោយដៃ និងសន្សំសំចៃពេលវេលា 80%',
            'ត្រៀមសម្រាប់ការត្រួតពិនិត្យ Clash Detection និងការសម្របសម្រួល',
          ]
        : [
            'Directly convert 2D architectural CAD grids into precise 3D Revit models',
            'Auto-place foundations, columns, beams, and slabs along structural gridlines',
            'Eliminate manual drafting mistakes and accelerate initial modeling by up to 80%',
            'BIM coordination-ready for clash detection and multi-discipline federated models',
          ],
      metrics: [
        { val: '80%', label: km ? 'សន្សំសំចៃពេលវេលា' : 'Time Saved' },
        { val: '0.00mm', label: km ? 'ភាពជាក់លាក់' : 'Grid Accuracy' },
        { val: 'LOD 350', label: km ? 'កម្រិតលម្អិត BIM' : 'Model Detail' },
      ],
    },
    {
      id: 'design',
      title: km ? 'ការរចនា និងត្រួតពិនិត្យស្តង់ដារ' : 'Structural Design Verification',
      subtitle: km ? 'ផ្ទៀងផ្ទាត់រូបមន្ត ACI 318-19, AISC 360 និង Eurocode 2' : 'Compliant member capacity & demand checks',
      icon: ShieldCheck,
      badge: 'ACI 318-19 · AISC · EC2',
      points: km
        ? [
            'ការគណនាកម្លាំងម៉ូម៉ង់រចនា (φMn) និងកម្លាំងកាត់ (φVn) យ៉ាងលម្អិត',
            'ការផ្ទៀងផ្ទាត់សមាមាត្រតម្រូវការធៀបនឹងសមត្ថភាព (DCR Analysis)',
            'ការពិនិត្យកម្រាស់ដែកកំហាប់អប្បបរមា និងអតិបរមា (As,min & As,max)',
            'ការត្រួតពិនិត្យភាពយារ (Deflection check) និងទំហំស្នាមប្រេះ',
          ]
        : [
            'Rigorous flexural capacity (φMn) and shear resistance (φVn) computation',
            'Demand-Capacity Ratio (DCR) analysis for tension-controlled safety',
            'Automatic verification of minimum and maximum reinforcement limits (As,min)',
            'Serviceability deflection limits (L/240, L/360) and crack control verification',
          ],
      metrics: [
        { val: '100%', label: km ? 'យោងស្តង់ដារ ACI' : 'Code Compliant' },
        { val: '< 1.0', label: km ? 'កម្រិត DCR សុវត្ថិភាព' : 'Safety Ratio' },
        { val: 'Live', label: km ? 'លទ្ធផលភ្លាមៗ' : 'Real-time DCR' },
      ],
    },
    {
      id: 'boq',
      title: km ? 'BoQ & Bar Bending Schedule (BBS)' : 'Automated BoQ & BBS Takeoff',
      subtitle: km ? 'ស្រង់បរិមាណបេតុង ដែកសរសៃ និងផ្ទៃពុម្ពគម្រោង' : 'Instant concrete volumes, rebar tonnage & formwork',
      icon: FileSpreadsheet,
      badge: 'BoQ · BBS · Estimation',
      points: km
        ? [
            'ស្រង់បរិមាណបេតុង Ready-Mix និងសម្ភារៈផ្សំតាម Grade',
            'ការគណនាទម្ងន់ដែកសរសៃតាមរូបមន្តស្តង់ដារ D²/162 kg/m',
            'បញ្ជីដែកកាត់ និងពត់ (Bar Bending Schedule - BBS) លម្អិត',
            'នាំចេញលទ្ធផលជាទម្រង់ Excel BoQ សម្រាប់ដេញថ្លៃគម្រោង',
          ]
        : [
            'Accurate ready-mix concrete cubic meter takeoff categorized by strength grade',
            'Rebar tonnage calculation based on standard D²/162 formula with lap factors',
            'Automated Bar Bending Schedule (BBS) cut lengths, shapes, and bend deductions',
            'One-click export ready for tender BoQ and commercial cost estimation',
          ],
      metrics: [
        { val: 'D²/162', label: km ? 'រូបមន្តទម្ងន់ដែក' : 'Rebar Formula' },
        { val: '±1%', label: km ? 'កម្រិតលម្អិត BoQ' : 'Estimate Accuracy' },
        { val: 'Instant', label: km ? 'ស្រង់ទិន្នន័យ' : 'Takeoff Speed' },
      ],
    },
    {
      id: 'api',
      title: km ? 'ការភ្ជាប់ ETABS, SAFE & Revit' : 'ETABS / SAFE / API Workflows',
      subtitle: km ? 'ស្វ័យប្រវត្តិកម្មទិន្នន័យរវាងម៉ូដែលវិភាគ និងប្លង់សំណង់' : 'Seamless analytical to physical model data exchange',
      icon: Cpu,
      badge: 'ETABS API · CSI · Python',
      points: km
        ? [
            'ការទាញយកកម្លាំងប្រតិកម្ម (Base Reactions) ពី ETABS ទៅ SAFE ដោយស្វ័យប្រវត្តិ',
            'ស្គ្រីប Python / C# ជួយទាញកម្លាំង Bending Moment & Shear កាត់បន្ថយការវាយបញ្ចូល',
            'ការភ្ជាប់ម៉ូដែលវិភាគទៅម៉ូដែល BIM ដោយគ្មានការបាត់បង់ទិន្នន័យ',
            'បង្កើតរបាយការណ៍គណនារចនាសម្ព័ន្ធ (Calculation Book) ស្វ័យប្រវត្តិ',
          ]
        : [
            'Automated column base reactions transfer from ETABS 3D frames into SAFE foundation slabs',
            'Custom Python scripts to extract governing load combinations without manual typing',
            'Direct synchronization between CSI analytical nodes and Autodesk Revit elements',
            'Automated structural engineering calculation reports with embedded diagrams',
          ],
      metrics: [
        { val: '10x', label: km ? 'លឿនជាងមុន' : 'Workflow Speed' },
        { val: 'Zero', label: km ? 'កំហុសវាយទិន្នន័យ' : 'Manual Errors' },
        { val: 'Python', label: km ? 'ស្គ្រីបស្វ័យប្រវត្តិ' : 'API Scripting' },
      ],
    },
  ];

  const currentWf = workflows.find((w) => w.id === activeTab) || workflows[0];

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-7 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative mb-8 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          {km ? 'បច្ចេកវិទ្យាសំណង់ និងស្វ័យប្រវត្តិកម្ម' : 'DIGITAL CONSTRUCTION & BIM AUTOMATION'}
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold !text-white leading-tight">
          {km
            ? 'ដំណើរការវិស្វកម្មទំនើប៖ ពីប្លង់ព្រាង ដល់ម៉ូដែល BIM និង BoQ'
            : 'Next-Gen Structural Workflows: From CAD to BIM & BoQ'}
        </h2>
        <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
          {km
            ? 'ដូចគ្នានឹងដំណោះស្រាយរបស់ CamboBIM យើងផ្តោតលើការកាត់បន្ថយការងារច្រំដែល បង្កើនភាពជាក់លាក់ និងពន្លឿនការងារវិស្វកម្មរចនាសម្ព័ន្ធ។'
            : 'Inspired by practical construction-tech platforms like CamboBIM, ChanCivil streamlines modeling, code verification, and quantity surveying.'}
        </p>
      </div>

      {/* Interactive Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-8">
        {workflows.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-cyan-400/30 text-cyan-200' : 'bg-white/5 text-slate-400'
                }`}>
                  {item.badge.split('·')[0].trim()}
                </span>
              </div>
              <p className="font-bold text-sm text-white">{item.title}</p>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Card */}
      <div className="grid lg:grid-cols-2 gap-8 items-center rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm">
        {/* Left: Description & points */}
        <div className="space-y-6">
          <div>
            <span className="inline-block px-2.5 py-1 rounded-md bg-cyan-400/20 text-cyan-200 text-xs font-semibold uppercase tracking-wider mb-2">
              {currentWf.badge}
            </span>
            <h3 className="text-2xl font-bold text-white">{currentWf.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{currentWf.subtitle}</p>
          </div>

          <div className="space-y-3">
            {currentWf.points.map((pt, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-200 leading-relaxed">{pt}</p>
              </div>
            ))}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
            {currentWf.metrics.map((m, i) => (
              <div key={i} className="rounded-xl bg-black/30 p-3 border border-white/5 text-center">
                <p className="font-mono text-xl font-extrabold text-cyan-300">{m.val}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-navy hover:bg-cyan-400 transition-colors shadow-md"
            >
              <Workflow className="h-4 w-4" />
              {km ? 'សាកល្បងឧបករណ៍ផ្ទាល់' : 'Try Calculation Tools'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
            >
              {km ? 'អានមេរៀនអនុវត្ត' : 'Read Workflows'}
            </Link>
          </div>
        </div>

        {/* Right: Rich Interactive Visual Mockup */}
        <div className="rounded-xl border border-white/15 bg-black/40 p-5 shadow-inner">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Code2 className="h-3.5 w-3.5" />
              CHANCIVIL / {currentWf.id.toUpperCase()}_ENGINE.ts
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
              Ready
            </span>
          </div>

          {/* Isometric / BIM Visual graphic */}
          <div className="relative bg-[#07131e] rounded-lg p-4 border border-white/5 flex items-center justify-center min-h-[240px]">
            {activeTab === 'bim' && (
              <svg viewBox="0 0 340 200" className="w-full h-auto">
                <defs>
                  <linearGradient id="bimGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                {/* 3D structural frame representation */}
                <g stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.8">
                  {/* Foundation pads */}
                  <polygon points="50,160 110,130 170,160 110,190" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" />
                  <polygon points="170,160 230,130 290,160 230,190" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" />

                  {/* Columns */}
                  <line x1="110" y1="160" x2="110" y2="70" strokeWidth="4" stroke="#38bdf8" />
                  <line x1="230" y1="160" x2="230" y2="70" strokeWidth="4" stroke="#38bdf8" />

                  {/* Top Beams & Slab */}
                  <polygon points="50,70 110,40 170,70 110,100" fill="rgba(129,140,248,0.2)" stroke="#818cf8" strokeWidth="2" />
                  <polygon points="170,70 230,40 290,70 230,100" fill="rgba(129,140,248,0.2)" stroke="#818cf8" strokeWidth="2" />
                  <line x1="110" y1="70" x2="230" y2="70" strokeWidth="3" stroke="#818cf8" />
                </g>
                <circle cx="110" cy="70" r="4" fill="#f59e0b" />
                <circle cx="230" cy="70" r="4" fill="#f59e0b" />
                <text x="170" y="30" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  AUTODESK REVIT BIM MODEL (LOD 350)
                </text>
                <text x="170" y="180" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  Column C1 (400x400) · Footing F1 (1500x1500x450)
                </text>
              </svg>
            )}

            {activeTab === 'design' && (
              <svg viewBox="0 0 340 200" className="w-full h-auto">
                {/* ACI 318 Section check diagram */}
                <rect x="100" y="30" width="140" height="130" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" rx="4" />
                <rect x="100" y="30" width="140" height="40" fill="rgba(245, 158, 11, 0.3)" />
                <line x1="90" y1="70" x2="250" y2="70" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
                <text x="60" y="73" fill="#f59e0b" fontSize="9" fontWeight="bold">N.A. (c)</text>
                {/* Rebars */}
                <circle cx="125" cy="140" r="6" fill="#38bdf8" />
                <circle cx="170" cy="140" r="6" fill="#38bdf8" />
                <circle cx="215" cy="140" r="6" fill="#38bdf8" />
                <text x="170" y="180" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  ACI 318-19: φMn = 274 kN·m &gt; Mu (PASS)
                </text>
                <text x="170" y="20" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  Singly Reinforced Section (b=300, h=550, d=500)
                </text>
              </svg>
            )}

            {activeTab === 'boq' && (
              <div className="w-full text-xs font-mono space-y-2 p-2">
                <div className="flex justify-between border-b border-white/10 pb-1 text-cyan-300 font-bold">
                  <span>ITEM / ELEMENT</span>
                  <span>QTY</span>
                  <span>CONCRETE</span>
                  <span>REBAR</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Foundation F1 (1.5x1.5)</span>
                  <span>6 units</span>
                  <span className="text-white font-bold">6.08 m³</span>
                  <span className="text-cyan-300">730 kg</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Columns C1 (0.4x0.4x3.6)</span>
                  <span>8 units</span>
                  <span className="text-white font-bold">4.61 m³</span>
                  <span className="text-cyan-300">553 kg</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Floor Beams B1 (0.3x0.5x5.0)</span>
                  <span>6 units</span>
                  <span className="text-white font-bold">4.50 m³</span>
                  <span className="text-cyan-300">540 kg</span>
                </div>
                <div className="flex justify-between border-t border-cyan-400/30 pt-2 text-white font-bold bg-cyan-900/20 p-1.5 rounded">
                  <span>TOTAL ESTIMATION</span>
                  <span>20 pcs</span>
                  <span className="text-cyan-300">15.19 m³</span>
                  <span className="text-emerald-400">1.82 Tons</span>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="w-full text-xs font-mono space-y-1.5 text-slate-300">
                <p className="text-emerald-400"># ChanCivil CSI ETABS to Revit Bridge</p>
                <p><span className="text-cyan-300">import</span> comtypes.client</p>
                <p><span className="text-cyan-300">helper</span> = comtypes.client.CreateObject('ETABSv1.Helper')</p>
                <p><span className="text-cyan-300">etabs</span> = helper.GetObject('CSI.ETABS.API.ETABSObject')</p>
                <p className="text-amber-300">ret = SapModel.DesignConcrete.GetSummaryResultsBeam()</p>
                <p className="text-slate-400">// Extracted: 48 beam frames, 16 column envelopes</p>
                <p className="text-cyan-300 font-bold">&gt;&gt; Synchronizing with Autodesk Revit BIM... [100% OK]</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
