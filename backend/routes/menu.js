const express = require('express');
const multer = require('multer');
const path = require('path');
const { getMenuItems, getMenuItemsByCategory, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuItemController');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

// Configure multer for menu item image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-item-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const router = express.Router();

router.route('/')
  .get(getMenuItems)
  .post(protect, authorize('admin'), upload.single('image'), createMenuItem);

router.route('/category/:category')
  .get(getMenuItemsByCategory);

router.route('/:id')
  .get(validateObjectId, getMenuItem)
  .put(protect, authorize('admin'), validateObjectId, upload.single('image'), updateMenuItem)
  .delete(protect, authorize('admin'), validateObjectId, deleteMenuItem);

module.exports = router;