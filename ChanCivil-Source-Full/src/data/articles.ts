import type { Article, Bilingual } from '../types';

const author = 'ChanCivil Editorial';
const authorBio: Bilingual = {
  en: 'ChanCivil publishes practical civil and structural engineering education for students and practising engineers.',
  km: 'ChanCivil ផ្សព្វផ្សាយការអប់រំវិស្វកម្មសំណង់ស៊ីវិល និងរចនាសម្ព័ន្ធជាក់ស្តែង សម្រាប់និស្សិត និងវិស្វករដែលកំពុងអនុវត្តការងារ។',
};

const noteEn =
  '<blockquote><strong>Educational example.</strong> Values are assumed for illustration and are not an approved project design. Confirm loads, code edition and assumptions for your project with a licensed engineer.</blockquote>';
const noteKm =
  '<blockquote><strong>ឧទាហរណ៍អប់រំ។</strong> តម្លៃទាំងនេះត្រូវបានសន្មតសម្រាប់ការបង្ហាញប៉ុណ្ណោះ មិនមែនជាការរចនាគម្រោងដែលបានអនុម័តទេ។ សូមផ្ទៀងផ្ទាត់បន្ទុក កំណែក្រម និងសម្មតិកម្មសម្រាប់គម្រោងរបស់អ្នកជាមួយវិស្វករដែលមានអាជ្ញាបណ្ណ។</blockquote>';

/**
 * Sample articles. These are demonstration content shown until the site is
 * connected to Supabase. They deliberately cite codes at chapter level only
 * and never reproduce clause numbers or tabulated code values.
 */
