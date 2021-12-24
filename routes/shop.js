const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);


router.get('/products', shopController.getProducts);

router.post('/products/:emotion/:productId', shopController.updateLove);
router.get('/products/:productId', shopController.getProduct);


router.get('/getProductWithDate', isAuth, shopController.getProductsWithDate);
router.get('/getStarredProducts', isAuth, shopController.getStarredProducts);

router.get('/home', isAuth, shopController.getHome);


router.post('/delete/product/:productId', isAuth, shopController.deleteProduct);

module.exports = router;
