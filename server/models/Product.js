const mongoose = require('mongoose');
const { isMock, mockDb } = require('../config/db');
const { generateEnhancedImage } = require('../utils/geminiImageGenerator');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true, default: 4.5 },
  category: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  sizes: { type: [Number], required: true },
  stock: { type: Number, required: true, default: 10 },
  searchCount: { type: Number, required: true, default: 0 }
}, { timestamps: true });

const ProductModel = mongoose.model('Product', ProductSchema);

// Complete 30-product dataset — unique, properly-formatted Unsplash images per product
const seedProducts = [
  {
    _id: "p1",
    name: "Air Jordan 1 Retro High OG",
    brand: "Nike",
    category: "Sneakers",
    price: 18999,
    rating: 4.8,
    sizes: [7, 8, 9, 10, 11],
    description: "Iconic high-top sneaker with premium leather and timeless design.",
    image: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?auto=format&fit=crop&w=800&q=80",
    stock: 25
  },
  {
    _id: "p2",
    name: "Air Max 270",
    brand: "Nike",
    category: "Running",
    price: 12999,
    rating: 4.6,
    sizes: [6, 7, 8, 9, 10],
    description: "Lightweight running shoe with responsive Air cushioning.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    stock: 30
  },
  {
    _id: "p3",
    name: "Ultraboost 22",
    brand: "Adidas",
    category: "Running",
    price: 15999,
    rating: 4.7,
    sizes: [7, 8, 9, 10, 11],
    description: "Boost cushioning for maximum energy return.",
    image: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80",
    stock: 20
  },
  {
    _id: "p4",
    name: "Yeezy Boost 350 V2",
    brand: "Adidas",
    category: "Limited Edition",
    price: 24999,
    rating: 4.9,
    sizes: [7, 8, 9, 10],
    description: "Premium lifestyle sneaker with futuristic styling.",
    image: "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?auto=format&fit=crop&w=800&q=80",
    stock: 10
  },
  {
    _id: "p5",
    name: "RS-X Reinvention",
    brand: "Puma",
    category: "Casual",
    price: 9999,
    rating: 4.5,
    sizes: [6, 7, 8, 9],
    description: "Bold retro sneaker with chunky silhouette.",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80",
    stock: 40
  },
  {
    _id: "p6",
    name: "990v5",
    brand: "New Balance",
    category: "Casual",
    price: 17999,
    rating: 4.7,
    sizes: [7, 8, 9, 10, 11],
    description: "Classic premium sneaker with superior comfort.",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80",
    stock: 18
  },
  {
    _id: "p7",
    name: "Air Force 1 '07",
    brand: "Nike",
    category: "Casual",
    price: 10999,
    rating: 4.8,
    sizes: [6, 7, 8, 9, 10, 11],
    description: "Legendary all-white sneaker.",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    stock: 50
  },
  {
    _id: "p8",
    name: "NMD_R1",
    brand: "Adidas",
    category: "Lifestyle",
    price: 13999,
    rating: 4.6,
    sizes: [7, 8, 9, 10],
    description: "Modern streetwear sneaker with Boost cushioning.",
    image: "https://images.unsplash.com/photo-1512374382149-4337531f29cdc?auto=format&fit=crop&w=800&q=80",
    stock: 22
  },
  {
    _id: "p9",
    name: "Club C 85",
    brand: "Reebok",
    category: "Casual",
    price: 7999,
    rating: 4.4,
    sizes: [6, 7, 8, 9],
    description: "Minimal vintage tennis sneaker.",
    image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=800&q=80",
    stock: 35
  },
  {
    _id: "p10",
    name: "Chuck Taylor All Star High",
    brand: "Converse",
    category: "Casual",
    price: 5999,
    rating: 4.7,
    sizes: [6, 7, 8, 9, 10],
    description: "Iconic canvas sneaker.",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
    stock: 60
  },
  {
    _id: "p11",
    name: "ZoomX Vaporfly Next%",
    brand: "Nike",
    category: "Running",
    price: 22999,
    rating: 4.9,
    sizes: [7, 8, 9, 10],
    description: "Elite marathon shoe with carbon plate.",
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80",
    stock: 12
  },
  {
    _id: "p12",
    name: "Superstar",
    brand: "Adidas",
    category: "Casual",
    price: 8999,
    rating: 4.6,
    sizes: [6, 7, 8, 9, 10],
    description: "Classic shell-toe sneaker.",
    image: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?auto=format&fit=crop&w=800&q=80",
    stock: 45
  },
  {
    _id: "p13",
    name: "Future Rider",
    brand: "Puma",
    category: "Lifestyle",
    price: 8499,
    rating: 4.5,
    sizes: [6, 7, 8, 9],
    description: "Retro running-inspired sneaker.",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
    stock: 28
  },
  {
    _id: "p14",
    name: "574 Core",
    brand: "New Balance",
    category: "Casual",
    price: 9999,
    rating: 4.6,
    sizes: [7, 8, 9, 10],
    description: "Versatile everyday sneaker.",
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80",
    stock: 33
  },
  {
    _id: "p15",
    name: "Blazer Mid '77",
    brand: "Nike",
    category: "Casual",
    price: 9499,
    rating: 4.7,
    sizes: [7, 8, 9, 10],
    description: "Vintage basketball sneaker.",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80",
    stock: 20
  },
  {
    _id: "p16",
    name: "Stan Smith",
    brand: "Adidas",
    category: "Casual",
    price: 7999,
    rating: 4.8,
    sizes: [6, 7, 8, 9, 10],
    description: "Clean minimalist tennis shoe.",
    image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80",
    stock: 55
  },
  {
    _id: "p17",
    name: "React Infinity Run",
    brand: "Nike",
    category: "Running",
    price: 15999,
    rating: 4.7,
    sizes: [7, 8, 9, 10],
    description: "High cushioning for long runs.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80",
    stock: 25
  },
  {
    _id: "p18",
    name: "Suede Classic",
    brand: "Puma",
    category: "Casual",
    price: 6999,
    rating: 4.5,
    sizes: [6, 7, 8, 9],
    description: "Timeless suede sneaker.",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
    stock: 30
  },
  {
    _id: "p19",
    name: "Nano X2",
    brand: "Reebok",
    category: "Training",
    price: 11999,
    rating: 4.6,
    sizes: [7, 8, 9, 10],
    description: "Versatile training shoe.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    stock: 18
  },
  {
    _id: "p20",
    name: "HOVR Phantom 2",
    brand: "Under Armour",
    category: "Running",
    price: 13999,
    rating: 4.5,
    sizes: [7, 8, 9, 10],
    description: "Energy-return cushioning system.",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80",
    stock: 16
  },
  {
    _id: "p21",
    name: "Dunk Low Retro",
    brand: "Nike",
    category: "Sneakers",
    price: 11999,
    rating: 4.8,
    sizes: [7, 8, 9, 10],
    description: "Street-style icon with bold colorways.",
    image: "https://images.unsplash.com/photo-1618898909019-010e4e234c55?auto=format&fit=crop&w=800&q=80",
    stock: 40
  },
  {
    _id: "p22",
    name: "Forum Low",
    brand: "Adidas",
    category: "Sneakers",
    price: 10999,
    rating: 4.6,
    sizes: [7, 8, 9, 10],
    description: "Basketball-inspired sneaker.",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80",
    stock: 22
  },
  {
    _id: "p23",
    name: "327",
    brand: "New Balance",
    category: "Lifestyle",
    price: 11999,
    rating: 4.7,
    sizes: [7, 8, 9, 10],
    description: "Modern retro sneaker.",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    stock: 20
  },
  {
    _id: "p24",
    name: "Cali Sport",
    brand: "Puma",
    category: "Lifestyle",
    price: 8999,
    rating: 4.5,
    sizes: [6, 7, 8, 9],
    description: "West Coast inspired sneaker.",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
    stock: 27
  },
  {
    _id: "p25",
    name: "Pegasus 40",
    brand: "Nike",
    category: "Running",
    price: 12999,
    rating: 4.7,
    sizes: [7, 8, 9, 10],
    description: "Reliable everyday running shoe.",
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=80",
    stock: 35
  },
  {
    _id: "p26",
    name: "Gazelle",
    brand: "Adidas",
    category: "Casual",
    price: 8499,
    rating: 4.6,
    sizes: [6, 7, 8, 9],
    description: "Classic suede lifestyle sneaker.",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80",
    stock: 30
  },
  {
    _id: "p27",
    name: "Classic Leather",
    brand: "Reebok",
    category: "Casual",
    price: 7999,
    rating: 4.5,
    sizes: [6, 7, 8, 9],
    description: "Timeless leather sneaker.",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    stock: 38
  },
  {
    _id: "p28",
    name: "Air Zoom Structure 24",
    brand: "Nike",
    category: "Running",
    price: 13999,
    rating: 4.6,
    sizes: [7, 8, 9, 10],
    description: "Stability running shoe.",
    image: "https://images.unsplash.com/photo-1538329972958-465d6d2144ed?auto=format&fit=crop&w=800&q=80",
    stock: 19
  },
  {
    _id: "p29",
    name: "Charged Assert 9",
    brand: "Under Armour",
    category: "Running",
    price: 8999,
    rating: 4.4,
    sizes: [7, 8, 9, 10],
    description: "Lightweight running sneaker.",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    stock: 42
  },
  {
    _id: "p30",
    name: "Run Star Motion",
    brand: "Converse",
    category: "Lifestyle",
    price: 9999,
    rating: 4.6,
    sizes: [6, 7, 8, 9],
    description: "Bold futuristic Converse design.",
    image: "https://images.unsplash.com/photo-1465453869711-7e174808ace9?auto=format&fit=crop&w=800&q=80",
    stock: 24
  }
];

