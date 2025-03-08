import express from "express";
import { MongoClient } from "mongodb";
import path from "path";

async function run() {
  const app = express();
  app.use(express.json());

  app.use("/images", express.static(path.join(__dirname, "../assets/images")));

  app.use(express.static(path.resolve(__dirname, "../dist"), { maxAge: "1y", etag: false }));

  const uri = `mongodb+srv://hatimquetta:no9hdClfePoMIRmq@cluster0.hp60m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tls=true&ssl=true`;
  const client = new MongoClient(uri);

  await client.connect();
  const db = client.db("hodgepodge");

  async function populatedCartIds(ids) {
    return Promise.all(ids.map((id) => db.collection("products").findOne({ id })));
  }

  app.get("/api/products", async (req, res) => {
    const products = await db.collection("products").find({}).toArray();
    res.json(products);
  });

  app.get("/api/products/:productId", async (req, res) => {
    const productId = req.params.productId;
    const product = await db.collection("products").findOne({ id: productId });
    res.json(product);
  });

  app.get("/api/users/:userId/cart", async (req, res) => {
    const user = await db.collection("users").findOne({ id: req.params.userId });
    res.json(await populatedCartIds(user?.cartItems || []));
  });

  app.post("/api/users/:userId/cart", async (req, res) => {
    const userId = req.params.userId;
    const productId = req.body.id;
    const existingUser = await db.collection("users").findOne({ id: userId });

    if (!existingUser) {
      await db.collection("users").insertOne({ id: userId, cartItems: [] });
    }
    await db.collection("users").updateOne(
      { id: userId },
      {
        $addToSet: { cartItems: productId },
      }
    );
    const user = await db.collection("users").findOne({ id: req.params.userId });
    res.json(await populatedCartIds(user?.cartItems || []));
  });

  app.delete("/api/users/:userId/cart/:productId", async (req, res) => {
    const userId = req.params.userId;
    const productId = req.params.productId;

    await db.collection("users").updateOne(
      { id: userId },
      {
        $pull: { cartItems: productId },
      }
    );
    const user = await db.collection("users").findOne({ id: req.params.userId });
    res.json(await populatedCartIds(user?.cartItems || []));
  });

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });

  const port = process.env.PORT || 8000;

  app.listen(8000, async () => {
    console.log("Server is listening on port", port);
  });
}
run();
