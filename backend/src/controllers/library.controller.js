const Book = require('../models/Book');
const IssuedBook = require('../models/IssuedBook');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const moment = require('moment');

// GET /api/library/books
const getBooks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, category } = req.query;
  const query = { isActive: true };
  if (search) query.$text = { $search: search };
  if (category) query.category = category;

  const total = await Book.countDocuments(query);
  const books = await Book.find(query)
    .sort({ title: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return res.status(200).json(new ApiResponse(200, { books, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } }));
});

const createBook = asyncHandler(async (req, res) => {
  const book = await Book.create(req.body);
  return res.status(201).json(new ApiResponse(201, book, 'Book added.'));
});

const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!book) throw new ApiError(404, 'Book not found.');
  return res.status(200).json(new ApiResponse(200, book, 'Book updated.'));
});

// POST /api/library/issue
const issueBook = asyncHandler(async (req, res) => {
  const { bookId, userId, userType, dueDate, finePerDay } = req.body;
  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, 'Book not found.');
  if (book.availableCopies < 1) throw new ApiError(400, 'No copies available.');

  const issued = await IssuedBook.create({
    book: bookId,
    issuedTo: userId,
    issuedToType: userType,
    issuedBy: req.user._id,
    dueDate: dueDate || moment().add(14, 'days').toDate(),
    finePerDay: finePerDay || 1,
  });

  book.availableCopies -= 1;
  await book.save();

  return res.status(201).json(new ApiResponse(201, issued, 'Book issued.'));
});

// POST /api/library/return/:id
const returnBook = asyncHandler(async (req, res) => {
  const issued = await IssuedBook.findById(req.params.id).populate('book');
  if (!issued) throw new ApiError(404, 'Issue record not found.');
  if (issued.status === 'returned') throw new ApiError(400, 'Book already returned.');

  const returnDate = new Date();
  const daysLate = Math.max(0, moment(returnDate).diff(issued.dueDate, 'days'));
  const fine = daysLate * issued.finePerDay;

  issued.returnDate = returnDate;
  issued.status = daysLate > 0 ? 'overdue' : 'returned';
  issued.finePaid = fine;
  await issued.save();

  issued.book.availableCopies += 1;
  await issued.book.save();

  return res.status(200).json(new ApiResponse(200, { issued, fine, daysLate }, 'Book returned.'));
});

// GET /api/library/issued
const getIssuedBooks = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};

  const [total, issued] = await Promise.all([
    IssuedBook.countDocuments(query),
    IssuedBook.find(query)
      .populate('book', 'title author isbn')
      .populate('issuedTo', 'name email')
      .populate('issuedBy', 'name')
      .sort({ issueDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
  ]);

  // Update overdue status
  const now = new Date();
  for (const rec of issued) {
    if (rec.status === 'issued' && now > rec.dueDate) {
      rec.status = 'overdue';
      await rec.save();
    }
  }

  return res.status(200).json(new ApiResponse(200, { issued, pagination: { total, page: Number(page) } }));
});

module.exports = { getBooks, createBook, updateBook, issueBook, returnBook, getIssuedBooks };
