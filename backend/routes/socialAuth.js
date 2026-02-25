const express = require('express');
const router = express.Router();

// Social authentication routes removed
// Placeholder for future social auth implementations

router.get('/', (req, res) => {
  res.json({ message: 'Social authentication not configured' });
});

module.exports = router;