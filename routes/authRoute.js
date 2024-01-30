const express = require('express');
const router = express.Router();
const {
  createUser,
  loginUserCtrl,
  handlerRefreshToken,
  logoutUser,
  userCart,
  getUserCart,
  emptyCart,
  createOrder,
  removeProductFromCart,
  updateQuantityProductFromCart,
  getAllOrder,
  getOrder,
  getOrdersOfUser
} = require('../controller/userCtrl');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
router.delete(
  '/update-product-cart/:cartItemId/:newQuantity',
  authMiddleware,
  updateQuantityProductFromCart
);
router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.post('/cart/create-order', authMiddleware, createOrder);
router.get('/all-orders', authMiddleware, isAdmin, getAllOrder);
router.get('/refresh', handlerRefreshToken);
router.get('/cart', authMiddleware, getUserCart);
router.get('/carts', authMiddleware, getOrdersOfUser);
router.get('/order/:id', authMiddleware, getOrder);
router.get('/logout', logoutUser);
router.delete('/empty-cart', authMiddleware, emptyCart);
router.delete(
  '/delete-product-cart/:id',
  authMiddleware,
  removeProductFromCart
);
router.post('/cart', authMiddleware, userCart);
module.exports = router;