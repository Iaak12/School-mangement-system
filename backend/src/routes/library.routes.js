const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/library.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(protect);

router.get('/books', ctrl.getBooks);
router.post('/books', authorize('admin', 'librarian', 'principal'), ctrl.createBook);
router.put('/books/:id', authorize('admin', 'librarian', 'principal'), ctrl.updateBook);
router.get('/issued', ctrl.getIssuedBooks);
router.post('/issue', authorize('admin', 'librarian'), ctrl.issueBook);
router.post('/return/:id', authorize('admin', 'librarian'), ctrl.returnBook);

module.exports = router;
