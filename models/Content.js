import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: false
  },
  semester: {
    type: Number,
    required: false,
    min: 1,
    max: 8
  },
  year: {
    type: Number,
    required: false,
    min: 1,
    max: 4
  },
  contentType: {
    type: String,
    enum: ['notes', 'video', 'assignment', 'question-paper', 'answer-paper'],
    required: [true, 'Please specify the content type']
  },
  fileUrl: {
    type: String,
    required: [true, 'Please add a file URL']
  },
  publicId: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Content || mongoose.model('Content', ContentSchema); 