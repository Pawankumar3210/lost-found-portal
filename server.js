// ===== Lost & Found Campus Portal Backend =====
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== MongoDB Connection =====
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lost_found_portal";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Mongoose Schema =====
const itemSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    category: String,
    location: String,
    contact: String,
    photo: String,
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "items" }
);

const Item = mongoose.model("Item", itemSchema);

// ===== Multer Setup (for image uploads) =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ===== Routes =====

// Upload / Report an Item
app.post("/api/items", upload.single("itemPhoto"), async (req, res) => {
  try {
    const { itemName, itemDescription, itemCategory, itemLocation, contactInfo } =
      req.body;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : "";

    const newItem = new Item({
      name: itemName,
      description: itemDescription,
      category: itemCategory,
      location: itemLocation,
      contact: contactInfo,
      photo: photoPath,
    });

    await newItem.save();
    res.json({
      success: true,
      message: "Item uploaded successfully",
      item: newItem,
    });
  } catch (err) {
    console.error("Error uploading item:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Fetch all items (with optional query filters)
app.get("/api/items", async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category && category !== "All") query.category = category;
    if (search) query.name = new RegExp(search, "i");

    let items = await Item.find(query);

    // Sorting
    if (sort === "newest") items = items.sort((a, b) => b.createdAt - a.createdAt);
    else if (sort === "oldest") items = items.sort((a, b) => a.createdAt - b.createdAt);
    else if (sort === "az") items = items.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "za") items = items.sort((a, b) => b.name.localeCompare(a.name));

    res.json(items);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
