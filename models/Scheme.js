import mongoose from 'mongoose';

const eligibilityCriteriaSchema = new mongoose.Schema({
  minAge: { type: Number },
  maxAge: { type: Number },
  minIncome: { type: Number },
  maxIncome: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Any'] },
  categories: [{ type: String, enum: ['General', 'SC', 'ST', 'OBC', 'EWS'] }],
  states: [{ type: String }],
  occupations: [{ type: String }],
  familySize: { type: Number },
  education: { type: String },
  disability: { type: Boolean },
  otherCriteria: { type: String }
});

const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Scheme name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: true,
    enum: ['Education', 'Healthcare', 'Employment', 'Housing', 'Agriculture', 'Women', 'Senior Citizens', 'Disability', 'Financial', 'Other']
  },
  ministry: {
    type: String,
    required: true
  },
  eligibilityCriteria: {
    type: eligibilityCriteriaSchema,
    required: true
  },
  benefits: [{
    type: String
  }],
  documentsRequired: [{
    type: String
  }],
  applicationProcess: {
    type: String
  },
  officialWebsite: {
    type: String
  },
  contactInfo: {
    phone: String,
    email: String
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  imageUrl: {
    type: String
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for search
schemeSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.model('Scheme', schemeSchema);