// Initialize mockDb with seed products
mockDb.products = seedProducts.map((p, idx) => ({ 
  ...p, 
  id: idx + 1,
  searchCount: p.searchCount || 0,
  createdAt: new Date() 
}));

// Seed function for MongoDB (called on startup)
async function seedMongoDB() {
  if (isMock()) return;
  try {
    const count = await ProductModel.countDocuments();
    // Seed or reset if we have fewer than 30 products to ensure full dataset
    if (count < 30) {
      await ProductModel.deleteMany({}); // Reset to ensure clean seed of 30 products
      
      const toInsert = seedProducts.map((p, idx) => {
        const { _id, ...rest } = p;
        return {
          ...rest,
          id: idx + 1, // Keep numeric ID for mappings
          searchCount: 0
        };
      });

      await ProductModel.insertMany(toInsert);
      console.log('🌱 [DB] MongoDB seeded/reset with the 30-product dataset.');
    }
  } catch (err) {
    console.error('⚠️ [DB] Seeding MongoDB failed:', err.message);
  }
}

// Background worker to enhance all product images with Gemini Imagen 4.0
async function enhanceAllProductImages() {
  console.log('✨ [Gemini] Starting background image enhancement/optimization worker...');
  
  if (isMock()) {
    for (let p of mockDb.products) {
      if (p.image && p.image.startsWith('data:image')) continue;
      
      const numId = p.id || parseInt(p._id.replace('p', '')) || 1;
      try {
        const enhanced = await generateEnhancedImage(numId, p.brand, p.name, p.image);
        p.image = enhanced;
      } catch (err) {
        console.error(`⚠️ [Gemini] Mock image enhancement failed for ${p.name}:`, err.message);
      }
    }
    console.log('✨ [Gemini] Background image enhancement completed for mock database.');
    return;
  }

  // MongoDB mode
  try {
    const products = await ProductModel.find({});
    let count = 0;
    for (let p of products) {
      if (p.image && p.image.startsWith('data:image')) continue;
      
      // Get numeric id from our seed products matching the product name
      const seedMatch = seedProducts.find(s => s.name === p.name);
      const numId = seedMatch ? parseInt(seedMatch._id.replace('p', '')) : (p.id || 1);

      try {
        const newImage = await generateEnhancedImage(numId, p.brand, p.name, p.image);
        await ProductModel.findByIdAndUpdate(p._id, { image: newImage });
        count++;
      } catch (err) {
        console.error(`⚠️ [Gemini] DB image enhancement failed for ${p.name}:`, err.message);
      }
    }
    console.log(`✨ [Gemini] Background image enhancement completed for MongoDB. Updated ${count} products.`);
  } catch (err) {
    console.error('⚠️ [Gemini] Error in background image enhancement:', err.message);
  }
}

