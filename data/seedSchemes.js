import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Scheme from '../models/Scheme.js';

dotenv.config();

const sampleSchemes = [
  {
    name: "Pradhan Mantri Awas Yojana (PMAY)",
    description: "Housing scheme to provide affordable housing to urban and rural poor",
    category: "Housing",
    ministry: "Ministry of Housing and Urban Affairs",
    eligibilityCriteria: {
      minAge: 18,
      maxIncome: 300000,
      categories: ["General", "SC", "ST", "OBC", "EWS"],
      states: ["All"]
    },
    benefits: [
      "Interest subsidy on home loans",
      "Financial assistance for construction",
      "Affordable housing units"
    ],
    documentsRequired: [
      "Aadhaar Card",
      "Income Certificate",
      "Bank Account Details",
      "Property Documents"
    ],
    applicationProcess: "Apply online through PMAY portal or visit nearest bank",
    officialWebsite: "https://pmaymis.gov.in",
    contactInfo: {
      phone: "1800-11-3388",
      email: "support@pmay.gov.in"
    },
    status: "Active",
    tags: ["Housing", "Urban", "Rural", "Financial Assistance"]
  },
  {
    name: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    description: "Financial inclusion scheme to provide banking services to all",
    category: "Financial",
    ministry: "Ministry of Finance",
    eligibilityCriteria: {
      minAge: 10,
      categories: ["General", "SC", "ST", "OBC", "EWS"],
      states: ["All"]
    },
    benefits: [
      "Zero balance bank account",
      "RuPay debit card",
      "Accident insurance cover",
      "Overdraft facility"
    ],
    documentsRequired: [
      "Aadhaar Card",
      "PAN Card (if available)",
      "Address Proof"
    ],
    applicationProcess: "Visit any bank branch or apply online",
    officialWebsite: "https://pmjdy.gov.in",
    contactInfo: {
      phone: "1800-11-2211",
      email: "support@pmjdy.gov.in"
    },
    status: "Active",
    tags: ["Banking", "Financial Inclusion", "Insurance"]
  },
  {
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    description: "Direct income support scheme for farmers",
    category: "Agriculture",
    ministry: "Ministry of Agriculture",
    eligibilityCriteria: {
      minAge: 18,
      maxIncome: 150000,
      occupations: ["Farmer", "Agricultural Laborer"],
      states: ["All"]
    },
    benefits: [
      "₹6,000 per year in three installments",
      "Direct transfer to bank account"
    ],
    documentsRequired: [
      "Aadhaar Card",
      "Bank Account Details",
      "Land Ownership Documents",
      "Farmer ID"
    ],
    applicationProcess: "Apply through PM-KISAN portal or visit agriculture office",
    officialWebsite: "https://pmkisan.gov.in",
    contactInfo: {
      phone: "155261",
      email: "support@pmkisan.gov.in"
    },
    status: "Active",
    tags: ["Agriculture", "Farmers", "Income Support"]
  },
  {
    name: "Beti Bachao Beti Padhao",
    description: "Scheme to promote girl child education and prevent gender discrimination",
    category: "Education",
    ministry: "Ministry of Women and Child Development",
    eligibilityCriteria: {
      gender: "Female",
      minAge: 0,
      maxAge: 18,
      categories: ["General", "SC", "ST", "OBC", "EWS"],
      states: ["All"]
    },
    benefits: [
      "Educational scholarships",
      "Financial assistance for education",
      "Awareness programs"
    ],
    documentsRequired: [
      "Birth Certificate",
      "Aadhaar Card",
      "School Admission Proof",
      "Bank Account Details"
    ],
    applicationProcess: "Apply through state education department or online portal",
    officialWebsite: "https://wcd.nic.in/bbbp-schemes",
    contactInfo: {
      phone: "1800-11-6511",
      email: "bbbp@gov.in"
    },
    status: "Active",
    tags: ["Education", "Women", "Girl Child", "Scholarship"]
  },
  {
    name: "Pradhan Mantri Ujjwala Yojana (PMUY)",
    description: "Scheme to provide LPG connections to women from below poverty line families",
    category: "Women",
    ministry: "Ministry of Petroleum and Natural Gas",
    eligibilityCriteria: {
      gender: "Female",
      minAge: 18,
      maxIncome: 100000,
      categories: ["General", "SC", "ST", "OBC", "EWS"],
      states: ["All"]
    },
    benefits: [
      "Free LPG connection",
      "Subsidy on LPG refills",
      "Safety training"
    ],
    documentsRequired: [
      "Aadhaar Card",
      "BPL Certificate",
      "Bank Account Details",
      "Address Proof"
    ],
    applicationProcess: "Apply at nearest LPG distributor or online",
    officialWebsite: "https://www.pmuy.gov.in",
    contactInfo: {
      phone: "1800-266-6696",
      email: "support@pmuy.gov.in"
    },
    status: "Active",
    tags: ["Women", "LPG", "Energy", "BPL"]
  },
  {
    name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
    description: "Health insurance scheme providing coverage up to ₹5 lakh per family per year",
    category: "Healthcare",
    ministry: "Ministry of Health and Family Welfare",
    eligibilityCriteria: {
      maxIncome: 500000,
      familySize: 5,
      categories: ["General", "SC", "ST", "OBC", "EWS"],
      states: ["All"]
    },
    benefits: [
      "Health insurance coverage up to ₹5 lakh",
      "Cashless treatment",
      "Coverage for secondary and tertiary care"
    ],
    documentsRequired: [
      "Aadhaar Card",
      "Ration Card",
      "Income Certificate",
      "Family Photo"
    ],
    applicationProcess: "Apply through Common Service Centre or online portal",
    officialWebsite: "https://pmjay.gov.in",
    contactInfo: {
      phone: "14555",
      email: "support@pmjay.gov.in"
    },
    status: "Active",
    tags: ["Healthcare", "Insurance", "Medical", "BPL"]
  }
];

const seedSchemes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scheme-finder');
    console.log('MongoDB connected');

    await Scheme.deleteMany({});
    console.log('Cleared existing schemes');

    await Scheme.insertMany(sampleSchemes);
    console.log('Seeded schemes successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding schemes:', error);
    process.exit(1);
  }
};

seedSchemes();

