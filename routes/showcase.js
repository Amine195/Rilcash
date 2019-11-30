const express = require('express');
const showcaseController = require('../controllers/showcase');

const router = express.Router();

router.get('/faq', showcaseController.faq);
router.get('/tips', showcaseController.tips);

module.exports = router;
