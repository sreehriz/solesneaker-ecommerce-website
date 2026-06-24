const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { runAlgorithm } = require('../utils/algorithmRunner');

// Standard delivery graph represented as edge-list for Dijkstra
// Nodes represent Warehouses, distribution Hubs, and User Areas
const deliveryGraphEdges = 'Warehouse-HubA:5,Warehouse-HubB:10,HubA-HubB:3,HubA-NodeC:8,HubB-NodeD:6,HubB-NodeE:12,NodeC-NodeE:4,NodeD-NodeE:5';

// Mapping user input addresses to graph nodes
const addressNodeMap = {
  'Node C (Oak Street)': 'NodeC',
  'Node D (Oak Street)': 'NodeD',
  'Node E (Broadway Ave)': 'NodeE',
  'Main Warehouse Node A': 'Warehouse',
  'Warehouse': 'Warehouse',
  'Hub A': 'HubA',
  'Hub B': 'HubB',
  'NodeC': 'NodeC',
  'NodeD': 'NodeD',
  'NodeE': 'NodeE'
};

async function checkout(req, res) {
  try {
    const { items, shippingAddress } = req.body; // items: array of {productId, quantity, size}
    if (!items || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ error: 'Cart items and shipping address are required.' });
    }

    // Resolve products, check stock, and calculate subtotal
    let subtotal = 0;
    const checkoutItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${item.productId} not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Product ${product.name} is out of stock / insufficient quantity.` });
      }
      subtotal += product.price * item.quantity;
      checkoutItems.push({
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size
      });
    }

    // Dijkstra route optimization
    // Default destination to NodeE if not matched
    const destinationNode = addressNodeMap[shippingAddress] || 'NodeE';
    
    // Call Java Dijkstra: java -cp . algorithms.algorithm dijkstra <edges> Warehouse <dest>
    const routeResult = await runAlgorithm('dijkstra', [
      deliveryGraphEdges,
      'Warehouse',
      destinationNode
    ]);

    // Shipping cost: $1.50 per unit distance
    const distance = routeResult.totalDistance > 0 ? routeResult.totalDistance : 10; // Default distance to 10 if path not found
    const shippingCost = parseFloat((distance * 1.5).toFixed(2));
    const totalAmount = parseFloat((subtotal + shippingCost).toFixed(2));
    const route = routeResult.path.length > 0 ? routeResult.path : ['Warehouse', destinationNode];

    // Build raw invoice string for Huffman coding
    const invoiceText = `SOLEFORCE ORDER INVOICE\n` +
      `User ID: ${req.user.id}\n` +
      `Items: ${checkoutItems.map(i => `${i.name} (${i.quantity}x)`).join(', ')}\n` +
      `Subtotal: $${subtotal}\n` +
      `Shipping: $${shippingCost} (Route: ${route.join(' -> ')})\n` +
      `Total Amount: $${totalAmount}`;

    // Call Java Huffman: java -cp . algorithms.algorithm huffman <text>
    const huffmanResult = await runAlgorithm('huffman', [invoiceText]);

    // Create the order
    const order = await Order.create({
      userId: req.user.id,
      items: checkoutItems,
      shippingAddress,
      totalAmount,
      shippingCost,
      deliveryRoute: route,
      invoiceCompressed: huffmanResult.encodedText
    });

    // Output compression statistics in console (simulating invoices compression)
    console.log(`⚡ [Huffman] Order ${order._id || order.id} invoice compressed:`);
    console.log(`Original: ${huffmanResult.originalSizeBits} bits | Compressed: ${huffmanResult.compressedSizeBits} bits`);
    console.log(`Ratio: ${huffmanResult.compressionRatio.toFixed(2)}x`);

    // Reset user cart on successful checkout
    await User.update(req.user.id, { cart: [] });

    res.status(201).json({
      order,
      invoiceCompressionStats: {
        originalSizeBits: huffmanResult.originalSizeBits,
        compressedSizeBits: huffmanResult.compressedSizeBits,
        compressionRatio: huffmanResult.compressionRatio
      }
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Budget-based cart optimizer using Java Knapsack (0/1 DP).
 */
async function budgetOptimize(req, res) {
  try {
    const { budget, items } = req.body; // budget: number (dollars), items: array of {productId, rating}
    if (!budget || !items || items.length === 0) {
      return res.status(400).json({ error: 'Budget and candidate items are required.' });
    }

    // Resolve products to fetch prices
    const resolvedItems = [];
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        resolvedItems.push({
          id: (product._id || product.id).toString(),
          name: product.name,
          price: Math.round(product.price), // weight is rounded price
          rating: product.rating // value is rating
        });
      }
    }

    if (resolvedItems.length === 0) {
      return res.json({ selectedItems: [], totalWeight: 0, totalValue: 0 });
    }

    // Format for Knapsack: name:price:rating,name:price:rating,...
    const itemsParam = resolvedItems.map(ri => `${ri.id}:${ri.price}:${ri.rating}`).join(',');

    // Call Java Knapsack
    const result = await runAlgorithm('knapsack', [
      budget.toString(),
      itemsParam
    ]);

    // Map selected IDs back to products
    const selectedProducts = result.selectedItems.map(id => {
      const ri = resolvedItems.find(item => item.id === id);
      return {
        id,
        name: ri.name,
        price: ri.price,
        rating: ri.rating
      };
    });

    res.json({
      selectedProducts,
      totalCost: result.totalWeight,
      totalRatingScore: result.totalValue
    });
  } catch (err) {
    console.error('Knapsack optimization error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Product bundle suggestions using Java Subset Sum.
 */
async function getBundleSuggestions(req, res) {
  try {
    const { target } = req.query; // target sum (e.g. voucher value)
    if (!target) {
      return res.status(400).json({ error: 'Target bundle price is required.' });
    }

    const products = await Product.find();
    if (products.length === 0) {
      return res.json({ bundles: [] });
    }

    // Map rounded prices to an integer array
    const prices = products.map(p => Math.round(p.price));
    // Remove duplicates and sort to make subset sum cleaner
    const uniquePrices = [...new Set(prices)].sort((a, b) => a - b);

    // Call Java Subset Sum: java -cp . algorithms.algorithm subset_sum <comma_prices> <target> <max_solutions>
    const result = await runAlgorithm('subset_sum', [
      uniquePrices.join(','),
      target,
      '5' // limit to max 5 solutions
    ]);

    const suggestions = [];

    // Map price combinations back to products
    for (let subset of result.subsets) {
      const bundleProducts = [];
      const usedIds = new Set();
      
      for (let price of subset) {
        // Find a product with this price that has not been added in this bundle
        const matchingProduct = products.find(p => 
          Math.round(p.price) === price && !usedIds.has(p._id || p.id)
        );
        if (matchingProduct) {
          bundleProducts.push(matchingProduct);
          usedIds.add(matchingProduct._id || matchingProduct.id);
        }
      }

      if (bundleProducts.length > 0) {
        suggestions.push({
          products: bundleProducts,
          totalPrice: bundleProducts.reduce((sum, p) => sum + p.price, 0)
        });
      }
    }

    res.json({
      bundles: suggestions
    });
  } catch (err) {
    console.error('Subset Sum bundle error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({ userId: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  checkout,
  budgetOptimize,
  getBundleSuggestions,
  getUserOrders
};
