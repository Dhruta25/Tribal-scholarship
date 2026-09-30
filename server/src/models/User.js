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
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['applicant', 'verifier', 'officer', 'admin'],
    default: 'applicant'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null
  },
  otpAttempts: { type: Number, default: 0 },
  otpExpiry: {
    type: Date,
    default: null
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  profile: {
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    category: { type: String, default: 'ST' },
    state: { type: String },
    district: { type: String },
    disability: { type: Boolean, default: false },
    disabilityPercent: { type: Number, default: 0 },
    aadhaarLast4: { type: String, maxlength: 4 },
    education: {
      level: { type: String, enum: ['9th', '10th', '11th', '12th', 'diploma', 'bachelors', 'undergraduate', 'masters', 'phd', 'postdoc', 'other'] },
      course: { type: String },
      university: { type: String },
      marksPercent: { type: Number, min: 0, max: 100 },
      yearOfPassing: { type: Number }
    },
    familyIncome: { type: Number, min: 0 },
    bankAccount: { type: String },
    ifsc: { type: String },
    address: { type: String }
  }
}, {
  timestamps: true,
  toJSON: { transform(doc, ret) { delete ret.passwordHash; delete ret.otp; delete ret.otpExpiry; delete ret.otpAttempts; ret.id = String(ret._id); return ret; } }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
