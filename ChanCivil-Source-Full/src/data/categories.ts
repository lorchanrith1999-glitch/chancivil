import type { Category } from '../types';

/** Article categories (sample data; managed in Admin -> Categories from Phase 3). */
export const articleCategories: Category[] = [
  {
    slug: 'structural-engineering',
    name: { en: 'Structural Engineering', km: 'វិស្វកម្មរចនាសម្ព័ន្ធ' },
    description: { en: 'Loads, analysis and behaviour of structures.', km: 'បន្ទុក ការវិភាគ និងឥរិយាបថរបស់រចនាសម្ព័ន្ធ។' },
    icon: 'building',
  },
  {
    slug: 'reinforced-concrete-design',
    name: { en: 'Reinforced Concrete Design', km: 'ការរចនាបេតុងអាមេ' },
    description: { en: 'Beams, columns, slabs and foundations in concrete.', km: 'ធ្នឹម សសរ ផ្ទាំងសន្លឹម និងគ្រឹះបេតុង។' },
    icon: 'layers',
  },
  {
    slug: 'steel-structure-design',
    name: { en: 'Steel Structure Design', km: 'ការរចនារចនាសម្ព័ន្ធដែក' },
    description: { en: 'Trusses, frames and connections in structural steel.', km: 'ត្រូស ស៊ុម និងការតភ្ជាប់ក្នុងរចនាសម្ព័ន្ធដែក។' },
    icon: 'hardhat',
  },
  {
    slug: 'construction-engineering',
    name: { en: 'Construction Engineering', km: 'វិស្វកម្មសំណង់' },
    description: { en: 'Methods, planning and site practice.', km: 'វិធីសាស្ត្រ ការធ្វើផែនការ និងការអនុវត្តនៅការដ្ឋាន។' },
    icon: 'hammer',
  },
  {
    slug: 'engineering-mathematics',
    name: { en: 'Engineering Mathematics', km: 'គណិតវិទ្យាវិស្វកម្ម' },
    description: { en: 'Mathematical tools used in engineering calculations.', km: 'ឧបករណ៍គណិតវិទ្យាដែលប្រើក្នុងការគណនាវិស្វកម្ម។' },
    icon: 'sigma',
  },
  {
    slug: 'autocad',
    name: { en: 'AutoCAD', km: 'AutoCAD' },
    description: { en: 'Drafting workflows and drawing standards.', km: 'ដំណើរការគូរប្លង់ និងស្តង់ដារគំនូរ។' },
    icon: 'ruler',
  },
  {
    slug: 'etabs',
    name: { en: 'ETABS', km: 'ETABS' },
    description: { en: 'Building modelling and analysis in ETABS.', km: 'ការបង្កើតម៉ូដែល និងវិភាគអគារក្នុង ETABS។' },
    icon: 'cuboid',
  },
  {
    slug: 'safe',
    name: { en: 'SAFE', km: 'SAFE' },
    description: { en: 'Slab and foundation design in SAFE.', km: 'ការរចនាផ្ទាំងសន្លឹម និងគ្រឹះក្នុង SAFE។' },
    icon: 'grid',
  },
  {
    slug: 'sap2000',
    name: { en: 'SAP2000', km: 'SAP2000' },
    description: { en: 'General structural analysis in SAP2000.', km: 'ការវិភាគរចនាសម្ព័ន្ធទូទៅក្នុង SAP2000។' },
    icon: 'network',
  },
  {
    slug: 'revit-bim',
    name: { en: 'Revit and BIM', km: 'Revit និង BIM' },
    description: { en: 'Building information modelling workflows.', km: 'ដំណើរការម៉ូដែលព័ត៌មានអគារ។' },
    icon: 'box',
  },
  {
    slug: 'surveying-geomatics',
    name: { en: 'Surveying and Geomatics', km: 'ការស្ទង់វាស់ និង Geomatics' },
    description: { en: 'Measurement, mapping and site data.', km: 'ការវាស់វែង ការគូសផែនទី និងទិន្នន័យការដ្ឋាន។' },
    icon: 'compass',
  },
  {
    slug: 'codes-standards',
    name: { en: 'Engineering Codes and Standards', km: 'ក្រម និងស្តង់ដារវិស្វកម្ម' },
    description: { en: 'Understanding and applying design codes.', km: 'ការយល់ដឹង និងការអនុវត្តក្រមរចនា។' },
    icon: 'book',
  },
];

/** Resource categories (sample data). */
export const resourceCategories: Category[] = [
  { slug: 'excel-spreadsheets', name: { en: 'Excel Calculation Spreadsheets', km: 'ឯកសារគណនា Excel' }, description: { en: '', km: '' }, icon: 'file' },
  { slug: 'design-templates', name: { en: 'Structural Design Templates', km: 'ទម្រង់រចនាសម្ព័ន្ធ' }, description: { en: '', km: '' }, icon: 'file' },
  { slug: 'formulas', name: { en: 'Engineering Formulas', km: 'រូបមន្តវិស្វកម្ម' }, description: { en: '', km: '' }, icon: 'file' },
  { slug: 'pdf-guides', name: { en: 'PDF Guides', km: 'មគ្គុទ្ទេសក៍ PDF' }, description: { en: '', km: '' }, icon: 'file' },
  { slug: 'checklists', name: { en: 'Design Checklists', km: 'បញ្ជីត្រួតពិនិត្យការរចនា' }, description: { en: '', km: '' }, icon: 'file' },
  { slug: 'etabs-resources', name: { en: 'ETABS Resources', km: 'ធនធាន ETABS' }, description: { en: '', km: '' }, icon: 'file' },
  { slug: 'safe-resources', name: { en: 'SAFE Resources', km: 'ធនធាន SAFE' }, description: { en: '', km: '' }, icon: 'file' },
  { slug: 'aisc-resources', name: { en: 'AISC Resources', km: 'ធនធាន AISC' }, description: { en: '', km: '' }, icon: 'file' },
  { slug: 'aci-resources', name: { en: 'ACI Resources', km: 'ធនធាន ACI' }, description: { en: '', km: '' }, icon: 'file' },
  { slug: 'asce-resources', name: { en: 'ASCE Resources', km: 'ធនធាន ASCE' }, description: { en: '', km: '' }, icon: 'file' },
  { slug: 'bim-revit-resources', name: { en: 'BIM and Revit Resources', km: 'ធនធាន BIM និង Revit' }, description: { en: '', km: '' }, icon: 'file' },
];
