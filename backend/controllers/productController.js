import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import mongoose from "mongoose";

// Image upload is handled by middleware which sets req.fields.image to a URL

// @desc    Create a new product
const addProduct = asyncHandler(async (req, res) => {
  const fields = req.fields || {};
  const { name, description, price, category, quantity, brand, countInStock } = fields;

  // basic validation
  if (!name || !brand || !description || !price || !category || !quantity) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate category is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(category)) {
    return res.status(400).json({ error: "Invalid category ID" });
  }

  // Prefer URL populated by cloudinaryUpload middleware (req.fields.image).
  // Fallback to common upload shapes if middleware wasn't used (do not perform uploads here).
  let imageUrl = fields.image || null;
  if (!imageUrl) {
    if (req.files && req.files.image && req.files.image.path) imageUrl = req.files.image.path; // formidable
    else if (req.file && req.file.path) imageUrl = req.file.path; // multer single
    else if (req.files && Array.isArray(req.files.image) && req.files.image[0]?.path)
      imageUrl = req.files.image[0].path; // multer array
  }

  if (!imageUrl) {
    return res.status(400).json({ error: "Product image is required" });
  }

  const productData = {
    ...fields,
    image: imageUrl,
    price: Number(price),
    quantity: Number(quantity),
  };

  if (countInStock !== undefined) productData.countInStock = Number(countInStock);

  const product = new Product(productData);
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update product details
const updateProductDetails = asyncHandler(async (req, res) => {
  // allow partial updates; fields come from req.fields and optional file in req.files / req.file
  const fields = req.fields || {};
  const updates = { ...fields };

  // If middleware set an image URL it's already in fields.image. Otherwise accept common file shapes as fallback.
  if (!updates.image) {
    if (req.files && req.files.image && req.files.image.path) updates.image = req.files.image.path; // formidable
    else if (req.file && req.file.path) updates.image = req.file.path; // multer single
    else if (req.files && Array.isArray(req.files.image) && req.files.image[0]?.path)
      updates.image = req.files.image[0].path; // multer array
  }

  // coerce numeric fields when provided
  if (updates.price !== undefined) updates.price = Number(updates.price);
  if (updates.quantity !== undefined) updates.quantity = Number(updates.quantity);
  if (updates.countInStock !== undefined) updates.countInStock = Number(updates.countInStock);

  // Validate category if it's being updated
  if (updates.category && !mongoose.Types.ObjectId.isValid(updates.category)) {
    return res.status(400).json({ error: "Invalid category ID" });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No update fields provided" });
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  });

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

// @desc    Delete a product
const removeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json({ message: "Product deleted", product });
});

// @desc    Fetch paginated products (with optional keyword)
const fetchProducts = asyncHandler(async (req, res) => {
  const pageSize = 6;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
      name: {
        $regex: req.query.keyword,
        $options: "i",
      },
    }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    hasMore: page * pageSize < count,
  });
});

// @desc    Fetch single product by ID
const fetchProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

// @desc    Fetch all products (admin)
const fetchAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .populate("category")
    .limit(12)
    .sort({ createdAt: -1 });

  res.json(products);
});

// @desc    Add product review
const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({ error: "Product already reviewed" });
  }

  const review = {
    name: req.user.username,
    rating: Number(rating),
    comment,
    user: req.user._id,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();
  res.status(201).json({ message: "Review added" });
});

// @desc    Fetch top-rated products
const fetchTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(4);
  res.json(products);
});

// @desc    Fetch newest products
const fetchNewProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ _id: -1 }).limit(5);
  res.json(products);
});

// @desc    Filter products by category and price
const filterProducts = asyncHandler(async (req, res) => {
  const { checked = [], radio = [] } = req.body;

  let args = {};
  if (checked.length > 0) args.category = checked;
  if (radio.length === 2) args.price = { $gte: radio[0], $lte: radio[1] };

  const products = await Product.find(args);
  res.json(products);
});

export {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
};
