const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    academicYear: { type: String, required: true },

    marks: [
      {
        subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        theoryMarks: { type: Number, default: 0 },
        practicalMarks: { type: Number, default: 0 },
        totalMarks: { type: Number, default: 0 },
        maxMarks: { type: Number, default: 100 },
        passingMarks: { type: Number, default: 35 },
        grade: String,
        gradePoint: Number,
        isPassed: { type: Boolean, default: false },
        isAbsent: { type: Boolean, default: false },
        remarks: String,
      },
    ],

    totalObtained: { type: Number, default: 0 },
    totalMaxMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    gpa: { type: Number, default: 0 },
    overallGrade: String,
    rank: Number,
    isPassed: { type: Boolean, default: false },
    attendance: { type: Number, default: 0 }, // attendance percentage

    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: String,
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, exam: 1 }, { unique: true });
resultSchema.index({ exam: 1, class: 1 });

module.exports = mongoose.model('Result', resultSchema);
