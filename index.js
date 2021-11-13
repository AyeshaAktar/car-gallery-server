const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.szoou.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    // console.log("connected to database");
    const database = client.db("car-gallery");
    const productsCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");
    const adminCollection = database.collection("admins");

    //GET API
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    //GET Single Product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specifing product", id);
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.json(product);
    });

    //POST API
    app.post("/products", async (req, res) => {
      const product = req.body;
      console.log("hit the post api", product);

      const result = await productsCollection.insertOne(product);
      // console.log(result);
      res.json(result);
    });

    //DELETE Products API
    app.delete("/deleteProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });

    //Order POST API
    app.post("/orders", async (req, res) => {
      const order = req.body;
      console.log("hit the post api", order);
      const result = await orderCollection.insertOne(order);
      console.log(result);
      res.json(result);
    });

    //Order GET API
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const order = await cursor.toArray();
      res.send(order);
    });

    //
    app.get("/ordersEmail", (req, res) => {
      orderCollection
        .find({ email: req.query.email })
        .toArray((err, documents) => {
          res.send(documents);
        });
    });

    //DELETE orders API
    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

    //Update Status API
    app.patch("/updateStatus/:id", (req, res) => {
      const id = ObjectId(req.params.id);
      orderCollection
        .updateOne(
          { _id: id },
          {
            $set: { orderStatus: req.body.updateStatus },
          }
        )
        .then((result) => {
          // console.log(result);
        });
    });

    //

    //Review POST API
    app.post("/reviwes", async (req, res) => {
      const review = req.body;

      const result = await reviewCollection.insertOne(review);
      // console.log(result);
      res.json(result);
    });

    //Review Get API
    app.get("/reviwes", async (req, res) => {
      const cursor = reviewCollection.find({});
      const review = await cursor.toArray();
      res.send(review);
    });

    //Admin POST API
    app.post("/admin", async (req, res) => {
      const admin = req.body;

      const result = await adminCollection.insertOne(admin);
      res.json(result);
    });

    //Admin Get API
    app.get("/admin", async (req, res) => {
      adminCollection.find({ email: req.query.email }).toArray((err, admin) => {
        res.send(admin);
      });
    });
  } finally {
    // await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Car Server");
});

app.listen(port, () => {
  // console.log(`Example app listening at http://localhost:${port}`);
  console.log("Running Care Gallery on port", port);
});
