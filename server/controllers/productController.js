const Product = require('../models/Product');
const { runAlgorithm } = require('../utils/algorithmRunner');

async function getAllProducts(req, res) {
  try {
    const { category, brand } = req.query;
    const query = {};
    if (category) query.category = category;
    if (brand) query.brand = brand;

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    // Increment search count when viewed (for OBST optimization data)
    await Product.updateSearchCount(req.params.id, 1);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Searches products using Java Binary Search.
 */
async function searchProducts(req, res) {
  try {
    const { q } = req.query; // search query
    if (!q || q.trim() === '') {
      const products = await Product.find();
      return res.json(products);
    }

    const products = await Product.find();
    if (products.length === 0) {
      return res.json([]);
    }

    // Sort products by name in JS to prepare for Binary Search (which requires a sorted list)
    // We sort alphabetically case-insensitive
    const sortedProducts = [...products].sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    const sortedNames = sortedProducts.map(p => p.name);

    // Call Java Binary Search: java -cp . algorithms.algorithm binary_search <comma_separated_names> <target>
    const result = await runAlgorithm('binary_search', [
      sortedNames.join(','),
      q
    ]);

    if (result.index !== -1) {
      // Direct match found
      const foundProduct = sortedProducts[result.index];
      
      // Update its search counter
      await Product.updateSearchCount(foundProduct._id || foundProduct.id, 2);

      return res.json([foundProduct]);
    } else {
      // Fuzzy fallback search in Node.js if binary search (exact name match) yields no result
      // This is a premium UX touch!
      const searchTerm = q.toLowerCase();
      const fuzzyMatches = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.brand.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );

      // Increment search counters for matches
      for (let p of fuzzyMatches) {
        await Product.updateSearchCount(p._id || p.id, 1);
      }

      return res.json(fuzzyMatches);
    }
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Sorts products using Java Merge Sort.
 */
async function sortProducts(req, res) {
  try {
    const { field, order } = req.query; // field: price or rating, order: asc or desc
    const sortBy = field === 'rating' ? 'rating' : 'price';
    const isAscending = order === 'desc' ? 'false' : 'true';

    const products = await Product.find();
    if (products.length === 0) {
      return res.json([]);
    }

    // Format pairs for Java Merge Sort: key:val,key:val,...
    // key is the product ID, val is the price or rating
    const pairs = products.map(p => `${p._id || p.id}:${p[sortBy]}`);

    // Call Java Merge Sort
    const result = await runAlgorithm('merge_sort', [
      pairs.join(','),
      isAscending
    ]);

    // Map sorted IDs back to products
    const sortedProducts = result.sorted.map(item => {
      return products.find(p => (p._id || p.id).toString() === item.key);
    }).filter(p => p !== undefined);

    res.json(sortedProducts);
  } catch (err) {
    console.error('Sort error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Admin CRUD operations
async function createProduct(req, res) {
  try {
    const product = await Product.create(req.body);
    // Trigger image generation for the single new product
    const { generateEnhancedImage } = require('../utils/geminiImageGenerator');
    const newImage = await generateEnhancedImage(product.id || 99, product.brand, product.name, product.image);
    if (newImage !== product.image) {
      if (require('../config/db').isMock()) {
        product.image = newImage;
      } else {
        await Product.ProductModel.findByIdAndUpdate(product._id, { image: newImage });
      }
    }
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Reset and seed the 30-product dataset
async function seedProductsDataset(req, res) {
  try {
    const isMockDb = require('../config/db').isMock();
    if (!isMockDb) {
      // In MongoDB, force reset to trigger complete 30 products seed
      await Product.ProductModel.deleteMany({});
      await Product.seedMongoDB();
    } else {
      // In-memory mock database reset
      const { mockDb } = require('../config/db');
      mockDb.products = [];
      await Product.seedMongoDB(); // wait, Product.seedMongoDB is a no-op for mock, so let's seed mock manually
      const rawSeed = require('../models/Product').seedProducts || [];
      mockDb.products = rawSeed.map((p, idx) => ({
        ...p,
        id: idx + 1,
        searchCount: 0,
        createdAt: new Date()
      }));
    }

    // Re-run image matcher so local paths are applied immediately
    const { matchImagesToProducts } = require('../utils/imageMatcher');
    await matchImagesToProducts().catch(err => {
      console.error('⚠️ [ImageMatcher] Image matching failed after seeding:', err.message);
    });

    const products = await Product.find({});
    res.json({
      message: 'Successfully reset database and seeded 30-product dataset.',
      count: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  searchProducts,
  sortProducts,
  createProduct,
  seedProductsDataset
};
