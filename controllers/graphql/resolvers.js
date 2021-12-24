const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
let token;

module.exports = {
  createUser: async function ({ userInput }, req) {
   
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error("User exists already!");
      throw error;
    }
    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      password: hashedPw,
    });

    const createdUser = await user.save();
    token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      "somesupersecretsecret",
      { expiresIn: "1h" }
    );
  
    return { token: token, userId: user._id.toString() };
  },
  login: async function ({ email, password }, req) {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found.");
      error.code = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Password is incorrect.");
      error.code = 401;
      throw error;
    }
    token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      "somesupersecretsecret",
      { expiresIn: "1h" }
    );
    return { token: token, userId: user._id.toString() };
  },
  createProduct: async function ({ productInput }, req) {
    
    const product = new Product({
      title: productInput.title,
      description: productInput.description,
      imageUrl: productInput.imageUrl,
      veg: productInput.veg,
      price: productInput.price,
    });
    const createdPost = await product.save();
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },
  products: async function (arg, req) {

    const prod = await Product.find();

    return {
      products: prod.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }),
    };
  },
  getCart: async function (arg, req) {
    const user = await User.findById(req.userId).populate("cart.items.productId");
    const userProducts = user.cart.items.map((item) => {
      return {
        product: {
          ...item.productId._doc,
          _id: item.productId._id.toString(),
          createdAt: item.productId.createdAt.toISOString(),
          updatedAt: item.productId.updatedAt.toISOString(),
        },
        quantity: item.quantity,
      };
    });

    return { products: userProducts };
  },
  getPreviousOrders: async function (arg, req) {
    const order = await Order.find({ userId: req.userId });
    const orderlist = order.map((eachOrder) => {
      const orderProducts = eachOrder.products.map((prod) => {
        return {
          product: {
            ...prod.product,
            _id: prod.product._id.toString(),
            createdAt: prod.product.createdAt.toISOString(),
            updatedAt: prod.product.updatedAt.toISOString(),
          },
          quantity: prod.quantity,
        };
      });
      return { _id: eachOrder._id.toString(), products: orderProducts };
    });
    return { orders: orderlist };

  },
 
  addProduct: async function ({ id }, req) {
    const product = await Product.findById(id);
    const user = await User.findById(req.userId);
    await user.addToCart(product);

    return true;
  },
  deleteProduct: async function ({ id }, req) {
    const user = await User.findById(req.userId);
    await user.removeFromCart(id);

    return true;
  },
  postOrder: async function (args, req) {
    const users = await User.findById(req.userId);
    const user = await User.findById(req.userId).populate(
      "cart.items.productId"
    );
    const products = user.cart.items.map((i) => {
      return { quantity: i.quantity, product: { ...i.productId._doc } };
    });
    const order = new Order({
      userId: users,
      products: products,
    });

    await order.save();
    await users.clearCart();
    return true;

  },
  user: async function (args, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("No user found!");
      error.code = 404;
      throw error;
    }
    return { ...user._doc, _id: user._id.toString() };
  },
  product: async function (args, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const product = await Product.findAll;
    if (!product) {
      const error = new Error("No user found!");
      error.code = 404;
      throw error;
    }
    return { ...user._doc, _id: user._id.toString() };
  },

  
};
