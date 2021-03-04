const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');

const router = express.Router();

router.put('/edit-product', isAuth, isAdmin, [
    body('description').isLength({min: 5})
], adminController.postEditProduct);

module.exports = router;