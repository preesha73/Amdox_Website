const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String },
  resumeUrl: { type: String },
  status: { type: String, enum: ['Submitted','Viewed','Interview','Rejected','Offer'], default: 'Submitted' }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);


