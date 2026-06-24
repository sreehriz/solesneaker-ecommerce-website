const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from absolute path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DEFAULT_IMAGE = '/images/default_sneaker.jpeg';
const EMBEDDING_THRESHOLD = 0.50; // Cosine similarity threshold for strong AI matches
const KEYWORD_THRESHOLD = 0.20;   // Keyword Jaccard threshold for token-based matching fallback

/**
 * Preprocesses a name or filename for keyword similarity:
 * - Converts to lowercase
 * - Removes file extensions
 * - Replaces non-alphanumeric characters with spaces
 * - Tokenizes by whitespace
 */
function preprocessName(text) {
  if (!text) return [];
  // Remove file extension if any
  const baseName = text.replace(/\.(jpeg|jpg|png|gif|webp)$/i, '');
  return baseName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.trim() !== '');
}

/**
 * Calculates Jaccard token overlap similarity between two sets of tokens.
 */
function calculateJaccardSimilarity(tokens1, tokens2) {
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  
  if (set1.size === 0 && set2.size === 0) return 1.0;
  
  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) {
      intersection++;
    }
  }
  
  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0.0 : intersection / union;
}

/**
 * Calculates the cosine similarity between two vectors.
 */
function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0.0;
  
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0.0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generates vector embeddings for a list of strings in batch using the Gemini API.
 */
async function getGeminiEmbeddings(texts) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ [Embeddings] GEMINI_API_KEY is not configured in .env. Skipping AI embeddings matching.');
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:batchEmbedContents?key=${apiKey}`;
  const chunkSize = 100;
  let allEmbeddings = [];

  try {
    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunk = texts.slice(i, i + chunkSize);
      const requests = chunk.map(text => ({
        model: "models/gemini-embedding-2",
        content: {
          parts: [{ text }]
        }
      }));

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status} - ${errText}`);
      }

      const data = await res.json();
      if (!data.embeddings) {
        throw new Error('Embeddings key not found in API response.');
      }
      
      allEmbeddings = allEmbeddings.concat(data.embeddings.map(e => e.values));
    }
    return allEmbeddings;
  } catch (err) {
    console.error(`⚠️ [Embeddings] Gemini API embedding generation failed: ${err.message}.`);
    return null;
  }
}

/**
 * Scans the images folder, maps files using AI or keywords,
 * updates the database, and returns a detailed report of the operation.
 */
