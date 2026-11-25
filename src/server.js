// npm i express mongoose cors jsonwebtoken dotenv
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI) // e.g. mongodb+srv://user:pass@cluster/megrestaurant
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.log("Mongo error:", e.message));

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        menuItem: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    total: Number,
    note: String,
    status: {
      type: String,
      enum: ["pending", "preparing", "on_the_way", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// Auth: expects "Authorization: Bearer <jwt>" where the JWT payload has { id } (adjust to your login)
function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id || decoded._id || decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}

// Place order
app.post("/api/orders", auth, async (req, res) => {
  try {
    const { items, note } = req.body;
    if (!items || !items.length)
      return res.status(400).json({ message: "Cart is empty" });
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = await Order.create({ user: req.userId, items, total, note });
    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// My orders
app.get("/api/orders/my", auth, async (req, res) => {
  const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(orders);
});

// Single order (tracking)
app.get("/api/orders/:id", auth, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.userId });
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order);
});

// Cancel (only while pending)
app.patch("/api/orders/:id/cancel", auth, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.userId });
  if (!order) return res.status(404).json({ message: "Not found" });
  if (order.status !== "pending")
    return res.status(400).json({ message: "Order can no longer be cancelled" });
  order.status = "cancelled";
  await order.save();
  res.json(order);
});

// Admin/staff updates status (add your own admin check)
app.patch("/api/orders/:id/status", auth, async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(order);
});

app.listen(5000, "0.0.0.0", () => console.log("API on :5000"));