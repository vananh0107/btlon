const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  createColor,
  getAllColor,
  getColor,
  deleteColor,
} = require('../controller/productCtrl');
const { isAdmin, authMiddleware } = require('../middleware/authMiddleware');
router.post('/', authMiddleware, isAdmin, createProduct);
router.post('/color', authMiddleware, isAdmin, createColor);
router.get('/color', getAllColor);
router.get('/', getAllProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.get('/:id', getProduct);
router.get('/color/:id', getColor);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);
router.delete('/color/:id', authMiddleware, isAdmin, deleteColor);
module.exports = router;