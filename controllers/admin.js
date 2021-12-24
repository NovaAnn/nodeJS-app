const mongoose = require("mongoose");

const fileHelper = require("../util/file");

const { validationResult } = require("express-validator/check");

const Product = require("../models/product");
const User = require("../models/user");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  

  const title = req.body.title;
  
  const image = req.file;
  const date = req.body.date;
  const place = req.body.place;
  const description = req.body.description;
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        place: place,
        description: description,
      },
      errorMessage: "Attached file is not an image.",
      validationErrors: [],
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        place: place,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const imageUrl = image.path;
  

  const product = new Product({
    // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
    title: title,
    place: place,
    date:date,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      res.redirect("/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSaveProfile = (req, res, next) => {
  const name = req.body.name;
  const dateOfBirth = req.body.date;
  const updatedLocation = req.body.location;
  const updatedCollege = req.body.college;
  const updatedPosition = req.body.position;
  const updatedRelationship = req.body.relationship;
  const updatedFavFood = req.body.favFood;
  let profImage;
  let backImage;

  const hobbies = req.body.hobbies;

  if (req.files.profImage){
    const profImageInt = req.files.profImage[0];
     profImage = profImageInt.path;  
  } else{
   
  }
  if (req.files.backImage){
    const backImageInt = req.files.backImage[0];
     backImage = backImageInt.path;  
  } else{
   
  }
 

  // const errors = validationResult(req);

  User.findById(req.user._id)
    .then((user) => {
      
      user.name = name;
      user.dateOfBirth = dateOfBirth;
      user.hobbies = hobbies;
      user.location = updatedLocation;
      user.college = updatedCollege;
      user.position = updatedPosition;
      user.relationship = updatedRelationship;
      user.favFood = updatedFavFood;
      
     if (req.files.profImage){
      user.proficPic = profImage;
     } else {
       console.log('Image didnt change')
      
     }
      
     if (req.files.backImage){
      user.coverPic=backImage;
     } else {
       console.log('Image didnt change')
     }
      
      
      return user.save().then((result) => {
        console.log("UPDATED PRODUCT!");
        res.redirect("/admin/profile");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.updateLove = (req, res, next) => {
  coonsole.log('Inside love')
 
  Product.findById(prodId)
    .then(product => {
      product.love = true;
      return product.save();
    })
    .then(result => {
      
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedDate = req.body.date;
  const updatedPlace = req.body.place;
  const image = req.file;
  const updatedDesc = req.body.description;
  
 

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.place = updatedPlace;
      product.date = updatedDate;
      product.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then((result) => {
        console.log("UPDATED PRODUCT!");
        res.redirect(`/products/${product._id}`);
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getProfile = (req, res, next) => {
  User.findById(req.user._id)
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then((user) => {
      console.log('USER found');
      console.log(user);
      res.render("admin/profile", {
        pageTitle: "Admin Products",
        user:user,
        path: "/admin/profile",
        validationErrors: [],
      });
    })
    .catch((err) => {
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
      res.status(200).json({ message: "Success!" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Deleting product failed." });
    });
};
