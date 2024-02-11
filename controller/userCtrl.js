const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const asyncHandler = require('express-async-handler');
const generateToken = require('../config/jwtToken');
const validateMongoDbId = require('../utils/validateMongodbId');
const generateRefreshToken = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error('User are already exists');
  }
});
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 604800,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
      role: findUser.role,
    });
  } else {
    throw new Error('Invalid User');
  }
});
//log out
const logoutUser = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error('No refresh token');
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: '',
  });
  res.clearCookies('refreshToken', {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204);
});

//handle refresh token

const handlerRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error('No refresh token');
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error('No refresh token present in db');
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error('Invalid refresh token');
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

//get all user
const getallUser = asyncHandler(async (req, res) => {
  try {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });
    let getUsers = [];
    if (adminUser.role == 'admin') {
      getUsers = await User.find();
      getUsers = getUsers.filter((e) => e.role != 'admin');
      res.json(getUsers);
    }
  } catch (err) {
    throw new Error(err);
  }
});

//delete cart
const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteOrder = await Order.findByIdAndDelete(id);
    res.json({ deleteOrder });
  } catch (err) {
    throw new Error(err);
  }
});
// Them san pham vao gio hang
const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);
    const alreadyExsistCart = await Cart.findOne({ orderby: user._id });
    let newCart;
    let cartTotal = 0;
    if (alreadyExsistCart) {
      cartTotal = alreadyExsistCart.cartTotal
      alreadyExsistCart.products.forEach((product) => {
        products.push(product);
      });
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      let sameProduct = -1;
      products.forEach((product, index) => {
        if (product.product.toString() === cart[i]._id) {
          sameProduct = index;
        }
      });
      cartTotal += cart[i].price * cart[i].count||0;
      if (sameProduct >= 0) {
        products[sameProduct].count += Number(cart[i].count);
      } else {
        object.product = cart[i]._id;
        object.count = cart[i].count;
        object.title = cart[i].title;
        object.description = cart[i].description;
        let getPrice = await Product.findById(cart[i]._id);
        object.price = getPrice.price;
        products.push(object);
      }
    }
    if (alreadyExsistCart) {
      newCart = await Cart.findByIdAndUpdate(
        alreadyExsistCart._id,
        {
          products,
          cartTotal,
          orderby: user?._id,
        },
        { new: true }
      );
    } else {
      newCart = await new Cart({
        products,
        cartTotal,
        orderby: user?._id,
      }).save();
    }
    res.json(newCart);
  } catch (err) {
    throw new Error(err);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.find({ orderby: _id }).populate('products.product');
    res.json(cart);
  } catch (err) {
    throw new Error(err);
  }
});
const removeProductFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  validateMongoDbId(_id);
  try {
    const cartItem = await Cart.findOne({
      orderby: _id,
      products: { $elemMatch: { product: id } },
    });
    let i = -1;
    let cartTotal = 0;
    let listProduct = cartItem.products;
    listProduct.forEach((item, index) => {
      const productId = item.product.toString();
      if (id == productId) {
        i = index;
      } else {
        cartTotal += item.price * item.count;
      }
    });
    listProduct.splice(i, 1);
    const deleteProductCart = await Cart.findByIdAndUpdate(
      cartItem._id,
      {
        products: listProduct,
        cartTotal,
        orderby: _id,
      },
      { new: true }
    );
    res.json(deleteProductCart);
  } catch (err) {
    throw new Error(err);
  }
});
const updateQuantityProductFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId, newQuantity } = req.params;
  validateMongoDbId(_id);
  try {
    const cartItem = await Cart.findOne({
      orderby: _id,
      products: { $elemMatch: { product: cartItemId } },
    });
    let cartTotal = 0;
    let listProduct = cartItem.products;
    listProduct.forEach((item, index) => {
      const productId = item.product.toString();
      if (cartItemId == productId) {
        item.count = newQuantity;
      }
      cartTotal += item.price * item.count;
    });
    const newCart = await Cart.findByIdAndUpdate(
      cartItem._id,
      {
        products: listProduct,
        cartTotal,
        orderby: _id,
      },
      { new: true }
    );
    res.json(newCart);
  } catch (err) {
    throw new Error(err);
  }
});
const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json(cart);
  } catch (err) {
    throw new Error(err);
  }
});
const createOrder = asyncHandler(async (req, res) => {
  const { shippingInfor, orderItems, totalPrice } = req.body;
  const { _id } = req.user;
  try {
    const cart = await Cart.findOneAndRemove({ orderby: _id });
    const order = await Order.create({
      shippingInfor,
      orderItems,
      totalPrice,
      user: _id,
    });
    res.json({
      order,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});
const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const order = await Order.findById(id)
      .populate('orderItems.product')
      .exec();
    res.json(order);
  } catch (err) {
    throw new Error(err);
  }
});
const getAllOrder = asyncHandler(async (req, res) => {
  try {
    const listOrder = await Order.find()
      .populate('orderItems.product')
      .populate('user')
      .exec();
    res.json(listOrder);
  } catch (err) {
    throw new Error(err);
  }
});
const getOrdersOfUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userorders = await Order.find({ user: _id })
      .populate('orderItems.product')
      .exec();
    res.json(userorders);
  } catch (err) {
    throw new Error(err);
  }
});
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
      },
      {
        new: true,
      }
    );
    res.json(updateOrderStatus);
  } catch (err) {
    throw new Error(err);
  }
});
const author = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });
    if (adminUser.role == 'admin') {
      const updateUser = await User.findByIdAndUpdate(
        id,
        {
          role: role,
        },
        {
          new: true,
        }
      );
      res.json('Update successfully');
    }
    res.json('Update error');
  } catch (err) {
    throw new Error(err);
  }
});
module.exports = {
  createUser,
  loginUserCtrl,
  getallUser,
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
  getOrdersOfUser,
  updateOrderStatus,
  author,
};