async function matchImagesToProducts() {
  console.log('🔄 [ImageMatcher] Starting product image matching workflow...');

  // Locate the images folder (checking both /image and /images)
  let imagesDir = path.resolve(__dirname, '../../image');
  if (!fs.existsSync(imagesDir)) {
    imagesDir = path.resolve(__dirname, '../../images');
  }

  if (!fs.existsSync(imagesDir)) {
    throw new Error(`Images folder not found. Searched paths: /image, /images`);
  }

  // 1. Read all image filenames
  const imageFiles = fs.readdirSync(imagesDir).filter(file => {
    return /\.(jpeg|jpg|png|gif|webp)$/i.test(file);
  });
  console.log(`📁 [ImageMatcher] Found ${imageFiles.length} image files in directory: ${imagesDir}`);

  // 2. Fetch all products from the database (supporting MongoDB & Mock in-memory mode)
  const Product = require('../models/Product');
  const products = await Product.find({});
  console.log(`📦 [ImageMatcher] Fetched ${products.length} products from the database.`);

  if (products.length === 0 || imageFiles.length === 0) {
    return {
      success: false,
      message: 'No products or image files found to perform matching.',
      matches: []
    };
  }

  // 3. Perform Match Calculations
  let useAI = false;
  let productEmbeddings = null;
  let imageEmbeddings = null;

  // We embed the full representation: brand + name
  const productTextRepresentations = products.map(p => `${p.brand} ${p.name}`);
  // We embed the preprocessed clean filename without extension
  const imageTextRepresentations = imageFiles.map(filename => filename.replace(/\.(jpeg|jpg|png|gif|webp)$/i, ''));

  console.log('✨ [ImageMatcher] Requesting Gemini embeddings...');
  const allTexts = [...productTextRepresentations, ...imageTextRepresentations];
  const embeddings = await getGeminiEmbeddings(allTexts);

  if (embeddings) {
    useAI = true;
    productEmbeddings = embeddings.slice(0, products.length);
    imageEmbeddings = embeddings.slice(products.length);
    console.log('✅ [ImageMatcher] Successfully loaded Gemini API vector embeddings.');
  } else {
    console.log('🔮 [ImageMatcher] Falling back to preprocessed keyword similarity matching.');
  }

  // Calculate similarity scores for all possible (product, image) pairs
  const candidates = [];

  for (let pIdx = 0; pIdx < products.length; pIdx++) {
    const product = products[pIdx];
    const productTokens = preprocessName(`${product.brand} ${product.name}`);

    for (let iIdx = 0; iIdx < imageFiles.length; iIdx++) {
      const filename = imageFiles[iIdx];
      const imageTokens = preprocessName(filename);

      let score = 0;
      let method = '';

      if (useAI) {
        score = calculateCosineSimilarity(productEmbeddings[pIdx], imageEmbeddings[iIdx]);
        method = 'cosine';
      } else {
        score = calculateJaccardSimilarity(productTokens, imageTokens);
        method = 'jaccard';
      }

      candidates.push({
        productIndex: pIdx,
        product,
        imageIndex: iIdx,
        filename,
        score,
        method
      });
    }
  }

  // Sort candidates by similarity score in descending order
  candidates.sort((a, b) => b.score - a.score);

  // 4. Bipartite Greedy Matching (avoids duplicate assignments)
  const matchedProducts = new Set();
  const matchedImages = new Set();
  const assignments = new Map(); // productId -> matched image details

  const threshold = useAI ? EMBEDDING_THRESHOLD : KEYWORD_THRESHOLD;

  for (const candidate of candidates) {
    const pId = (candidate.product._id || candidate.product.id).toString();
    const filename = candidate.filename;

    if (!matchedProducts.has(pId) && !matchedImages.has(filename)) {
      if (candidate.score >= threshold) {
        matchedProducts.add(pId);
        matchedImages.add(filename);
        assignments.set(pId, {
          filename,
          score: candidate.score,
          method: candidate.method,
          strongMatch: true
        });
      }
    }
  }

  // 5. Handle Fallbacks (unmatched products) and Log review items
  const unmatchedProducts = [];
  const matchedList = [];

  for (const product of products) {
    const pId = (product._id || product.id).toString();
    let assignment = assignments.get(pId);

    if (!assignment) {
      // Find the absolute highest scoring image for this product, even if already assigned
      // (as a soft fallback rather than immediate default if there's a decent secondary match)
      let bestFallback = null;
      for (const candidate of candidates) {
        if ((candidate.product._id || candidate.product.id).toString() === pId) {
          if (!bestFallback || candidate.score > bestFallback.score) {
            bestFallback = candidate;
          }
        }
      }

      if (bestFallback && bestFallback.score >= (threshold * 0.7)) {
        // Soft fallback match
        assignment = {
          filename: bestFallback.filename,
          score: bestFallback.score,
          method: bestFallback.method,
          strongMatch: false,
          isDuplicate: true
        };
        matchedProducts.add(pId);
        assignments.set(pId, assignment);
      } else {
        // No decent match: Assign default image
        assignment = {
          filename: DEFAULT_IMAGE,
          score: 0,
          method: 'none',
          strongMatch: false,
          isDefault: true
        };
        unmatchedProducts.push(product.name);
      }
    }

    // Prepare updated path
    let imagePath = assignment.isDefault ? DEFAULT_IMAGE : `/images/${assignment.filename}`;

    // 6. Update database record
    if (require('../config/db').isMock()) {
      // Mock db in-memory update
      const { mockDb } = require('../config/db');
      const mockProduct = mockDb.products.find(p => (p._id || p.id).toString() === pId);
      if (mockProduct) {
        mockProduct.image = imagePath;
      }
    } else {
      // MongoDB persistent update
      const { ProductModel } = require('../models/Product');
      await ProductModel.findByIdAndUpdate(product._id, { image: imagePath });
    }

    matchedList.push({
      productName: product.name,
      brand: product.brand,
      matchedImage: imagePath,
      score: assignment.score.toFixed(4),
      method: assignment.method,
      status: assignment.strongMatch ? 'Strong Match' : (assignment.isDefault ? 'Default Fallback' : 'Soft Match (Duplicate)')
    });
  }

  // Gather unmatched filenames for review logging
  const unmatchedImages = imageFiles.filter(img => !matchedImages.has(img));

  console.log(`✅ [ImageMatcher] Image matching completed. Matched ${matchedProducts.size}/${products.length} products.`);

  return {
    success: true,
    useAI,
    totalProducts: products.length,
    matchedCount: matchedProducts.size,
    unmatchedProducts,
    unmatchedImages,
    matches: matchedList
  };
}

module.exports = {
  preprocessName,
  calculateJaccardSimilarity,
  calculateCosineSimilarity,
  getGeminiEmbeddings,
  matchImagesToProducts
};
