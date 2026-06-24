const mongoose = require('mongoose');
const { connectDB, isMock } = require('../config/db');
const { matchImagesToProducts } = require('../utils/imageMatcher');

async function run() {
  console.log('🏁 [CLI Runner] Initializing database connection...');
  
  // Connect to DB (using standard configuration loading)
  await connectDB();
  
  // Seed the products database if running in mock/memory db or empty MongoDB,
  // to ensure there are products to match!
  const Product = require('../models/Product');
  const productsCount = (await Product.find({})).length;
  if (productsCount === 0) {
    console.log('🌱 [CLI Runner] Database is empty. Seeding products...');
    await Product.seedMongoDB();
  }

  try {
    const report = await matchImagesToProducts();
    
    console.log('\n========================================================================');
    console.log('📊 SOLEFORCE AI IMAGE MATCHING REPORT');
    console.log('========================================================================');
    console.log(`🤖 Matching Engine : ${report.useAI ? 'Gemini AI Embeddings (text-embedding-004)' : 'Jaccard Token Fallback'}`);
    console.log(`📦 Total Products  : ${report.totalProducts}`);
    console.log(`✅ Matched Products: ${report.matchedCount} / ${report.totalProducts} (${((report.matchedCount / report.totalProducts) * 100).toFixed(1)}%)`);
    console.log('------------------------------------------------------------------------');
    
    console.log('\n📋 PRODUCT MAPPING DETAILS:');
    console.table(report.matches.map(m => ({
      'Product': m.productName,
      'Brand': m.brand,
      'Matched Image': m.matchedImage,
      'Score': m.score,
      'Method': m.method,
      'Status': m.status
    })));

    if (report.unmatchedProducts.length > 0) {
      console.log('\n⚠️ UNMATCHED PRODUCTS (Assigned Default Sneaker):');
      report.unmatchedProducts.forEach(p => console.log(`  - ${p}`));
    } else {
      console.log('\n✨ All products successfully mapped to custom assets!');
    }

    if (report.unmatchedImages.length > 0) {
      console.log('\n🔍 UNMATCHED IMAGES IN FOLDER (Logged for review):');
      report.unmatchedImages.forEach(img => console.log(`  - ${img}`));
    } else {
      console.log('\n✨ All images in directory successfully mapped to products!');
    }
    
    console.log('========================================================================\n');
  } catch (err) {
    console.error('❌ Matching execution failed:', err);
  } finally {
    if (!isMock()) {
      await mongoose.connection.close();
      console.log('🔌 [CLI Runner] Mongoose connection closed.');
    }
    process.exit(0);
  }
}

run();
