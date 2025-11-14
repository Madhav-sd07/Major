import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Scheme from '../models/Scheme.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scheme-finder';

// Function to extract scheme name from content
const extractSchemeName = (content) => {
  // Look for common patterns like "MP [Scheme Name] Yojana" or "[Scheme Name] Scheme"
  const patterns = [
    /MP\s+([A-Z][a-zA-Z\s]+?)\s+(?:Yojana|Scheme|Yojna)/i,
    /Mukhyamantri\s+([A-Z][a-zA-Z\s]+?)\s+(?:Yojana|Scheme|Yojna)/i,
    /Chief\s+Minister['']?s?\s+([A-Z][a-zA-Z\s]+?)\s+(?:Yojana|Scheme|Yojna)/i,
    /([A-Z][a-zA-Z\s]+?)\s+(?:Yojana|Scheme|Yojna)\s+(?:in|of|for)\s+Madhya\s+Pradesh/i,
    /([A-Z][a-zA-Z\s]{10,}?)\s+(?:Yojana|Scheme|Yojna)/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      let name = match[1].trim();
      // Clean up the name
      name = name.replace(/\s+/g, ' ');
      if (name.length > 5 && name.length < 100) {
        return name;
      }
    }
  }

  // Fallback: Look for lines that look like scheme names
  const lines = content.split('\n').slice(0, 50);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 10 && trimmed.length < 150) {
      if (trimmed.match(/[A-Z][a-z]+.*(?:Yojana|Scheme|Yojna)/i)) {
        return trimmed;
      }
    }
  }

  return null;
};

// Function to detect category from content
const detectCategory = (content) => {
  const categoryKeywords = {
    'Education': ['education', 'student', 'school', 'college', 'scholarship', 'laptop', 'coaching', 'curriculum', 'vidyarthi', 'vidushi', 'medhavi'],
    'Healthcare': ['health', 'medical', 'hospital', 'treatment', 'clinic', 'ambulance', 'sanjeevani', 'ayushman', 'niramayam', 'bimari'],
    'Agriculture': ['farmer', 'kisan', 'crop', 'agriculture', 'krishi', 'fasal', 'mandi', 'wheat', 'paddy', 'loan waiver', 'rin mafi'],
    'Employment': ['employment', 'job', 'rojgar', 'unemployment', 'skill', 'training', 'youth', 'yuva', 'swabhiman', 'kaushal'],
    'Housing': ['housing', 'awas', 'house', 'home', 'patta', 'residential'],
    'Financial': ['loan', 'pension', 'financial', 'subsidy', 'grant', 'assistance', 'bhavantar', 'bhugtan'],
    'Women': ['women', 'mahila', 'kanya', 'ladli', 'widow', 'kalyani', 'vivah', 'nikah'],
    'Senior Citizens': ['senior', 'elderly', 'pension', 'old age', 'vriddha'],
    'Disability': ['disability', 'disabled', 'viklang'],
    'Other': []
  };

  const lowerContent = content.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        return category;
      }
    }
  }

  return 'Other';
};

// Function to extract eligibility criteria
const extractEligibility = (content) => {
  const eligibility = {
    categories: ['General', 'SC', 'ST', 'OBC', 'EWS'],
    states: ['Madhya Pradesh']
  };

  // Extract age information
  const ageMatch = content.match(/(?:age|aged?)\s*(?:of|between|from)?\s*(\d+)\s*(?:to|-|and)?\s*(\d+)?/i);
  if (ageMatch) {
    if (ageMatch[1]) eligibility.minAge = parseInt(ageMatch[1]);
    if (ageMatch[2]) eligibility.maxAge = parseInt(ageMatch[2]);
  }

  // Extract income information
  const incomeMatch = content.match(/(?:income|annual)\s*(?:of|less than|below|upto|up to)?\s*Rs?\.?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|crore|thousand)?/i);
  if (incomeMatch) {
    let income = parseFloat(incomeMatch[1].replace(/,/g, ''));
    if (content.toLowerCase().includes('lakh')) income *= 100000;
    else if (content.toLowerCase().includes('crore')) income *= 10000000;
    else if (content.toLowerCase().includes('thousand')) income *= 1000;
    eligibility.maxIncome = income;
  }

  // Extract gender
  if (content.match(/women|female|girl|mahila|kanya|ladli/i)) {
    eligibility.gender = 'Female';
  } else if (content.match(/men|male|boy/i)) {
    eligibility.gender = 'Male';
  }

  return eligibility;
};

