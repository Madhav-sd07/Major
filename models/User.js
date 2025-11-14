import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  income: {
    type: Number,
    default: 0
  },
  familySize: {
    type: Number,
    default: 1
  },
  occupation: {
    type: String
  },
  category: {
    type: String,
    enum: ['General', 'SC', 'ST', 'OBC', 'EWS']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  eligibilityChecks: [{
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme'
    },
    checkedAt: {
      type: Date,
      default: Date.now
    },
    isEligible: Boolean,
    reasons: [String]
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

