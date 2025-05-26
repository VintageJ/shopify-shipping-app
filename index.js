import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Vendor from "./models/Vendor.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.post("/vendors", async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).json(vendor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/calculate-shipping", async (req, res) => {
  try {
    const cart = req.body.cart;
    let total = 0;
    let subtotal = 0;
    let fallbackRate = 9.99;
    let freeShippingThreshold = 150;

    for (const item of cart) {
      subtotal += item.price * item.quantity;
      const vendor = await Vendor.findOne({ name: item.vendor });

      if (!vendor) {
        total += fallbackRate;
        continue;
      }

      let cost = 0;

      if (vendor.type === "flat") {
        cost = vendor.flatRate || 5.99;
      } else if (vendor.type === "quantity") {
        cost = vendor.baseRate + (item.quantity - 1) * vendor.additionalRate;
      } else if (vendor.type === "weight") {
        cost = item.weight * vendor.ratePerPound;
      }

      if (vendor.handlingFee) {
        cost += vendor.handlingFee;
      }

      total += cost;
    }

    if (subtotal >= freeShippingThreshold) {
      total = 0;
    }

    res.json({ shipping: `$${total.toFixed(2)}` });
  } catch (err) {
    res.status(500).json({ error: "Error calculating shipping" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