export const sampleArticles: Article[] = [
  {
    id: 'sample-1',
    slug: 'dead-load-vs-live-load',
    title: { en: 'Dead Load vs Live Load', km: 'បន្ទុកស្ថាពរ និងបន្ទុកចល័ត' },
    description: {
      en: 'What separates permanent loads from variable loads, and why structural design treats them differently.',
      km: 'អ្វីដែលញែកបន្ទុកអចិន្ត្រៃយ៍ចេញពីបន្ទុកប្រែប្រួល និងមូលហេតុដែលការរចនារចនាសម្ព័ន្ធចាត់ទុកវាខុសគ្នា។',
    },
    content: {
      en: `<p>Every structural calculation starts with loads. The first and most important distinction is between loads that are always there and loads that come and go.</p>
<h2>Dead loads</h2>
<p>Dead loads are permanent. They include the self-weight of structural members, floor finishes, fixed partitions, ceilings and permanently installed equipment. Because they are known fairly well from the drawings, they carry a smaller uncertainty.</p>
<h2>Live loads</h2>
<p>Live loads depend on use and occupancy: people, furniture, movable equipment and stored items. They vary in time and location, so design codes specify minimum values by occupancy and apply separate load factors.</p>
<h2>A simple self-weight example</h2>
<p>Assumption for illustration: a 150 mm reinforced concrete slab with an assumed unit weight of 24 kN/m³.</p>
<ul><li>Self-weight = 0.150 m × 24 kN/m³ = 3.6 kN/m²</li><li>Finishes, partitions and services are added separately from project information.</li></ul>
${noteEn}
<h2>Where the code comes in</h2>
<p>ASCE 7-22 covers dead loads in Chapter 3 and live loads in Chapter 4. Unit weights, minimum live loads and load combinations must be taken from the edition adopted for your project; they are not reproduced here.</p>`,
      km: `<p>រាល់ការគណនារចនាសម្ព័ន្ធចាប់ផ្តើមពីបន្ទុក។ ភាពខុសគ្នាដំបូង និងសំខាន់បំផុតគឺរវាងបន្ទុកដែលមានជានិច្ច និងបន្ទុកដែលមកហើយទៅ។</p>
<h2>បន្ទុកស្ថាពរ (Dead load)</h2>
<p>បន្ទុកស្ថាពរគឺជាបន្ទុកអចិន្ត្រៃយ៍ រួមមានទម្ងន់ខ្លួនឯងនៃធាតុរចនាសម្ព័ន្ធ ស្រទាប់បញ្ចប់ជាន់ ជញ្ជាំងបែងចែកថេរ ពិដាន និងឧបករណ៍ដែលតំឡើងជាអចិន្ត្រៃយ៍។ ដោយសារអាចដឹងបានល្អពីប្លង់ បន្ទុកទាំងនេះមានភាពមិនប្រាកដតិចជាង។</p>
<h2>បន្ទុកចល័ត (Live load)</h2>
<p>បន្ទុកចល័តអាស្រ័យលើការប្រើប្រាស់ និងចំនួនអ្នកប្រើប្រាស់ ដូចជាមនុស្ស គ្រឿងសង្ហារិម ឧបករណ៍ចល័ត និងទំនិញដែលរក្សាទុក។ វាប្រែប្រួលតាមពេលវេលា និងទីតាំង ដូច្នេះក្រមរចនាកំណត់តម្លៃអប្បបរមាតាមប្រភេទការប្រើប្រាស់ ហើយប្រើកត្តាបន្ទុកដាច់ដោយឡែក។</p>
<h2>ឧទាហរណ៍ទម្ងន់ខ្លួនឯងសាមញ្ញ</h2>
<p>សម្មតិកម្មសម្រាប់ការបង្ហាញ៖ ផ្ទាំងសន្លឹមបេតុងអាមេក្រាស់ ១៥០ ម.ម ដោយសន្មតទម្ងន់ឯកតា ២៤ kN/m³។</p>
<ul><li>ទម្ងន់ខ្លួនឯង = 0.150 ម × 24 kN/m³ = 3.6 kN/m²</li><li>ស្រទាប់បញ្ចប់ ជញ្ជាំងបែងចែក និងប្រព័ន្ធបំពេញ ត្រូវបូកបន្ថែមដោយឡែកពីព័ត៌មានគម្រោង។</li></ul>
${noteKm}
<h2>ក្រមពាក់ព័ន្ធត្រង់ណា</h2>
<p>ASCE 7-22 ដោះស្រាយបន្ទុកស្ថាពរនៅជំពូកទី ៣ និងបន្ទុកចល័តនៅជំពូកទី ៤។ ទម្ងន់ឯកតា បន្ទុកចល័តអប្បបរមា និងបន្សំបន្ទុក ត្រូវយកពីកំណែដែលបានអនុម័តសម្រាប់គម្រោងរបស់អ្នក ហើយមិនត្រូវបានចម្លងនៅទីនេះទេ។</p>`,
    },
    categorySlug: 'structural-engineering',
    tags: ['loads', 'ASCE 7', 'fundamentals'],
    authorName: author,
    authorBio,
    publishedAt: '2026-10-01',
    featured: true,
    readMinutes: 5,
    coverImageUrl: null,
    coverAlt: { en: 'Illustration of dead and live loads on a floor slab', km: 'រូបភាពបង្ហាញបន្ទុកស្ថាពរ និងបន្ទុកចល័តលើផ្ទាំងសន្លឹមជាន់' },
    references: ['ASCE/SEI 7-22, Minimum Design Loads and Associated Criteria for Buildings and Other Structures — Chapters 3 and 4'],
  },
  {
    id: 'sample-2',
    slug: 'load-transfer-roof-sheeting-to-frames',
    title: { en: 'Load Transfer from Roof Sheeting to Structural Frames', km: 'ការបញ្ជូនបន្ទុកពីដំបូលទៅស៊ុមរចនាសម្ព័ន្ធ' },
    description: {
      en: 'Follow a roof load step by step: sheeting, purlins, trusses, columns and foundations.',
      km: 'តាមដានបន្ទុកដំបូលជាជំហានៗ៖ ក្បឿង/ស័ង្កសី ក្រឡាប្រក់ ត្រូស សសរ និងគ្រឹះ។',
    },
    content: {
      en: `<p>Understanding the load path is the key to modelling a roof correctly. Each element collects load from the one above and passes it to the one below.</p>
<h2>The load path</h2>
<ol><li>Roof sheeting spans between purlins.</li><li>Purlins span between trusses or rafters.</li><li>Trusses or rafters deliver point loads to columns or walls.</li><li>Columns carry the load to the foundations.</li></ol>
<h2>Tributary width</h2>
<p>A member collects load from half the span on each side. Assumption for illustration: purlins at 1.2 m spacing and an area load of 0.5 kN/m² on the roof surface.</p>
<ul><li>Line load on purlin = 0.5 kN/m² × 1.2 m = 0.6 kN/m</li></ul>
<p>Roof slope, wind uplift and the direction of the load relative to the member axis must also be considered in a real design.</p>
${noteEn}`,
      km: `<p>ការយល់ដឹងពីផ្លូវបញ្ជូនបន្ទុកគឺជាគន្លឹះក្នុងការបង្កើតម៉ូដែលដំបូលឲ្យបានត្រឹមត្រូវ។ ធាតុនីមួយៗប្រមូលបន្ទុកពីធាតុខាងលើ ហើយបញ្ជូនទៅធាតុខាងក្រោម។</p>
<h2>ផ្លូវបញ្ជូនបន្ទុក</h2>
<ol><li>សន្លឹកដំបូលលាតរវាងក្រឡាប្រក់ (purlin)។</li><li>ក្រឡាប្រក់លាតរវាងត្រូស ឬកន្ទោល (rafter)។</li><li>ត្រូស ឬកន្ទោលបញ្ជូនបន្ទុកចំណុចទៅសសរ ឬជញ្ជាំង។</li><li>សសរបញ្ជូនបន្ទុកទៅគ្រឹះ។</li></ol>
<h2>ទទឹងប្រមូលបន្ទុក (Tributary width)</h2>
<p>ធាតុមួយប្រមូលបន្ទុកពីពាក់កណ្តាលនៃចម្ងាយលាតទាំងសងខាង។ សម្មតិកម្មសម្រាប់ការបង្ហាញ៖ ក្រឡាប្រក់ដាក់ចម្ងាយ ១.២ ម និងបន្ទុកក្រឡា ០.៥ kN/m² លើផ្ទៃដំបូល។</p>
<ul><li>បន្ទុកបន្ទាត់លើក្រឡាប្រក់ = 0.5 kN/m² × 1.2 ម = 0.6 kN/m</li></ul>
<p>ក្នុងការរចនាពិតប្រាកដ ត្រូវពិចារណាផងដែរអំពីជម្រាលដំបូល កម្លាំងលើកដោយខ្យល់ និងទិសដៅបន្ទុកធៀបនឹងអ័ក្សធាតុ។</p>
${noteKm}`,
    },
    categorySlug: 'structural-engineering',
    tags: ['roof', 'load path', 'purlins'],
    authorName: author,
    authorBio,
    publishedAt: '2026-09-24',
    featured: true,
    readMinutes: 6,
    coverImageUrl: null,
    coverAlt: { en: 'Diagram of load path from roof sheeting to foundation', km: 'ដ្យាក្រាមផ្លូវបញ្ជូនបន្ទុកពីដំបូលទៅគ្រឹះ' },
    references: ['ASCE/SEI 7-22 — load definitions and combinations (use the edition adopted for your project)'],
  },
  {
    id: 'sample-3',
    slug: 'introduction-to-steel-roof-trusses',
    title: { en: 'Introduction to Steel Roof Trusses', km: 'ការណែនាំអំពីត្រូសដំបូលដែក' },
    description: {
      en: 'How trusses carry load through axial forces, common truss shapes and the main design checks.',
      km: 'របៀបដែលត្រូសផ្ទុកបន្ទុកតាមកម្លាំងអ័ក្ស ទម្រង់ត្រូសទូទៅ និងការត្រួតពិនិត្យរចនាសំខាន់ៗ។',
    },
    content: {
      en: `<p>A truss is a framework of members arranged in triangles so that loads are carried mainly by axial tension and compression.</p>
<h2>Basic assumptions</h2>
<ul><li>Joints are idealised as pins.</li><li>Loads are applied at joints (panel points).</li><li>Members carry axial force only, in the simplified model.</li></ul>
<h2>Common shapes</h2>
<p>Pratt, Howe and Warren trusses are widely used for roofs. The choice affects which diagonals are in tension or compression and therefore the member sizes.</p>
<h2>Design checks</h2>
<p>Tension members are checked for yielding and rupture. Compression members are governed by buckling, so effective length and slenderness matter. AISC 360 addresses tension members in Chapter D and compression members in Chapter E; use the edition adopted for your project.</p>
${noteEn}`,
      km: `<p>ត្រូសគឺជាស៊ុមនៃធាតុដែលរៀបជាត្រីកោណ ដើម្បីឲ្យបន្ទុកត្រូវបានផ្ទុកភាគច្រើនដោយកម្លាំងអ័ក្សតឹង និងសង្កត់។</p>
<h2>សម្មតិកម្មមូលដ្ឋាន</h2>
<ul><li>ប្រសព្វត្រូវបានសន្មតជាកូនម៉ូយ (pin)។</li><li>បន្ទុកត្រូវបានដាក់នៅចំណុចប្រសព្វ។</li><li>ក្នុងម៉ូដែលសាមញ្ញ ធាតុផ្ទុកតែកម្លាំងអ័ក្សប៉ុណ្ណោះ។</li></ul>
<h2>ទម្រង់ទូទៅ</h2>
<p>ត្រូស Pratt, Howe និង Warren ត្រូវបានប្រើយ៉ាងទូលំទូលាយសម្រាប់ដំបូល។ ជម្រើសនេះប៉ះពាល់ដល់ថាតើអង្កត់ទ្រូងណាត្រូវតឹង ឬសង្កត់ ហើយដូច្នេះប៉ះពាល់ដល់ទំហំធាតុ។</p>
<h2>ការត្រួតពិនិត្យរចនា</h2>
<p>ធាតុតឹងត្រូវបានត្រួតពិនិត្យសម្រាប់ការឆ្លាក់ (yielding) និងការដាច់។ ធាតុសង្កត់ត្រូវបានកំណត់ដោយការបត់ (buckling) ដូច្នេះប្រវែងមានប្រសិទ្ធភាព និងភាពស្តើងមានសារៈសំខាន់។ AISC 360 ដោះស្រាយធាតុតឹងនៅជំពូក D និងធាតុសង្កត់នៅជំពូក E ហើយត្រូវប្រើកំណែដែលបានអនុម័តសម្រាប់គម្រោងរបស់អ្នក។</p>
${noteKm}`,
    },
    categorySlug: 'steel-structure-design',
    tags: ['steel', 'truss', 'AISC 360'],
    authorName: author,
    authorBio,
    publishedAt: '2026-09-17',
    featured: true,
    readMinutes: 6,
    coverImageUrl: null,
    coverAlt: { en: 'Steel roof truss elevation', km: 'ទិដ្ឋភាពចំហៀងនៃត្រូសដំបូលដែក' },
    references: ['ANSI/AISC 360, Specification for Structural Steel Buildings — Chapters D and E (edition adopted for the project)'],
  },
  {
    id: 'sample-4',
    slug: 'reinforced-concrete-beam-design',
    title: { en: 'Reinforced Concrete Beam Design', km: 'ការរចនាធ្នឹមបេតុងអាមេ' },
    description: {
      en: 'The logic of flexural design for a reinforced concrete beam, from loads to reinforcement.',
      km: 'តក្កៈនៃការរចនាពត់សម្រាប់ធ្នឹមបេតុងអាមេ ចាប់ពីបន្ទុកដល់ដែកគ្រឿង។',
    },
    content: {
      en: `<p>Reinforced concrete beams resist bending through a compression zone in the concrete and tension carried by steel reinforcement.</p>
<h2>Design flow</h2>
<ol><li>Determine factored loads and the design moment and shear.</li><li>Choose a trial section from span and serviceability considerations.</li><li>Calculate the required flexural reinforcement.</li><li>Check minimum and maximum reinforcement limits.</li><li>Design shear reinforcement.</li><li>Check deflection and crack control, and detail the bars.</li></ol>
<h2>Assumptions to state</h2>
<p>Always state concrete strength, reinforcement grade, cover, exposure, units and the code edition used. A result is only meaningful with those assumptions attached.</p>
<h2>Code reference</h2>
<p>ACI 318-19 covers beams in Chapter 9 and sectional strength in Chapter 22. Consult the code text for limits and equations rather than relying on summaries.</p>
${noteEn}`,
      km: `<p>ធ្នឹមបេតុងអាមេទប់ទល់នឹងការពត់តាមរយៈតំបន់សង្កត់ក្នុងបេតុង និងកម្លាំងតឹងដែលផ្ទុកដោយដែកគ្រឿង។</p>
<h2>លំហូរការរចនា</h2>
<ol><li>កំណត់បន្ទុកដែលមានកត្តា និងម៉ូម៉ង់ និងកម្លាំងកាត់សម្រាប់រចនា។</li><li>ជ្រើសរើសផ្នែកសាកល្បងពីចម្ងាយលាត និងការពិចារណាលើការប្រើប្រាស់។</li><li>គណនាដែកគ្រឿងពត់ដែលត្រូវការ។</li><li>ត្រួតពិនិត្យដែនកំណត់ដែកគ្រឿងអប្បបរមា និងអតិបរមា។</li><li>រចនាដែកគ្រឿងកាត់។</li><li>ត្រួតពិនិត្យការខ្វែង និងការគ្រប់គ្រងស្នាមប្រេះ ហើយរៀបលម្អិតដែក។</li></ol>
<h2>សម្មតិកម្មដែលត្រូវបញ្ជាក់</h2>
<p>ត្រូវបញ្ជាក់ជានិច្ចអំពីកម្លាំងបេតុង ថ្នាក់ដែកគ្រឿង កម្រាស់ស្រទាប់ការពារ បរិយាកាស ឯកតា និងកំណែក្រមដែលបានប្រើ។ លទ្ធផលមានន័យលុះត្រាតែមានសម្មតិកម្មទាំងនេះភ្ជាប់មកជាមួយ។</p>
<h2>ឯកសារយោងក្រម</h2>
<p>ACI 318-19 ដោះស្រាយធ្នឹមនៅជំពូកទី ៩ និងកម្លាំងមុខកាត់នៅជំពូកទី ២២។ សូមពិនិត្យអត្ថបទក្រមសម្រាប់ដែនកំណត់ និងសមីការ ជំនួសឲ្យការពឹងផ្អែកលើសេចក្តីសង្ខេប។</p>
${noteKm}`,
    },
    categorySlug: 'reinforced-concrete-design',
    tags: ['concrete', 'beam', 'ACI 318'],
    authorName: author,
    authorBio,
    publishedAt: '2026-09-10',
    featured: false,
    readMinutes: 7,
    coverImageUrl: null,
    coverAlt: { en: 'Cross-section of a reinforced concrete beam', km: 'ផ្នែកកាត់នៃធ្នឹមបេតុងអាមេ' },
    references: ['ACI CODE-318-19, Building Code Requirements for Structural Concrete — Chapters 9 and 22'],
  },
  {
    id: 'sample-5',
    slug: 'column-interaction-diagram',
    title: { en: 'Column Interaction Diagram', km: 'ដ្យាក្រាមអន្តរកម្មសសរ' },
    description: {
      en: 'How an axial force–moment interaction diagram describes the capacity of a concrete column.',
      km: 'របៀបដែលដ្យាក្រាមអន្តរកម្មកម្លាំងអ័ក្ស–ម៉ូម៉ង់ ពិពណ៌នាសមត្ថភាពរបស់សសរបេតុង។',
    },
    content: {
      en: `<p>A column rarely carries axial load alone. The interaction diagram shows combinations of axial force (P) and bending moment (M) that a section can resist.</p>
<h2>Key points on the curve</h2>
<ul><li>Pure compression: maximum axial capacity with no moment.</li><li>Balanced point: concrete crushing and steel yielding occur together.</li><li>Pure bending: moment capacity with no axial load.</li></ul>
<h2>Using the diagram</h2>
<p>Plot the factored demand (Pu, Mu) for each load combination. If every point lies inside the design strength curve, the section has adequate capacity for those combinations. Slenderness effects must be considered separately.</p>
<h2>Code reference</h2>
<p>ACI 318-19 addresses columns in Chapter 10. Strength reduction factors and limits must be taken from the code text.</p>
${noteEn}`,
      km: `<p>សសរកម្រផ្ទុកតែបន្ទុកអ័ក្សតែមួយមុខណាស់។ ដ្យាក្រាមអន្តរកម្មបង្ហាញបន្សំនៃកម្លាំងអ័ក្ស (P) និងម៉ូម៉ង់ពត់ (M) ដែលផ្នែកមួយអាចទប់ទល់បាន។</p>
<h2>ចំណុចសំខាន់លើខ្សែកោង</h2>
<ul><li>ការសង្កត់សុទ្ធ៖ សមត្ថភាពអ័ក្សអតិបរមាដោយគ្មានម៉ូម៉ង់។</li><li>ចំណុចតុល្យភាព (balanced)៖ បេតុងបែក និងដែកឆ្លាក់កើតឡើងព្រមគ្នា។</li><li>ការពត់សុទ្ធ៖ សមត្ថភាពម៉ូម៉ង់ដោយគ្មានបន្ទុកអ័ក្ស។</li></ul>
<h2>ការប្រើដ្យាក្រាម</h2>
<p>គូសតម្រូវការដែលមានកត្តា (Pu, Mu) សម្រាប់បន្សំបន្ទុកនីមួយៗ។ ប្រសិនបើគ្រប់ចំណុចនៅក្នុងខ្សែកោងកម្លាំងរចនា ផ្នែកនោះមានសមត្ថភាពគ្រប់គ្រាន់សម្រាប់បន្សំទាំងនោះ។ ផលប៉ះពាល់នៃភាពស្តើងត្រូវពិចារណាដោយឡែក។</p>
<h2>ឯកសារយោងក្រម</h2>
<p>ACI 318-19 ដោះស្រាយសសរនៅជំពូកទី ១០។ កត្តាកាត់បន្ថយកម្លាំង និងដែនកំណត់ត្រូវយកពីអត្ថបទក្រម។</p>
${noteKm}`,
    },
    categorySlug: 'reinforced-concrete-design',
    tags: ['concrete', 'column', 'interaction diagram'],
    authorName: author,
    authorBio,
    publishedAt: '2026-09-03',
    featured: false,
    readMinutes: 6,
    coverImageUrl: null,
    coverAlt: { en: 'P–M interaction diagram', km: 'ដ្យាក្រាមអន្តរកម្ម P–M' },
    references: ['ACI CODE-318-19, Building Code Requirements for Structural Concrete — Chapter 10'],
  },
  {
    id: 'sample-6',
    slug: 'etabs-structural-modeling-basics',
    title: { en: 'ETABS Structural Modeling Basics', km: 'មូលដ្ឋានគ្រឹះនៃការបង្កើតម៉ូដែលរចនាសម្ព័ន្ធក្នុង ETABS' },
    description: {
      en: 'A sensible order of work for building and checking a simple building model in ETABS.',
      km: 'លំដាប់ការងារសមរម្យសម្រាប់បង្កើត និងត្រួតពិនិត្យម៉ូដែលអគារសាមញ្ញក្នុង ETABS។',
    },
    content: {
      en: `<p>Good models are built in a deliberate order, and checked before anyone trusts the results.</p>
<h2>Suggested workflow</h2>
<ol><li>Set units and define grids and stories.</li><li>Define materials and section properties.</li><li>Draw columns, beams, walls and slabs.</li><li>Assign supports, diaphragms and releases.</li><li>Define load patterns and load combinations.</li><li>Run the analysis and review results.</li></ol>
<h2>Check the model</h2>
<p>Compare total reaction with hand-calculated total load, review deformed shapes, and look for warnings. Menu names and options may differ between ETABS versions, so follow the documentation for your version.</p>
<h2>Software is not a substitute for judgement</h2>
<p>Results are only as good as the model and assumptions. Always review them with engineering judgement and the governing code.</p>
${noteEn}`,
      km: `<p>ម៉ូដែលល្អត្រូវបានបង្កើតតាមលំដាប់មានគោលបំណង ហើយត្រូវបានត្រួតពិនិត្យមុនពេលមាននរណាម្នាក់ទុកចិត្តលទ្ធផល។</p>
<h2>លំហូរការងារដែលណែនាំ</h2>
<ol><li>កំណត់ឯកតា និងកំណត់បណ្តាញ (grid) និងជាន់។</li><li>កំណត់សម្ភារៈ និងលក្ខណៈផ្នែក។</li><li>គូសសសរ ធ្នឹម ជញ្ជាំង និងផ្ទាំងសន្លឹម។</li><li>កំណត់ទ្រទ្រង់ ផ្ទាំងរឹង (diaphragm) និងការដោះ (release)។</li><li>កំណត់គំរូបន្ទុក និងបន្សំបន្ទុក។</li><li>ដំណើរការការវិភាគ និងពិនិត្យលទ្ធផល។</li></ol>
<h2>ត្រួតពិនិត្យម៉ូដែល</h2>
<p>ប្រៀបធៀបប្រតិកម្មសរុបជាមួយបន្ទុកសរុបដែលគណនាដោយដៃ ពិនិត្យរូបរាងខូចទ្រង់ទ្រាយ និងរកមើលការព្រមាន។ ឈ្មោះម៉ឺនុយ និងជម្រើសអាចខុសគ្នារវាងកំណែ ETABS ដូច្នេះសូមធ្វើតាមឯកសារសម្រាប់កំណែរបស់អ្នក។</p>
<h2>កម្មវិធីមិនជំនួសការវិនិច្ឆ័យទេ</h2>
<p>លទ្ធផលល្អត្រឹមតែម៉ូដែល និងសម្មតិកម្មប៉ុណ្ណោះ។ ត្រូវពិនិត្យលទ្ធផលជានិច្ចដោយការវិនិច្ឆ័យវិស្វកម្ម និងក្រមគ្រប់គ្រង។</p>
${noteKm}`,
    },
    categorySlug: 'etabs',
    tags: ['ETABS', 'modelling', 'workflow'],
    authorName: author,
    authorBio,
    publishedAt: '2026-08-27',
    featured: false,
    readMinutes: 7,
    coverImageUrl: null,
    coverAlt: { en: 'Building model in ETABS', km: 'ម៉ូដែលអគារក្នុង ETABS' },
    references: ['CSI ETABS documentation for the version you use'],
  },
  {
    id: 'sample-7',
    slug: 'wind-load-calculation-concepts',
    title: { en: 'Wind Load Calculation Concepts', km: 'គោលគំនិតនៃការគណនាបន្ទុកខ្យល់' },
    description: {
      en: 'The ideas behind wind load determination, before you open the code tables.',
      km: 'គំនិតនៅពីក្រោយការកំណត់បន្ទុកខ្យល់ មុនពេលអ្នកបើកតារាងក្នុងក្រម។',
    },
    content: {
      en: `<p>Wind loading depends on the site, the building shape and how the structure responds. Understanding the concepts helps you use any code method correctly.</p>
<h2>Main inputs</h2>
<ul><li>Basic wind speed for the location and risk category.</li><li>Exposure (surrounding terrain) and topographic effects.</li><li>Building geometry, height and enclosure classification.</li><li>Gust and dynamic response factors.</li></ul>
<h2>Two load types</h2>
<p>The main wind force resisting system carries overall wind forces, while components and cladding are designed for local, often higher, pressures.</p>
<h2>Code reference</h2>
<p>ASCE 7-22 covers wind loads in Chapters 26 to 31. In Cambodia, confirm which standard and wind speed data the authority having jurisdiction accepts. No design pressures are given here because they depend on project-specific inputs.</p>
${noteEn}`,
      km: `<p>បន្ទុកខ្យល់អាស្រ័យលើទីតាំង រូបរាងអគារ និងរបៀបដែលរចនាសម្ព័ន្ធឆ្លើយតប។ ការយល់ដឹងពីគំនិតទាំងនេះជួយឲ្យអ្នកប្រើវិធីសាស្ត្រក្រមណាមួយបានត្រឹមត្រូវ។</p>
<h2>ទិន្នន័យចូលសំខាន់ៗ</h2>
<ul><li>ល្បឿនខ្យល់មូលដ្ឋានសម្រាប់ទីតាំង និងប្រភេទហានិភ័យ។</li><li>ស្ថានភាពបរិស្ថាន (ភូមិសាស្ត្របរិវេណ) និងឥទ្ធិពលនៃកម្ពស់ដី។</li><li>រូបរាងអគារ កម្ពស់ និងចំណាត់ថ្នាក់នៃការបិទជិត។</li><li>កត្តាខ្យល់បក់ និងកត្តាឆ្លើយតបថាមវន្ត។</li></ul>
<h2>ប្រភេទបន្ទុកពីរ</h2>
<p>ប្រព័ន្ធទប់ទល់កម្លាំងខ្យល់ចម្បងផ្ទុកកម្លាំងខ្យល់សរុប ខណៈពេលដែលធាតុរចនាសម្ព័ន្ធ និងស្រទាប់ស្បែកអគារត្រូវបានរចនាសម្រាប់សម្ពាធក្នុងតំបន់ ដែលជារឿយៗខ្ពស់ជាង។</p>
<h2>ឯកសារយោងក្រម</h2>
<p>ASCE 7-22 ដោះស្រាយបន្ទុកខ្យល់នៅជំពូកទី ២៦ ដល់ ៣១។ នៅកម្ពុជា សូមផ្ទៀងផ្ទាត់ថាតើស្តង់ដារ និងទិន្នន័យល្បឿនខ្យល់ណាដែលអាជ្ញាធរមានសមត្ថកិច្ចទទួលយក។ យើងមិនផ្តល់សម្ពាធរចនានៅទីនេះទេ ពីព្រោះវាអាស្រ័យលើទិន្នន័យជាក់លាក់នៃគម្រោង។</p>
${noteKm}`,
    },
    categorySlug: 'structural-engineering',
    tags: ['wind', 'ASCE 7', 'loads'],
    authorName: author,
    authorBio,
    publishedAt: '2026-08-20',
    featured: false,
    readMinutes: 6,
    coverImageUrl: null,
    coverAlt: { en: 'Wind flow around a building', km: 'លំហូរខ្យល់ជុំវិញអគារ' },
    references: ['ASCE/SEI 7-22 — Wind Loads, Chapters 26 to 31'],
  },
  {
    id: 'sample-8',
    slug: 'foundation-design-fundamentals',
    title: { en: 'Foundation Design Fundamentals', km: 'មូលដ្ឋានគ្រឹះនៃការរចនាគ្រឹះ' },
    description: {
      en: 'Foundation types, what the soil must provide, and how geotechnical and structural design connect.',
      km: 'ប្រភេទគ្រឹះ អ្វីដែលដីត្រូវផ្តល់ និងរបៀបដែលការរចនាភូគព្ភសាស្ត្របច្ចេកទេស និងរចនាសម្ព័ន្ធភ្ជាប់គ្នា។',
    },
    content: {
      en: `<p>A foundation transfers structural loads safely to the ground. It must limit both soil failure and settlement.</p>
<h2>Common foundation types</h2>
<ul><li>Isolated footings under single columns.</li><li>Combined or strip footings under several columns or walls.</li><li>Mat (raft) foundations for heavy or closely spaced loads.</li><li>Piles where shallow soil is weak or loads are high.</li></ul>
<h2>Geotechnical and structural work</h2>
<p>The geotechnical investigation provides soil properties and recommended bearing or pile capacities. The structural engineer then sizes the foundation and designs the reinforcement. Never assume soil values without a site investigation.</p>
<h2>Code reference</h2>
<p>ACI 318-19 addresses concrete foundations in Chapter 13. Soil bearing and settlement limits come from the geotechnical report and applicable local requirements.</p>
${noteEn}`,
      km: `<p>គ្រឹះបញ្ជូនបន្ទុករចនាសម្ព័ន្ធទៅដីដោយសុវត្ថិភាព។ វាត្រូវកម្រិតទាំងការបាក់ដី និងការធ្លាក់ដី។</p>
<h2>ប្រភេទគ្រឹះទូទៅ</h2>
<ul><li>គ្រឹះឯកាក្រោមសសរតែមួយ។</li><li>គ្រឹះបន្សំ ឬគ្រឹះបន្ទាត់ក្រោមសសរច្រើន ឬជញ្ជាំង។</li><li>គ្រឹះផ្ទាំងធំ (mat/raft) សម្រាប់បន្ទុកធ្ងន់ ឬបន្ទុកដាក់ជិតគ្នា។</li><li>ជ្រុំ (pile) នៅពេលដីស្រទាប់លើខ្សោយ ឬបន្ទុកខ្ពស់។</li></ul>
<h2>ការងារភូគព្ភសាស្ត្របច្ចេកទេស និងរចនាសម្ព័ន្ធ</h2>
<p>ការស្ទង់ភូគព្ភសាស្ត្របច្ចេកទេសផ្តល់លក្ខណៈដី និងសមត្ថភាពទ្រទម្ងន់ ឬជ្រុំដែលបានណែនាំ។ បន្ទាប់មកវិស្វករផ្នែករចនាសម្ព័ន្ធកំណត់ទំហំគ្រឹះ និងរចនាដែកគ្រឿង។ កុំសន្មតតម្លៃដីដោយគ្មានការស្ទង់ទីតាំងឡើយ។</p>
<h2>ឯកសារយោងក្រម</h2>
<p>ACI 318-19 ដោះស្រាយគ្រឹះបេតុងនៅជំពូកទី ១៣។ ដែនកំណត់ទ្រទម្ងន់ និងការធ្លាក់ដីមកពីរបាយការណ៍ភូគព្ភសាស្ត្របច្ចេកទេស និងតម្រូវការក្នុងស្រុកដែលពាក់ព័ន្ធ។</p>
${noteKm}`,
    },
    categorySlug: 'reinforced-concrete-design',
    tags: ['foundation', 'geotechnical', 'ACI 318'],
    authorName: author,
    authorBio,
    publishedAt: '2026-08-13',
    featured: false,
    readMinutes: 6,
    coverImageUrl: null,
    coverAlt: { en: 'Types of building foundations', km: 'ប្រភេទគ្រឹះអគារ' },
    references: ['ACI CODE-318-19, Building Code Requirements for Structural Concrete — Chapter 13', 'Project geotechnical investigation report'],
  },
];
