const express = require('express');
const { body } = require('express-validator/check');

const shopController = require('../controllers/shop');

const isAuth = require('../middleware/is-auth');

const populateUser = require('../middleware/populateUser.js');

const router = express.Router();

router.get('/products', isAuth, shopController.getProducts);

router.post('/add-product', isAuth,  [
    body('description').isLength({min: 5})
], shopController.postAddProduct);

router.delete('/delete-product', isAuth, shopController.postDeleteProduct);

router.get('/products/:productId', isAuth, shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.delete('/cart-delete-item', isAuth, populateUser, shopController.postCartDeleteProduct);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

module.exports = router;
