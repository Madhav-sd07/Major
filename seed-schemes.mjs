import 'dotenv/config';
import mongoose from 'mongoose';
import Scheme from './models/Scheme.js';

const MONGO = process.env.MONGODB_URI;
if (!MONGO) {
  console.error('Set MONGODB_URI in .env');
  process.exit(1);
}

// Allowed enums from your schema:
const ALLOWED_CATEGORIES = ['General','SC','ST','OBC','EWS'];

// Helper - normalize categories array to allowed enums (fallback to 'General')
function normalizeCategories(arr = []) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const val of arr) {
    if (!val || typeof val !== 'string') continue;
    const v = val.trim();
    // match case-insensitive
    const matched = ALLOWED_CATEGORIES.find(a => a.toLowerCase() === v.toLowerCase());
    if (matched) {
      out.push(matched);
    } else {
      // If val looks like common synonym, map it specifically:
      if (v.toLowerCase() === 'bpl') {
        // map BPL to EWS (or change to 'General' if you prefer)
        out.push('EWS');
      } else {
        // fallback
        out.push('General');
      }
    }
  }
  // remove duplicates
  return [...new Set(out)];
}

// Helper to create a safe slug for placeholder apply links
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const schemes = [
  {
    name: 'Pradhan Mantri Awas Yojana',
    description: 'Affordable housing assistance for economically weaker sections, low income and middle income groups through subsidy and support for house construction and enhancement.',
    category: 'Housing',
    ministry: 'Ministry of Housing and Urban Affairs',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['EWS','General'],
      states: [],
      occupations: [],
      familySize: 6
    },
    benefits: ['Interest subsidy', 'Financial assistance for construction/extension'],
    documentsRequired: ['Aadhaar', 'Income certificate', 'Property papers'],
    applicationProcess: 'Apply via PMAY portal or designated urban/rural centres with required docs.',
    officialWebsite: 'https://pmay.gov.in',
    applyLink: 'https://pmay.gov.in',
    contactInfo: {},
    status: 'Active',
    tags: ['housing','pmay']
  },
  {
    name: 'Pradhan Mantri Jan Dhan Yojana',
    description: 'Financial inclusion programme to provide basic bank accounts and financial services to unbanked households.',
    category: 'Financial',
    ministry: 'Ministry of Finance',
    eligibilityCriteria: {
      minAge: 10,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      states: [],
      occupations: []
    },
    benefits: ['Zero balance account', 'RuPay debit card', 'Insurance and overdraft facilities'],
    documentsRequired: ['Aadhaar', 'Address proof'],
    applicationProcess: 'Open account at bank branch or financial inclusion camp with KYC.',
    officialWebsite: 'https://pmjdy.gov.in',
    applyLink: 'https://pmjdy.gov.in',
    contactInfo: {},
    status: 'Active',
    tags: ['banking','financial-inclusion']
  },
  {
    name: 'National Food Security Act (NFSA) - Public Distribution System',
    description: 'Provision of subsidised food grains to eligible households under the Public Distribution System.',
    category: 'Other',
    ministry: 'Ministry of Consumer Affairs, Food & Public Distribution',
    eligibilityCriteria: {
      gender: 'Any',
      categories: ['EWS','General'],
      maxIncome: 250000
    },
    benefits: ['Subsidised rice/wheat per household per month'],
    documentsRequired: ['Ration card', 'Identity proof'],
    applicationProcess: 'Apply via state ration office; inclusion determined by state/central lists.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('National Food Security Act (NFSA) - Public Distribution System')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['food','pds']
  },
  {
    name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    description: 'Comprehensive health insurance scheme providing cashless secondary and tertiary care for eligible families.',
    category: 'Healthcare',
    ministry: 'Ministry of Health and Family Welfare',
    eligibilityCriteria: {
      gender: 'Any',
      categories: ['EWS','General'],
      maxIncome: 250000
    },
    benefits: ['Health cover up to specified amount per family per year', 'Cashless treatment at empanelled hospitals'],
    documentsRequired: ['Aadhaar', 'Golden Card or eligibility ID'],
    applicationProcess: 'Check eligibility on PM-JAY portal and visit empanelled hospital for treatment.',
    officialWebsite: 'https://pmjay.gov.in',
    applyLink: 'https://pmjay.gov.in',
    contactInfo: {},
    status: 'Active',
    tags: ['health','insurance','pmjay']
  },
  {
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    description: 'Direct income support to small and marginal farmer families to supplement their financial needs.',
    category: 'Agriculture',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      states: [],
      occupations: ['Farmer']
    },
    benefits: ['Direct transfer of specified sum to eligible farmers in installments'],
    documentsRequired: ['Aadhaar', 'Land records', 'Farmer ID where applicable'],
    applicationProcess: 'Register via PM-KISAN portal or through state agriculture departments.',
    officialWebsite: 'https://pmkisan.gov.in',
    applyLink: 'https://pmkisan.gov.in',
    contactInfo: {},
    status: 'Active',
    tags: ['farmers','direct-benefit']
  },
  {
    name: 'Kisan Credit Card (KCC)',
    description: 'Short-term loans to farmers for agriculture and allied activities at concessional interest rates.',
    category: 'Agriculture',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      occupations: ['Farmer']
    },
    benefits: ['Crop loans, working capital, overdraft facility'],
    documentsRequired: ['Aadhaar', 'KYC', 'Land record or farmer ID'],
    applicationProcess: 'Apply at bank branch or through cooperative bank with required documents.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Kisan Credit Card (KCC)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['kcc','agriculture','credit']
  },
  {
    name: 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)',
    description: 'Provides at least 100 days of guaranteed wage employment in a financial year to rural households.',
    category: 'Employment',
    ministry: 'Ministry of Rural Development',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      occupations: ['Rural household member']
    },
    benefits: ['Wage employment, asset creation in rural areas'],
    documentsRequired: ['Aadhaar', 'Ration card or other residence proof'],
    applicationProcess: 'Register at Gram Panchayat and apply for work; work offered within 15 days.',
    officialWebsite: 'https://nregaservices.nic.in',
    applyLink: 'https://nregaservices.nic.in',
    contactInfo: {},
    status: 'Active',
    tags: ['rural','employment','mgnrega']
  },
  {
    name: 'Pradhan Mantri Street Vendor\'s AtmaNirbhar Nidhi (PM SVANidhi)',
    description: 'Micro-credit facility for street vendors to resume livelihood activities after COVID-19 lockdowns.',
    category: 'Employment',
    ministry: 'Ministry of Housing and Urban Affairs',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      occupations: ['Street Vendor']
    },
    benefits: ['Collateral-free working capital loans', 'Incentives for digital transactions'],
    documentsRequired: ['Vendor ID', 'Aadhaar', 'Business proof'],
    applicationProcess: 'Apply via PM SVANidhi portal through local municipal authorities.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify("Pradhan Mantri Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)")}`,
    contactInfo: {},
    status: 'Active',
    tags: ['microcredit','vendors']
  },
  {
    name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
    description: 'Short-term skill training and certification to increase employability of youth.',
    category: 'Employment',
    ministry: 'Ministry of Skill Development and Entrepreneurship',
    eligibilityCriteria: {
      minAge: 16,
      maxAge: 35,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Free/assisted training', 'Certification', 'Placement assistance'],
    documentsRequired: ['Aadhaar', 'Education certificates'],
    applicationProcess: 'Register on PMKVY portal or at training centres and enroll into courses.',
    officialWebsite: 'https://pmkvyofficial.org',
    applyLink: 'https://pmkvyofficial.org',
    contactInfo: {},
    status: 'Active',
    tags: ['skills','training']
  },
  {
    name: 'Ujjwala Yojana (Pradhan Mantri Ujjwala Yojana)',
    description: 'Provides free LPG connections to women from below poverty line households to reduce health hazards from cooking with unclean fuels.',
    category: 'Other',
    ministry: 'Ministry of Petroleum and Natural Gas',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Female',
      categories: ['EWS','General'],
      occupations: []
    },
    benefits: ['Free LPG connection and subsidy for initial refills'],
    documentsRequired: ['Aadhaar', 'Ration card or BPL certificate'],
    applicationProcess: 'Apply through Ujjwala centre or LPG distributor with required documents.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Ujjwala Yojana (Pradhan Mantri Ujjwala Yojana)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['clean-cooking','women']
  },
  {
    name: 'Sukanya Samriddhi Yojana',
    description: 'Small savings scheme for girls to promote their education and welfare with attractive interest rates and tax benefits.',
    category: 'Financial',
    ministry: 'Ministry of Finance',
    eligibilityCriteria: {
      minAge: 0,
      maxAge: 10,
      gender: 'Female',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Guaranteed returns, tax benefits, maturity corpus for girl child'],
    documentsRequired: ['Birth certificate', 'Aadhaar of child and guardian'],
    applicationProcess: 'Open account at post office or designated banks under SSY rules.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Sukanya Samriddhi Yojana')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['girls','savings']
  },
  {
    name: 'Beti Bachao Beti Padhao',
    description: 'Campaign to address declining child sex ratio and promote education and empowerment of girls.',
    category: 'Women',
    ministry: 'Ministry of Women and Child Development',
    eligibilityCriteria: {
      gender: 'Female',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Awareness campaigns, incentives under linked schemes'],
    documentsRequired: [],
    applicationProcess: 'Schemes implemented via state nodal agencies and education departments.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Beti Bachao Beti Padhao')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['girls','education']
  },
  {
    name: 'Pradhan Mantri Jan Suraksha Yojana (PMJJBY & PMSBY)',
    description: 'Small-ticket life and accident insurance schemes for widespread coverage at nominal premium.',
    category: 'Financial',
    ministry: 'Ministry of Finance',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 70,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Life insurance cover (PMJJBY), accidental death/disability cover (PMSBY)'],
    documentsRequired: ['Aadhaar', 'Active bank account'],
    applicationProcess: 'Enroll via bank account with consent for auto-debit of premium.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Pradhan Mantri Jan Suraksha Yojana (PMJJBY & PMSBY)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['insurance','social-security']
  },
  {
    name: 'Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)',
    description: 'Pension scheme for unorganised sector workers providing assured monthly pension after 60 years.',
    category: 'Financial',
    ministry: 'Ministry of Labour and Employment',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 40,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      occupations: ['Unorganised worker']
    },
    benefits: ['Fixed monthly pension after attaining 60 years'],
    documentsRequired: ['Aadhaar', 'Occupation proof'],
    applicationProcess: 'Register at CSP/online portals and pay monthly contribution.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['pension','labour']
  },
  {
    name: 'Pradhan Mantri Kaushal Kendra - Skill India Centres',
    description: 'Centres offering industry-aligned skill training and certification in various trades.',
    category: 'Employment',
    ministry: 'Ministry of Skill Development and Entrepreneurship',
    eligibilityCriteria: {
      minAge: 16,
      maxAge: 60,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Skill certificates, placement assistance'],
    documentsRequired: ['Aadhaar', 'Education certificate'],
    applicationProcess: 'Register at nearest Kaushal Kendra or online portal.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Pradhan Mantri Kaushal Kendra - Skill India Centres')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['skills','training']
  },
  {
    name: 'National Social Assistance Programme (NSAP)',
    description: 'Provides social assistance to elderly, widows and persons with disability in the form of pensions.',
    category: 'Other',
    ministry: 'Ministry of Rural Development',
    eligibilityCriteria: {
      minAge: 60,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Monthly pension under various sub-schemes'],
    documentsRequired: ['Aadhaar', 'Age proof'],
    applicationProcess: 'Apply through state social welfare departments.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('National Social Assistance Programme (NSAP)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['pension','welfare']
  },
  {
    name: 'Mid-Day Meal Scheme',
    description: 'Provides free lunches to school children to improve nutrition and school attendance.',
    category: 'Education',
    ministry: 'Ministry of Education',
    eligibilityCriteria: {
      minAge: 5,
      maxAge: 18,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Free hot cooked meals for enrolled students in government and government-aided schools'],
    documentsRequired: ['School enrollment details'],
    applicationProcess: 'Implemented through schools; parents enroll children in local schools.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Mid-Day Meal Scheme')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['education','nutrition']
  },
  {
    name: 'National Means-cum-Merit Scholarship Scheme',
    description: 'Scholarships for meritorious students from economically weaker sections to prevent dropouts.',
    category: 'Education',
    ministry: 'Ministry of Education',
    eligibilityCriteria: {
      minAge: 14,
      gender: 'Any',
      categories: ['EWS','General'],
      maxIncome: 200000
    },
    benefits: ['Yearly scholarship for selected students'],
    documentsRequired: ['Marksheets','Income certificate','Aadhaar'],
    applicationProcess: 'Apply online through scholarship portal and submit required documents.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('National Means-cum-Merit Scholarship Scheme')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['scholarship','education']
  },
  {
    name: 'National Health Mission (NHM)',
    description: 'Provides accessible, affordable and quality health care through strengthening of health systems in rural and urban areas.',
    category: 'Healthcare',
    ministry: 'Ministry of Health and Family Welfare',
    eligibilityCriteria: {
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Primary healthcare, maternal and child health services, disease control programmes'],
    documentsRequired: ['Aadhaar (if required)'],
    applicationProcess: 'Services provided through public health centres and community health workers.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('National Health Mission (NHM)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['health','nhm']
  },
  {
    name: 'Integrated Child Development Services (ICDS)',
    description: 'Provides food, preschool education, and primary healthcare to children under 6 years and their mothers.',
    category: 'Other',
    ministry: 'Ministry of Women and Child Development',
    eligibilityCriteria: {
      minAge: 0,
      maxAge: 6,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Supplementary nutrition, immunization, health check-ups, pre-school education'],
    documentsRequired: ['Aadhaar or local enrolment documents'],
    applicationProcess: 'Access services via Anganwadi centres and local health facilities.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Integrated Child Development Services (ICDS)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['children','nutrition']
  },
  {
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Crop insurance scheme offering financial support to farmers affected by crop loss due to natural calamities.',
    category: 'Agriculture',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      occupations: ['Farmer']
    },
    benefits: ['Compensation for crop loss, premium subsidy'],
    documentsRequired: ['Aadhaar', 'Land records', 'Crop details'],
    applicationProcess: 'Enroll through insurance service providers or state agriculture departments.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Pradhan Mantri Fasal Bima Yojana (PMFBY)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['crop-insurance','farmers']
  },
  {
    name: 'National Livestock Mission',
    description: 'Promotes sustainable development of the livestock sector through support to infrastructure, breed improvement and health care.',
    category: 'Agriculture',
    ministry: 'Ministry of Fisheries, Animal Husbandry & Dairying',
    eligibilityCriteria: {
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      occupations: ['Livestock rearer','Farmer']
    },
    benefits: ['Support for animal health, fodder development, breed improvement'],
    documentsRequired: ['Aadhaar', 'Farmer/livestock owner details'],
    applicationProcess: 'Apply via state animal husbandry departments and local offices.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('National Livestock Mission')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['livestock','agriculture']
  },
  {
    name: 'PM AWAAS (Gramin) - Rural Housing (Indira Awas Yojana merged with PMAY Gramin)',
    description: 'Housing assistance for Below Poverty Line (BPL) families in rural areas to construct pucca houses.',
    category: 'Housing',
    ministry: 'Ministry of Rural Development',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['EWS','General'],
      occupations: []
    },
    benefits: ['Financial assistance for house construction'],
    documentsRequired: ['Aadhaar', 'BPL/ration card or other inclusion documents'],
    applicationProcess: 'Apply through Gram Panchayat or state rural development portal.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('PM AWAAS (Gramin) - Rural Housing')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['rural','housing']
  },
  {
    name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
    description: 'Placement-linked skill training program for rural youth to secure sustainable employment.',
    category: 'Employment',
    ministry: 'Ministry of Rural Development',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 35,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Skill training, certification and placement support'],
    documentsRequired: ['Aadhaar', 'Education certificate'],
    applicationProcess: 'Register at training centres affiliated to DDU-GKY or online portal.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['rural','skills']
  },
  {
    name: 'National Old Age Pension Scheme (under NSAP)',
    description: 'Social pension for senior citizens below the poverty line or meeting state-specific criteria.',
    category: 'Other',
    ministry: 'Ministry of Social Justice & Empowerment / Ministry of Rural Development',
    eligibilityCriteria: {
      minAge: 60,
      gender: 'Any',
      categories: ['EWS','General']
    },
    benefits: ['Monthly pension to eligible senior citizens'],
    documentsRequired: ['Aadhaar', 'Age proof', 'Residence proof'],
    applicationProcess: 'Apply through state welfare departments or local panchayat offices.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('National Old Age Pension Scheme (under NSAP)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['senior','pension']
  },
  {
    name: 'National Handloom Development Programme',
    description: 'Support for handloom weavers including marketing, skills training and cluster development.',
    category: 'Other',
    ministry: 'Ministry of Textiles',
    eligibilityCriteria: {
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      occupations: ['Weaver']
    },
    benefits: ['Training, subsidies, market support and credit linkages'],
    documentsRequired: ['Weaver ID', 'Aadhaar'],
    applicationProcess: 'Apply through state handloom offices or designated nodal agencies.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('National Handloom Development Programme')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['crafts','weavers']
  },
  {
    name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    description: 'Conditional cash transfer scheme for pregnant and lactating women for first living child to provide partial wage compensation.',
    category: 'Healthcare',
    ministry: 'Ministry of Women and Child Development',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 45,
      gender: 'Female',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Cash benefits paid in instalments upon meeting health/nutrition conditions'],
    documentsRequired: ['Aadhaar', 'Pregnancy card or health records'],
    applicationProcess: 'Register at Anganwadi/health centres and claim via designated portals.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Pradhan Mantri Matru Vandana Yojana (PMMVY)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['maternal','health']
  },
  {
    name: 'Pradhan Mantri Rashtriya Bal Puraskar (Child Awards) - Support Programmes',
    description: 'Recognition and support for exceptional children in various fields; linked programmes for child development.',
    category: 'Other',
    ministry: 'Ministry of Women and Child Development',
    eligibilityCriteria: {
      minAge: 5,
      maxAge: 18,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Recognition, awards, and development support'],
    documentsRequired: ['Proof of achievement', 'Birth certificate'],
    applicationProcess: 'Nomination or application through designated channels.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Pradhan Mantri Rashtriya Bal Puraskar (Child Awards) - Support Programmes')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['children','awards']
  },
  {
    name: 'Pradhan Mantri National Apprenticeship Promotion Scheme (MP-NAPS)',
    description: 'Subsidy to employers for apprentice training to expand apprenticeship opportunities.',
    category: 'Employment',
    ministry: 'Ministry of Skill Development and Entrepreneurship',
    eligibilityCriteria: {
      minAge: 14,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      occupations: ['Apprentice']
    },
    benefits: ['Employer subsidy for apprenticeship training cost'],
    documentsRequired: ['Aadhaar', 'Apprenticeship contract'],
    applicationProcess: 'Register employer and apprentices on apprenticeship portal.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Pradhan Mantri National Apprenticeship Promotion Scheme (MP-NAPS)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['apprenticeship','skills']
  },
  {
    name: 'National Urban Livelihoods Mission (DAY-NULM)',
    description: 'Provides skill training and self-employment support to the urban poor, including SHG formation and microfinance linkages.',
    category: 'Employment',
    ministry: 'Ministry of Housing and Urban Affairs',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['EWS','General','SC','ST','OBC'],
      occupations: ['Urban poor']
    },
    benefits: ['Skill training, microcredit, SHG support'],
    documentsRequired: ['Aadhaar', 'Residence proof'],
    applicationProcess: 'Register through city mission management units and local centres.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('National Urban Livelihoods Mission (DAY-NULM)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['urban','livelihood']
  },
  {
    name: 'Mid-Day Meal Scheme (RTE linked)',
    description: 'Provide nutritious meals in government and government-aided schools to improve nutrition and attendance under RTE guidelines.',
    category: 'Education',
    ministry: 'Ministry of Education',
    eligibilityCriteria: {
      minAge: 5,
      maxAge: 14,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Free cooked meals to students'],
    documentsRequired: ['School registration details'],
    applicationProcess: 'Automatically provided by schools upon enrollment.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Mid-Day Meal Scheme (RTE linked)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['education','nutrition']
  },
  {
    name: 'National AYUSH Mission (NAM)',
    description: 'Promotes traditional medicine systems and provides support for AYUSH health services and research.',
    category: 'Healthcare',
    ministry: 'Ministry of AYUSH',
    eligibilityCriteria: {
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Support for AYUSH services, education and research'],
    documentsRequired: ['Aadhaar (if required)'],
    applicationProcess: 'Services provided via AYUSH clinics and mission centres.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('National AYUSH Mission (NAM)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['ayush','traditional-medicine']
  },
  {
    name: 'Pradhan Mantri Matritva Vandana Yojana (Maternity Benefit) - alternate name',
    description: 'Cash support to pregnant and lactating women to improve nutrition and maternal health outcomes.',
    category: 'Healthcare',
    ministry: 'Ministry of Women and Child Development',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Female',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Conditional cash transfer payments during pregnancy and after delivery'],
    documentsRequired: ['Aadhaar', 'Medical records'],
    applicationProcess: 'Register at local health centres and Anganwadi centres.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Pradhan Mantri Matritva Vandana Yojana (Maternity Benefit) - alternate name')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['maternal','benefit']
  },
  {
    name: 'National Scholarship Portal - Central Schemes',
    description: 'Single-window platform for students to apply for multiple central government scholarships.',
    category: 'Education',
    ministry: 'Ministry of Education',
    eligibilityCriteria: {
      minAge: 14,
      gender: 'Any',
      categories: ['EWS','General','SC','ST','OBC'],
      maxIncome: 200000
    },
    benefits: ['Access to various scholarships and maintenance allowances'],
    documentsRequired: ['Aadhaar', 'Income certificate', 'Marksheets'],
    applicationProcess: 'Apply online at National Scholarship Portal and upload required documents.',
    officialWebsite: '',
    applyLink: 'https://scholarships.gov.in',
    contactInfo: {},
    status: 'Active',
    tags: ['scholarship','education']
  },
  {
    name: 'Pradhan Mantri Garib Kalyan Yojana (welfare support components)',
    description: 'Package of measures supporting vulnerable households with food, cash transfers and welfare during crises.',
    category: 'Other',
    ministry: 'Ministry of Finance / various ministries',
    eligibilityCriteria: {
      gender: 'Any',
      categories: ['EWS','General']
    },
    benefits: ['Food rations, cash transfers, expanded coverage of welfare schemes during emergencies'],
    documentsRequired: ['Aadhaar', 'Ration card'],
    applicationProcess: 'Automatic inclusion via existing welfare distribution channels during announcements.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Pradhan Mantri Garib Kalyan Yojana (welfare support components)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['welfare','crisis-support']
  },
  {
    name: 'Pradhan Mantri Fasal Bima Yojana - PMFBY (Alternate entry)',
    description: 'Crop insurance to support farmers by providing financial support on crop failure due to natural calamities.',
    category: 'Agriculture',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      occupations: ['Farmer']
    },
    benefits: ['Premium subsidy and compensation for crop loss'],
    documentsRequired: ['Aadhaar', 'Land ownership/lease documents', 'Crop details'],
    applicationProcess: 'Enroll through insurance service providers or state agencies during enrollment window.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Pradhan Mantri Fasal Bima Yojana - PMFBY (Alternate entry)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['insurance','farmers']
  },
  {
    name: 'Stand Up India',
    description: 'Facilitates bank loans between 10 lakhs and 1 crore to at least one SC/ST borrower and one woman borrower per bank branch for setting up greenfield enterprises.',
    category: 'Financial',
    ministry: 'Ministry of Finance',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['SC','ST','EWS','General'],
      occupations: ['Entrepreneur']
    },
    benefits: ['Bank credit facilities, support and handholding'],
    documentsRequired: ['Business plan', 'Aadhaar', 'KYC documents'],
    applicationProcess: 'Apply via Stand Up India portal with required documents and business plan.',
    officialWebsite: '',
    applyLink: 'https://standupmitra.in',
    contactInfo: {},
    status: 'Active',
    tags: ['entrepreneurship','credit']
  },
  {
    name: 'Pradhan Mantri Rojgar Protsahan Yojana (PMRPY)',
    description: 'Incentivises employers by paying employer\'s contribution to Employees\' Provident Fund for new employees.',
    category: 'Employment',
    ministry: 'Ministry of Labour and Employment',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      occupations: ['Employer','Employee']
    },
    benefits: ['Employer contribution support to EPF for new employees'],
    documentsRequired: ['Establishment details', 'Employee details'],
    applicationProcess: 'Register establishment and claim benefits through EPFO portals.',
    officialWebsite: '',
    applyLink: 'https://www.epfindia.gov.in',
    contactInfo: {},
    status: 'Active',
    tags: ['employment','epf']
  },
  {
    name: 'National Digital Literacy Mission (DDU-GKY aligned local trainings)',
    description: 'Promotes digital literacy and basic IT skills among citizens, enabling access to digital services.',
    category: 'Employment',
    ministry: 'Ministry of Electronics and Information Technology',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['EWS','General','SC','ST','OBC']
    },
    benefits: ['Digital skills training, certification'],
    documentsRequired: ['Aadhaar', 'Education proof'],
    applicationProcess: 'Register via local centres or digital literacy mission portals.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('National Digital Literacy Mission (DDU-GKY aligned local trainings)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['digital','literacy']
  },
  {
    name: 'PM Kisan Sammanidhi - Additional entry for allied support',
    description: 'Additional support components for allied activities for small farmers including extension services and training.',
    category: 'Agriculture',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Extension services, training and small allied grants'],
    documentsRequired: ['Aadhaar', 'Farmer ID'],
    applicationProcess: 'Available through state agri departments and PM-KISAN portal.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('PM Kisan Sammanidhi - Additional entry for allied support')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['farmers','training']
  },
  {
    name: 'Pradhan Mantri Vaya Vandana Yojana (PMVVY)',
    description: 'Pension scheme for senior citizens providing guaranteed pension for a tenure.',
    category: 'Other',
    ministry: 'Ministry of Finance',
    eligibilityCriteria: {
      minAge: 60,
      gender: 'Any',
      categories: ['General','EWS','SC','ST','OBC']
    },
    benefits: ['Guaranteed pension payable monthly'],
    documentsRequired: ['Aadhaar', 'Age proof'],
    applicationProcess: 'Purchase annuity plans via designated insurers and banks.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Pradhan Mantri Vaya Vandana Yojana (PMVVY)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['senior','pension']
  },
  {
    name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    description: 'Accidental death and disability insurance scheme at a minimal premium for enrolled bank account holders.',
    category: 'Financial',
    ministry: 'Ministry of Finance',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 70,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Accidental cover for death/permanent disability'],
    documentsRequired: ['Active bank account', 'Aadhaar'],
    applicationProcess: 'Enroll through designated bank branch with consent for annual premium debit.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Pradhan Mantri Suraksha Bima Yojana (PMSBY)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['insurance','social-security']
  },
  {
    name: 'National Rural Health Mission (Component of NHM)',
    description: 'Strengthening rural health services including primary health centres, ASHAs and maternal-child health programmes.',
    category: 'Healthcare',
    ministry: 'Ministry of Health and Family Welfare',
    eligibilityCriteria: {
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Rural health infrastructure, community health workers, maternal care'],
    documentsRequired: ['Aadhaar (if required)'],
    applicationProcess: 'Services accessed through PHCs and community health workers.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('National Rural Health Mission (Component of NHM)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['rural-health']
  },
  {
    name: 'Stand Up India (alternate wording)',
    description: 'Facilitates bank loans to SC/ST and women entrepreneurs to promote enterprise at grassroots.',
    category: 'Financial',
    ministry: 'Ministry of Finance',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['SC','ST','EWS'],
      occupations: ['Entrepreneur']
    },
    benefits: ['Bank loans, handholding support, credit facilitation'],
    documentsRequired: ['Business plan', 'Aadhaar', 'KYC'],
    applicationProcess: 'Apply via Stand Up India portal and partnering banks.',
    officialWebsite: '',
    applyLink: 'https://standupmitra.in',
    contactInfo: {},
    status: 'Active',
    tags: ['entrepreneurship','women']
  },
  {
    name: 'National Programme for Persons with Disabilities (assorted central schemes)',
    description: 'Provides support, rehabilitation and social security measures for persons with disabilities.',
    category: 'Disability',
    ministry: 'Ministry of Social Justice & Empowerment',
    eligibilityCriteria: {
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      disability: true
    },
    benefits: ['Rehabilitation services, assistive devices, skill training and educational support'],
    documentsRequired: ['Disability certificate', 'Aadhaar'],
    applicationProcess: 'Apply through designated state disability welfare boards and nodal agencies.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('National Programme for Persons with Disabilities (assorted central schemes)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['disability','rehabilitation']
  },
  {
    name: 'Pradhan Mantri Shram Yogi Maan Dhan - Alternate entry',
    description: 'Pension scheme for unorganised workers with a small monthly contribution to get assured pension after 60 years.',
    category: 'Financial',
    ministry: 'Ministry of Labour and Employment',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 40,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      occupations: ['Unorganised worker']
    },
    benefits: ['Assured monthly pension after retirement'],
    documentsRequired: ['Aadhaar', 'Occupation proof'],
    applicationProcess: 'Enroll at CSP/online portals and pay monthly subscription.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('Pradhan Mantri Shram Yogi Maan Dhan - Alternate entry')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['pension','unorganised']
  },
  {
    name: 'National AYUSH Health and Wellness Centres (AYUSH under health initiatives)',
    description: 'Centers providing AYUSH-based preventive and promotive healthcare as part of wellness initiatives.',
    category: 'Healthcare',
    ministry: 'Ministry of AYUSH',
    eligibilityCriteria: {
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS']
    },
    benefits: ['Promotive healthcare, affordable AYUSH services'],
    documentsRequired: ['Aadhaar (if required)'],
    applicationProcess: 'Access through AYUSH centres and designated wellness clinics.',
    officialWebsite: '',
    applyLink: `https://apply.example.com/${slugify('National AYUSH Health and Wellness Centres (AYUSH under health initiatives)')}`,
    contactInfo: {},
    status: 'Active',
    tags: ['ayush','wellness']
  },
  {
    name: "Prime Minister's Employment Generation Programme (PMEGP) - Micro-enterprise support",
    description: 'Credit-linked subsidy for setting up micro-enterprises in rural and urban areas through banks and KVIC.',
    category: 'Employment',
    ministry: 'Ministry of Micro, Small & Medium Enterprises',
    eligibilityCriteria: {
      minAge: 18,
      gender: 'Any',
      categories: ['General','SC','ST','OBC','EWS'],
      occupations: ['Entrepreneur']
    },
    benefits: ['Margin money subsidy and bank credit for micro-enterprise establishment'],
    documentsRequired: ['Project report', 'Aadhaar', 'KYC'],
    applicationProcess: 'Apply via KVIC or banks; submit project report and required documents.',
    officialWebsite: '',
    applyLink: 'https://kviconline.gov.in',
    contactInfo: {},
    status: 'Active',
    tags: ['msme','entrepreneurship']
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO, { dbName: process.env.DB_NAME || undefined });
    console.log('Connected to MongoDB');

    for (const s of schemes) {
      // sanitize eligibilityCriteria.categories
      if (!s.eligibilityCriteria) s.eligibilityCriteria = {};
      s.eligibilityCriteria.categories = normalizeCategories(s.eligibilityCriteria.categories);

      // ensure gender default fits enum in schema
      if (!s.eligibilityCriteria.gender) s.eligibilityCriteria.gender = 'Any';

      const existing = await Scheme.findOne({ name: s.name }).lean();
      if (existing) {
        console.log(`Skipping (exists): ${s.name}`);
        continue;
      }
      await Scheme.create(s);
      console.log(`Inserted: ${s.name}`);
    }

    console.log('Seeding complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