// Function to extract benefits
const extractBenefits = (content) => {
  const benefits = [];
  const benefitPatterns = [
    /Rs?\.?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|crore|thousand|per|month|annum|year|quintal)?/gi,
    /(?:provide|get|receive|benefit|assistance|grant|subsidy|pension|scholarship|loan|waiver)/gi,
  ];

  // Look for benefit sections
  const benefitSection = content.match(/(?:benefit|advantage|feature|highlight|provide|get|receive)[\s\S]{0,500}/i);
  if (benefitSection) {
    const lines = benefitSection[0].split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 10 && trimmed.length < 200) {
        if (trimmed.match(/Rs?\.|provide|get|receive|benefit|assistance|grant|subsidy|pension|scholarship|loan|waiver|free|subsidized/i)) {
          benefits.push(trimmed);
        }
      }
    }
  }

  if (benefits.length === 0) {
    // Extract from general content
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 15 && trimmed.length < 200) {
        if (trimmed.match(/Rs?\.|provide|get|receive|benefit|assistance|grant|subsidy|pension|scholarship|loan|waiver|free|subsidized/i)) {
          if (!trimmed.match(/^(Table|Step|Visit|Click|Download|Application)/i)) {
            benefits.push(trimmed);
          }
        }
      }
    }
  }

  return benefits.slice(0, 10); // Limit to 10 benefits
};

// Function to extract documents required
const extractDocuments = (content) => {
  const documents = [];
  const docSection = content.match(/(?:document|required|needed|submit|attach)[\s\S]{0,500}/i);
  
  if (docSection) {
    const lines = docSection[0].split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 5 && trimmed.length < 150) {
        if (trimmed.match(/aadhaar|aadhar|card|proof|certificate|document|passbook|photo|photograph/i)) {
          documents.push(trimmed);
        }
      }
    }
  }

  if (documents.length === 0) {
    documents.push('Aadhaar Card', 'Address Proof');
  }

  return documents.slice(0, 10);
};

// Function to extract website URL
const extractWebsite = (content) => {
  const urlPattern = /(https?:\/\/[^\s\)]+)/gi;
  const match = content.match(urlPattern);
  if (match && match[0]) {
    return match[0].replace(/[.,;!?]+$/, '');
  }
  return '';
};

// Function to extract contact information
const extractContact = (content) => {
  const contact = { phone: '', email: '' };
  
  // Extract phone
  const phonePattern = /(?:\+?\d{2}[-.\s]?)?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}/g;
  const phoneMatch = content.match(phonePattern);
  if (phoneMatch) {
    contact.phone = phoneMatch[0].trim();
  }

  // Extract email
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatch = content.match(emailPattern);
  if (emailMatch) {
    contact.email = emailMatch[0].trim();
  }

  return contact;
};

