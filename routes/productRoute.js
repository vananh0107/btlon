const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
} = require('../controller/productCtrl');
const { isAdmin, authMiddleware } = require('../middleware/authMiddleware');
router.post('/', authMiddleware, isAdmin, createProduct);
router.get('/', getAllProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.get('/:id', getProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);
module.exports = router;