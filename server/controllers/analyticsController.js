const { runAlgorithm } = require('../utils/algorithmRunner');
const Product = require('../models/Product');

/**
 * Runs N-Queens stand solver in Java.
 */
async function getNQueens(req, res) {
  try {
    const size = req.query.size || 6;
    const result = await runAlgorithm('nqueens', [size.toString()]);
    res.json(result);
  } catch (err) {
    console.error('NQueens controller error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Runs OBST keyword tree solver in Java.
 */
async function getOBST(req, res) {
  try {
    const products = await Product.find({});
    if (products.length === 0) {
      return res.json({ minCost: 0, keys: [], pProbs: [], structure: [] });
    }

    // Slice to top 5 products for clean visual dashboard tree rendering
    const sortedProducts = [...products].slice(0, 5).sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    const keys = sortedProducts.map(p => p.name);
    const searchCounts = sortedProducts.map(p => (p.searchCount || 0) + 1); // Avoid 0 weight
    const totalCount = searchCounts.reduce((acc, c) => acc + c, 0);

    const p = searchCounts.map(c => parseFloat((c / totalCount).toFixed(4)));
    const q = Array(keys.length + 1).fill(0.02);

    const result = await runAlgorithm('obst', [
      keys.join(','),
      p.join(','),
      q.join(',')
    ]);

    res.json(result);
  } catch (err) {
    console.error('OBST controller error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Runs Floyd-Warshall shortest paths solver in Java.
 */
async function getFloyd(req, res) {
  try {
    const INF = 99999;
    const matrix = [
      [0,   5,   10,  INF, INF, INF], // Warehouse
      [5,   0,   3,   8,   INF, INF], // HubA
      [10,  3,   0,   INF, 6,   12 ], // HubB
      [INF, 8,   INF, 0,   INF, 4  ], // NodeC
      [INF, INF, 6,   INF, 0,   5  ], // NodeD
      [INF, INF, 12,  4,   5,   0  ]  // NodeE
    ];

    const matrixString = matrix.map(row => row.join(',')).join(';');

    const result = await runAlgorithm('floyd', [matrixString]);
    
    res.json({
      hubs: ['Warehouse', 'Hub A', 'Hub B', 'Node C', 'Node D', 'Node E'],
      shortestDistances: result.shortestDistances
    });
  } catch (err) {
    console.error('Floyd controller error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Runs Hamiltonian delivery TSP validator in Java.
 */
async function getHamiltonian(req, res) {
  try {
    const { matrix } = req.query;
    if (!matrix) {
      return res.status(400).json({ error: 'Matrix parameter is required.' });
    }

    const result = await runAlgorithm('hamiltonian', [matrix]);
    
    res.json({
      path: result.path,
      nodes: ['Warehouse Depot', 'Distribution Hub A', 'Distribution Hub B', 'Retail Node C']
    });
  } catch (err) {
    console.error('Hamiltonian controller error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Runs Warshall transitive recommendations closure solver in Java.
 */
async function getWarshall(req, res) {
  try {
    const { matrix } = req.query;
    if (!matrix) {
      return res.status(400).json({ error: 'Matrix parameter is required.' });
    }

    const result = await runAlgorithm('warshall', [matrix]);

    const adjacencyMatrix = matrix.split(';').map(row => row.split(',').map(Number));

    res.json({
      categories: ['Sneakers', 'Sports', 'Casual', 'Limited Edition'],
      adjacencyMatrix: adjacencyMatrix,
      transitiveClosure: result.transitiveClosure
    });
  } catch (err) {
    console.error('Warshall controller error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getNQueens,
  getOBST,
  getFloyd,
  getHamiltonian,
  getWarshall
};
