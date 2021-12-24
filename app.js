
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const { MongoClient } = require("mongodb");
const multer = require("multer");
const { graphqlHTTP } = require("express-graphql");
const graphqlSchema = require("./controllers/graphql/schema");
const graphqlResolver = require("./controllers/graphql/resolvers");
const auth = require("./controllers/middleware/auth");
const Stripe = require("stripe");
const Order = require('./controllers/models/order');

const app = express();
const stripe = new Stripe('sk_test_51K5KCYJnr3G3bhPBBePnVK1NiUJPDZVez2ijSeGjv2BrPwHaKHMwmTPdkaVJtoNgXi7q8Vr6xvbOQdSQ78sMi19A00qBfuoRi0');

const port = process.env.PORT || 4000;
app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An error occurred.";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
  })
);

app.use(
  "/getstripesession/:amount",
  async (req,res,next) => {
    const amount = req.params.amount;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency:"usd"
    });
    if (paymentIntent){
      res.status(200).json(paymentIntent.client_secret);
    } else {
      res.status(500).json({statusCode:500,message:err.message});
    }
  }
);


app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// app.listen(8000);
mongoose
  .connect(
    "mongodb+srv://NovaAnn:kwmwBi9wmLJ0nYBw@cluster0.nn0w8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then((result) => {
    app.listen(8000);
  })
  .catch((err) => console.log(err));
