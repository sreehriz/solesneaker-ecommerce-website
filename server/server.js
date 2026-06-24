const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../image')));
app.use('/banner', express.static(path.join(__dirname, '../banner')));

// Basic sanity check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SOLEFORCE E-commerce backend is healthy and running.' });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// Serve compiled static client assets
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// Fallback all non-API page requests to React's index.html (supports react-router routes)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
async function startServer() {
  await connectDB();
  
  // Seed MongoDB if connected
  await Product.seedMongoDB();
  await User.seedMongoDB();
  
  // Run image matching to map products to local images on startup
  const { matchImagesToProducts } = require('./utils/imageMatcher');
  matchImagesToProducts()
    .then(report => {
      console.log(`✨ [ImageMatcher] Image matching workflow completed.`);
      console.log(`🤖 Matching Engine : ${report.useAI ? 'Gemini AI Embeddings' : 'Jaccard Token Fallback'}`);
      console.log(`📦 Total Products  : ${report.totalProducts}`);
      console.log(`✅ Matched Products: ${report.matchedCount} / ${report.totalProducts}`);
      if (report.unmatchedProducts.length > 0) {
        console.warn('⚠️ [ImageMatcher] Unmatched products:', report.unmatchedProducts);
      }
    })
    .catch(err => {
      console.error('⚠️ [ImageMatcher] Image matching failed:', err.message);
    });

  app.listen(PORT, () => {
    console.log(`🔥 [Server] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`🔌 [API] Health Check available at: http://localhost:${PORT}/api/health`);
  });
}

startServer();
