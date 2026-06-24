# SOLEFORCE — Sneaker & Streetwear E-Commerce Platform

Welcome to **SOLEFORCE**, a premium sneaker e-commerce platform built at the intersection of streetwear culture and algorithmic engineering. The platform combines a sleek frontend design with a Node.js/Express REST API and a high-performance **Java Algorithms Layer** that orchestrates complex operations.

---

## 🎨 Design Philosophy (Nike x Apple Hybrid)

SOLEFORCE utilizes a hybrid design style:
* **Apple Influence**: Clean geometry, hairline borders, ample negative space, strict typography, and subtle micro-animations.
* **Nike Influence**: Energetic uppercase typography, bold accents, high-contrast imagery, and large product spotlights.
* **Vibe**: Dark radial backgrounds, deep charcoal elements, glassmorphism containers, and high-visibility orange accents.

---

## 🚀 Key Features

### 1. 360° Rotating Product Viewer
The home page features a fullscreen cinematic canvas renderer displaying a **360° product spin** of a Nike Free Run sneaker:
* **Mouse Parallax**: Slide the mouse horizontally across the screen to rotate the shoe.
* **Smooth Inertia**: Weighted frame interpolation (`lerp`) gives the spin rotation a premium, heavy product feel.
* **Auto-Rotate Fallback**: Gentle continuous auto-spin when the user is idle, which pauses on hover and resumes after 2.5 seconds.
* **Dynamic Overlay**: A dark readability gradient protects text visibility while allowing the rotating shoe spotlight to blend seamlessly.

### 2. Java Algorithms Engine
Administrative dashboard and cart logic integrate **11 distinct Java-based algorithms** executing store operations:
1. **Binary Search**: Instant search keywords resolution.
2. **Merge Sort**: Stable list sorting by price/ratings.
3. **Dijkstra's Algorithm**: Delivery route optimization and shortest path calculations.
4. **Huffman Coding**: High-efficiency invoice text compression/decompression.
5. **0/1 Knapsack**: Budget-based cart optimizer maximizing satisfaction.
6. **Optimal BST (OBST)**: Minimal search tree structures for frequent keywords.
7. **Warshall's Transitive Closure**: Resolves category linkages.
8. **Floyd-Warshall's All-Pairs Shortest Path**: Inter-warehouse route distance matrices.
9. **N-Queens Solver**: Non-conflicting grid arrangements (security layouts).
10. **Hamiltonian Cycle**: Route loops validation.
11. **Subset Sum**: Free shipping thresholds and discount coupon combinations.

### 3. Gemini AI Semantic Search
Integrates Google's Gemini embeddings API to match user search prompts semantically with products in the sneaker catalog, supporting a local in-memory DB fallback.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), Canvas API, Tailwind CSS, Lucide icons, scoped styling.
* **Backend**: Node.js, Express, Mongoose, MongoDB (with in-memory database fallback).
* **Algorithms**: Java SE (JDK 18+), child process execution.
* **AI Embeddings**: Google Gemini API.

---

## ⚙️ Directory Structure

```
├── algorithms/             # Java Algorithms source files (*.java, *.class)
├── client/                 # React frontend application (Vite-based)
│   ├── public/             # Static files (images, shoe frames)
│   └── src/                # React source code (components, pages, context)
├── server/                 # Express backend server
│   ├── controllers/        # Route controllers
│   ├── routes/             # Express API routes
│   ├── utils/              # Child process runner for Java
│   └── .env                # Server configuration (gitignored)
└── image/                  # Product asset images directory
```

---

## ⚡ Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) (v18+)
* [MongoDB](https://www.mongodb.com/) (Optional - server falls back to In-Memory mode if not running locally)

### 1. Compile Java Algorithms
Compile the algorithms in the root directory:
```bash
javac algorithms/*.java
```

### 2. Configure Backend Server
Navigate to the `server` folder, install dependencies, and create a `.env` file:
```bash
cd server
npm install
```
Create a `.env` file inside `server/` with the following configuration:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/soleforce
JWT_SECRET=super_secret_neon_sneaker_jwt_key_1337
NODE_ENV=development
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
Run the development server:
```bash
npm run dev
```

### 3. Configure Frontend Client
Navigate to the `client` folder, install dependencies, and run the client dev server:
```bash
cd ../client
npm install
npm run dev
```

The application will run locally:
* **Frontend client**: http://localhost:5173/ (or http://localhost:5174/)
* **Backend server API**: http://localhost:5000/