// Database-agnostic helper operations
const Product = {
  find: async (query = {}) => {
    if (isMock()) {
      return mockDb.products.filter(p => {
        for (let key in query) {
          if (query[key] !== undefined && p[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
    }
    return ProductModel.find(query);
  },

  findById: async (id) => {
    if (isMock()) {
      return mockDb.products.find(p => p._id === id || p.id === parseInt(id)) || null;
    }
    try {
      return await ProductModel.findById(id);
    } catch {
      // Fallback searching by numeric ID if valid
      if (!isNaN(id)) {
        return await ProductModel.findOne({ id: parseInt(id) });
      }
      return null;
    }
  },

  create: async (data) => {
    if (isMock()) {
      const newProduct = {
        _id: 'p' + (mockDb.products.length + 1),
        id: mockDb.products.length + 1,
        ...data,
        rating: data.rating || 4.5,
        searchCount: data.searchCount || 0,
        createdAt: new Date()
      };
      mockDb.products.push(newProduct);
      return newProduct;
    }
    return ProductModel.create(data);
  },

  updateSearchCount: async (id, increment = 1) => {
    if (isMock()) {
      const product = mockDb.products.find(p => p._id === id || p.id === parseInt(id));
      if (product) {
        product.searchCount = (product.searchCount || 0) + increment;
      }
      return product;
    }
    try {
      return await ProductModel.findByIdAndUpdate(id, { $inc: { searchCount: increment } }, { new: true });
    } catch {
      return await ProductModel.findOneAndUpdate({ id: parseInt(id) }, { $inc: { searchCount: increment } }, { new: true });
    }
  },

  seedMongoDB,
  enhanceAllProductImages,
  ProductModel, // Expose underlying model
  seedProducts // Expose raw seed products dataset
};

module.exports = Product;
