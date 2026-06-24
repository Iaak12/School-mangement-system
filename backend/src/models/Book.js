const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, unique: true, trim: true },
    publisher: String,
    publicationYear: Number,
    edition: String,
    category: String,
    subject: String,
    language: { type: String, default: 'English' },
    description: String,
    totalCopies: { type: Number, required: true, default: 1 },
    availableCopies: { type: Number, default: 1 },
    location: { type: String, trim: true }, // shelf/rack number
    coverImage: { url: String, publicId: String },
    price: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text', isbn: 1 });

module.exports = mongoose.model('Book', bookSchema);