// Function to parse a single file
const parseSchemeFromFile = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Skip if file is too small or contains only ads/HTML
    if (fileContent.length < 200) {
      return null;
    }

    // Extract scheme name
    const name = extractSchemeName(fileContent);
    if (!name) {
      return null;
    }

    // Extract description (first few meaningful paragraphs)
    const lines = fileContent.split('\n').filter(l => l.trim().length > 20);
    let description = '';
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      if (line && !line.match(/^(Table|Step|Visit|Click|Download|Application|SAVE|adsbygoogle)/i)) {
        description += (description ? ' ' : '') + line;
        if (description.length > 200) break;
      }
    }

    if (description.length < 50) {
      description = `Government scheme ${name} in Madhya Pradesh.`;
    }

    // Detect category
    const category = detectCategory(fileContent);

    // Extract other information
    const eligibilityCriteria = extractEligibility(fileContent);
    const benefits = extractBenefits(fileContent);
    const documentsRequired = extractDocuments(fileContent);
    const officialWebsite = extractWebsite(fileContent);
    const contactInfo = extractContact(fileContent);

    // Extract application process
    let applicationProcess = '';
    const appSection = fileContent.match(/(?:application|apply|registration|procedure|process|step)[\s\S]{0,1000}/i);
    if (appSection) {
      const lines = appSection[0].split('\n').filter(l => l.trim().length > 10);
      applicationProcess = lines.slice(0, 5).join(' ').substring(0, 500);
    }

    return {
      name: name.substring(0, 200),
      description: description.substring(0, 2000),
      category,
      ministry: 'Madhya Pradesh Government',
      eligibilityCriteria,
      benefits: benefits.length > 0 ? benefits : ['Financial assistance', 'Government support'],
      documentsRequired: documentsRequired.length > 0 ? documentsRequired : ['Aadhaar Card', 'Address Proof'],
      applicationProcess: applicationProcess || 'Visit the official website or contact the concerned department.',
      officialWebsite,
      contactInfo,
      status: 'Active',
      tags: ['Madhya Pradesh', 'MP']
    };
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error.message);
    return null;
  }
};

// Main import function
const importMadhyaPradeshSchemes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    // Get all MP scheme files
    const dataDir = path.join(__dirname);
    const files = fs.readdirSync(dataDir).filter(f => 
      f.startsWith('state_madhya-pradesh_doc_') && f.endsWith('.txt')
    );

    if (files.length === 0) {
      console.error('❌ No Madhya Pradesh scheme files found!');
      console.log('Please place state_madhya-pradesh_doc_*.txt files in the backend/data/ directory');
      process.exit(1);
    }

    console.log(`📄 Found ${files.length} Madhya Pradesh scheme files`);

    // Parse all files
    const schemes = [];
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      console.log(`🔍 Parsing ${file}...`);
      const scheme = parseSchemeFromFile(filePath);
      if (scheme) {
        schemes.push(scheme);
      }
    }

    console.log(`📊 Parsed ${schemes.length} schemes from ${files.length} files`);

    if (schemes.length === 0) {
      console.log('ℹ️  No schemes found in files');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Check for duplicates
    const existingSchemes = await Scheme.find({}, 'name');
    const existingNames = new Set(existingSchemes.map(s => s.name.toLowerCase()));
    
    const newSchemes = schemes.filter(s => !existingNames.has(s.name.toLowerCase()));
    const duplicateCount = schemes.length - newSchemes.length;
    
    if (duplicateCount > 0) {
      console.log(`⚠️  Skipping ${duplicateCount} duplicate schemes`);
    }
    
    if (newSchemes.length === 0) {
      console.log('ℹ️  No new schemes to import');
      await mongoose.connection.close();
      process.exit(0);
    }
    
    // Insert schemes
    console.log(`📥 Importing ${newSchemes.length} schemes...`);
    let imported = 0;
    let errors = 0;

    for (const scheme of newSchemes) {
      try {
        await Scheme.create(scheme);
        imported++;
      } catch (error) {
        if (error.code !== 11000) { // Ignore duplicate key errors
          console.error(`Error importing ${scheme.name}:`, error.message);
          errors++;
        }
      }
    }
    
    console.log(`✅ Successfully imported ${imported} schemes!`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} schemes had errors`);
    }
    
    console.log('\n📋 Summary:');
    console.log(`   - Total files processed: ${files.length}`);
    console.log(`   - Total schemes parsed: ${schemes.length}`);
    console.log(`   - Duplicates skipped: ${duplicateCount}`);
    console.log(`   - New schemes imported: ${imported}`);
    console.log(`   - Errors: ${errors}`);
    
    // Show category breakdown
    const categoryCount = {};
    newSchemes.forEach(s => {
      categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
    });
    console.log('\n📊 Category breakdown:');
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count}`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing schemes:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the import
importMadhyaPradeshSchemes();


