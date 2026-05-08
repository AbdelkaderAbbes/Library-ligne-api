import "dotenv/config";
import express from "express";
const app = express();

import mongoose from "mongoose";
const port = process.env.PORT || 5000;

import livresPath from "./routes/livres.js";
import authPath from "./routes/auth.js";

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost/bookstoredb")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use(express.json());

app.use("/api/auth", authPath);
app.use("/api/livres", livresPath);

app.get("/", (req, res) => {
  res.send("Hello World! from express");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
