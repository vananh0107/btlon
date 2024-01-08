const express = require('express');
const router = express.Router();
const {
  createUser,
  loginUserCtrl,
  getallUser,
  getUser,
  updateUser,
  handlerRefreshToken,
  logoutUser,
  userCart,
  getUserCart,
  emptyCart,
  createOrder,
  removeProductFromCart,
  updateQuantityProductFromCart,
  getAllOrder,
  deleteOrder,
  getOrder,
  getMonthIncome,
  getYearOrderCount,
} = require('../controller/userCtrl');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
router.delete(
  '/update-product-cart/:cartItemId/:newQuantity',
  authMiddleware,
  updateQuantityProductFromCart
);
router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.post('/cart/cash-order', authMiddleware, createOrder);
router.get('/all-users', authMiddleware, isAdmin, getallUser);
router.delete('/order/:id', authMiddleware, isAdmin, deleteOrder);
router.get('/all-orders', authMiddleware, isAdmin, getAllOrder);
router.get('/month-order', authMiddleware, isAdmin, getMonthIncome);
router.get('/year-order', authMiddleware, isAdmin, getYearOrderCount);
router.get('/refresh', handlerRefreshToken);
router.get('/cart', authMiddleware, getUserCart);
router.get('/order/:id', authMiddleware, getOrder);
router.get('/logout', logoutUser);
router.get('/:id', authMiddleware, isAdmin, getUser);
router.delete('/empty-cart', authMiddleware, emptyCart);

router.delete(
  '/delete-product-cart/:id',
  authMiddleware,
  removeProductFromCart
);
router.put('/edit-user', authMiddleware, updateUser);
router.post('/cart', authMiddleware, userCart);
module.exports = router;