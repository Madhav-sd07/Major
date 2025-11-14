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

// Function to parse the text file and extract scheme information
const parseSchemeData = (fileContent) => {
  const schemes = [];
  const lines = fileContent.split('\n');
  
  let currentScheme = null;
  let currentSection = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Detect scheme name (usually in uppercase or has specific patterns)
    if (line.match(/^[A-Z][A-Z\s\-\(\)]+$/) || line.match(/^[A-Z][a-zA-Z\s\-\(\)]+:$/)) {
      // Save previous scheme if exists
      if (currentScheme && currentScheme.name) {
        schemes.push(currentScheme);
      }
      
      // Start new scheme
      currentScheme = {
        name: line.replace(':', '').trim(),
        description: '',
        category: 'Other', // Default category
        ministry: 'West Bengal Government',
        eligibilityCriteria: {
          categories: ['General', 'SC', 'ST', 'OBC', 'EWS'],
          states: ['West Bengal']
        },
        benefits: [],
        documentsRequired: [],
        applicationProcess: '',
        officialWebsite: '',
        contactInfo: {
          phone: '',
          email: ''
        },
        status: 'Active',
        tags: ['West Bengal']
      };
      currentSection = null;
    }
    // Detect sections
    else if (line.toLowerCase().includes('description') || line.toLowerCase().includes('about')) {
      currentSection = 'description';
    }
    else if (line.toLowerCase().includes('eligibility') || line.toLowerCase().includes('criteria')) {
      currentSection = 'eligibility';
    }
    else if (line.toLowerCase().includes('benefit') || line.toLowerCase().includes('advantage')) {
      currentSection = 'benefits';
    }
    else if (line.toLowerCase().includes('document') || line.toLowerCase().includes('required')) {
      currentSection = 'documents';
    }
    else if (line.toLowerCase().includes('application') || line.toLowerCase().includes('apply') || line.toLowerCase().includes('process')) {
      currentSection = 'application';
    }
    else if (line.toLowerCase().includes('contact') || line.toLowerCase().includes('phone') || line.toLowerCase().includes('email')) {
      currentSection = 'contact';
    }
    else if (line.toLowerCase().includes('website') || line.toLowerCase().includes('url')) {
      currentSection = 'website';
    }
    else if (line.toLowerCase().includes('category') || line.toLowerCase().includes('type')) {
      // Try to extract category
      const categoryMatch = line.match(/(education|healthcare|agriculture|employment|housing|financial|women|senior|disability)/i);
      if (categoryMatch) {
        const categoryMap = {
          'education': 'Education',
          'healthcare': 'Healthcare',
          'agriculture': 'Agriculture',
          'employment': 'Employment',
          'housing': 'Housing',
          'financial': 'Financial',
          'women': 'Women',
          'senior': 'Senior Citizens',
          'disability': 'Disability'
        };
        if (currentScheme) {
          currentScheme.category = categoryMap[categoryMatch[1].toLowerCase()] || 'Other';
        }
      }
    }
    // Add content to current section
    else if (currentScheme) {
      if (currentSection === 'description') {
        currentScheme.description += (currentScheme.description ? ' ' : '') + line;
      }
      else if (currentSection === 'benefits') {
        if (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./)) {
          currentScheme.benefits.push(line.replace(/^[-•\d+\.]\s*/, '').trim());
        } else {
          currentScheme.benefits.push(line);
        }
      }
      else if (currentSection === 'documents') {
        if (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./)) {
          currentScheme.documentsRequired.push(line.replace(/^[-•\d+\.]\s*/, '').trim());
        } else {
          currentScheme.documentsRequired.push(line);
        }
      }
      else if (currentSection === 'application') {
        currentScheme.applicationProcess += (currentScheme.applicationProcess ? ' ' : '') + line;
      }
      else if (currentSection === 'contact') {
        const phoneMatch = line.match(/(\+?\d[\d\s\-\(\)]{8,})/);
        const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (phoneMatch) currentScheme.contactInfo.phone = phoneMatch[1];
        if (emailMatch) currentScheme.contactInfo.email = emailMatch[1];
      }
      else if (currentSection === 'website') {
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) currentScheme.officialWebsite = urlMatch[1];
      }
      // If no section, add to description
      else if (!currentSection && line.length > 20) {
        currentScheme.description += (currentScheme.description ? ' ' : '') + line;
      }
    }
  }
  
  // Add last scheme
  if (currentScheme && currentScheme.name) {
    schemes.push(currentScheme);
  }
  
  return schemes;
};

// Function to clean and validate scheme data
const cleanSchemeData = (scheme) => {
  // Ensure required fields
  if (!scheme.name || scheme.name.length < 3) return null;
  
  // Clean description
  if (!scheme.description || scheme.description.length < 10) {
    scheme.description = `Government scheme for ${scheme.name} in West Bengal.`;
  }
  
  // Ensure arrays are not empty
  if (scheme.benefits.length === 0) {
    scheme.benefits = ['Financial assistance', 'Government support'];
  }
  if (scheme.documentsRequired.length === 0) {
    scheme.documentsRequired = ['Aadhaar Card', 'Address Proof'];
  }
  
  // Ensure eligibility criteria
  if (!scheme.eligibilityCriteria.categories || scheme.eligibilityCriteria.categories.length === 0) {
    scheme.eligibilityCriteria.categories = ['General', 'SC', 'ST', 'OBC', 'EWS'];
  }
  if (!scheme.eligibilityCriteria.states || scheme.eligibilityCriteria.states.length === 0) {
    scheme.eligibilityCriteria.states = ['West Bengal'];
  }
  
  return scheme;
};

// Main import function
const importWestBengalSchemes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    // Read the file
    const filePath = path.join(__dirname, 'state_west-bengal_doc_2.txt');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found:', filePath);
      console.log('Please place state_west-bengal_doc_2.txt in the backend/data/ directory');
      process.exit(1);
    }

    console.log('📄 Reading file:', filePath);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    console.log('🔍 Parsing scheme data...');
    let schemes = parseSchemeData(fileContent);
    
    console.log(`📊 Found ${schemes.length} schemes in file`);
    
    // Clean and validate schemes
    schemes = schemes.map(cleanSchemeData).filter(s => s !== null);
    
    console.log(`✅ Validated ${schemes.length} schemes`);
    
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
    const result = await Scheme.insertMany(newSchemes, { ordered: false });
    
    console.log(`✅ Successfully imported ${result.length} schemes!`);
    console.log('\n📋 Summary:');
    console.log(`   - Total schemes in file: ${schemes.length}`);
    console.log(`   - Duplicates skipped: ${duplicateCount}`);
    console.log(`   - New schemes imported: ${result.length}`);
    
    // Show category breakdown
    const categoryCount = {};
    result.forEach(s => {
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
    if (error.code === 11000) {
      console.log('⚠️  Some schemes already exist (duplicate key error)');
      console.log('   Continuing with remaining schemes...');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the import
importWestBengalSchemes();


