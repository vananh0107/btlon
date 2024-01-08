const express = require('express');
const { isAdmin, authMiddleware } = require('../middleware/authMiddleware');
const {
  uploadPhoto,
  productImgResize,
} = require('../middleware/uploadImage');
const { uploadImages, deleteImages } = require('../controller/uploadCtrl');
const router = express.Router();
router.post(
  '/',
  authMiddleware,
  isAdmin,
  uploadPhoto.array('images', 10),
  productImgResize,
  uploadImages
);
router.put('/delete-img/:id', authMiddleware, isAdmin, deleteImages);
module.exports = router;