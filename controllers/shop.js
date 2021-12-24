const fs = require('fs');
const path = require('path');

const Product = require('../models/product');
const fileHelper = require("../util/file");

const ITEMS_PER_PAGE = 6;
let query;
const getProductsFn = (req, res, next,query) =>{
  const page = +req.query.page || 1;
  let totalItems;
  let monthsArray = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sep","Oct","Nov","Dec",];

   if (query){
    Product.find({...query})
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find({...query})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
       const actProducts = products.map(prod=>{
         const dupeProd = {...prod._doc};
        
        const splitArray = dupeProd.date.toISOString().substring(0,10).split('-');
       
        dupeProd.year = splitArray[0];
       
        dupeProd.month= monthsArray[+splitArray[1] - 1];
        dupeProd.day = splitArray[2];
       
        return dupeProd;

       });
       
      res.render('shop/product-list', {
        prods: actProducts,
        pageTitle: 'Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
   }
  };
//    else{
//     Product.find({userId: req.user._id})
//     .countDocuments()
//     .then(numProducts => {
//       totalItems = numProducts;
//       return Product.find({userId: req.user._id})
//         .skip((page - 1) * ITEMS_PER_PAGE)
//         .limit(ITEMS_PER_PAGE);
//     })
//     .then(products => {
//        const actProducts = products.map(prod=>{
//          const dupeProd = {...prod._doc};
        
//         const splitArray = dupeProd.date.toISOString().substring(0,10).split('-');
       
//         dupeProd.year = splitArray[0];
       
//         dupeProd.month= monthsArray[+splitArray[1] - 1];
//         dupeProd.day = splitArray[2];
       
//         return dupeProd;

//        });
       
//       res.render('shop/product-list', {
//         prods: actProducts,
//         pageTitle: 'Products',
//         path: '/products',
//         currentPage: page,
//         hasNextPage: ITEMS_PER_PAGE * page < totalItems,
//         hasPreviousPage: page > 1,
//         nextPage: page + 1,
//         previousPage: page - 1,
//         lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
//       });
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
//    }
  
// }

exports.getProducts = (req, res, next) => {
  query = {userId: req.user._id};
  getProductsFn(req, res, next,query);

  
};
exports.getStarredProducts = (req, res, next) => {
  query = {userId: req.user._id,love:true } ;
  getProductsFn(req, res, next,query);
 
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        prodId:prodId,
        pageTitle: product.title,
        path: '/products',
        validationErrors: [],
        editing:true,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getProductsWithDate = (req, res, next) => {
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;

  let query = {date:{$gte: new Date(fromDate),$lt: new Date(toDate)} } ;
  getProductsFn(req, res, next,query);

  
};
exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Online Diary',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getHome = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/home', {
        path: '/home',
        pageTitle: 'Home',
        products: products,
        editing: false,
        validationErrors: [],
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.updateLove = (req, res, next) => {
  const prodId = req.params.productId;
 
  Product.findById(prodId)
    .then(product => {
      if (product[req.params.emotion]){
        product[req.params.emotion] = !product[req.params.emotion];
      }else{
        product[req.params.emotion] = true;
      }
      return product.save();
    })
    .then(result => {
      res.json('Succesful updation');
      
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};



exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found."));
      }
       fileHelper.deleteFile(product.imageUrl);

      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log("DESTROYED PRODUCT");
      // res.status(200).json({ message: "Success!" });
      res.redirect('/products')
    })
    .catch((err) => {
      res.status(500).json({ message: "Deleting product failed." });
    });
};

