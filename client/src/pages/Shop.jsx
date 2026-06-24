import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortField, setSortField] = useState(''); // price, rating
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [loading, setLoading] = useState(true);
  const debounceTimer = useRef(null);

  // Categories — loaded dynamically from product list
  const [categories, setCategories] = useState(['All', 'Sneakers', 'Running', 'Limited Edition', 'Casual', 'Lifestyle', 'Training']);

  useEffect(() => {
    api.products.list().then(data => {
      if (data && data.length > 0) {
        setCategories(['All', ...new Set(data.map(p => p.category))]);
      }
    }).catch(() => {}); // keep default categories on error
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let data = [];
      if (searchQuery.trim() !== '') {
        data = await api.products.search(searchQuery);
      } else if (sortField !== '') {
        data = await api.products.sort(sortField, sortOrder);
      } else {
        data = await api.products.list(selectedCategory === 'All' ? '' : selectedCategory);
      }

      // Filter by category client-side if a category is selected and we are in search/sort mode
      if (selectedCategory && selectedCategory !== 'All' && (searchQuery.trim() !== '' || sortField !== '')) {
        data = data.filter(p => p.category === selectedCategory);
      }

      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when category, sortField, or sortOrder changes
  useEffect(() => {
    if (searchQuery === '') {
      fetchProducts();
    }
  }, [selectedCategory, sortField, sortOrder]);

  // Debounced search trigger
  useEffect(() => {
    if (searchQuery !== '') {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        // Reset sort dropdowns during search to avoid clash
        setSortField('');
        fetchProducts();
      }, 500);
    } else {
      fetchProducts();
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSortField('');
    setSortOrder('asc');
    setSelectedCategory('All');
  };

  return (
    <div className="app-container" style={{ paddingBottom: '80px', position: 'relative' }}>

      {/* Page Header */}
      <header style={{ marginBottom: '32px', marginTop: '16px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '800' }}>
          SOLEFORCE RELEASE VAULT
        </span>
        <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-0.02em', marginTop: '4px', textTransform: 'uppercase' }}>
          ALL RELEASES
        </h1>
      </header>

      {/* Filter and Search Panel */}
      <section className="glass-panel" style={filterPanelStyle}>
        
        {/* Search Input */}
        <div style={searchWrapperStyle}>
          <Search size={16} color="var(--text-muted)" style={searchIconStyle} />
          <input 
            type="text" 
            placeholder="Search sneakers (e.g. Jordan, Yeezy, Nike)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInputStyle}
            className="shop-search-input"
          />
        </div>

        {/* Sorting Dropdowns */}
        <div style={controlsWrapperStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>SORT:</span>
          </div>

          <select 
            value={sortField} 
            onChange={(e) => setSortField(e.target.value)}
            style={selectStyle}
          >
            <option value="">Default (None)</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>

          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            style={selectStyle}
            disabled={!sortField}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          <button onClick={handleResetFilters} style={resetBtnStyle} title="Reset All Filters">
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </section>


      {/* Category Tabs */}
      <section style={tabsWrapperStyle}>
        {categories.map(cat => {
          const isSelected = selectedCategory === cat || (cat === 'All' && !selectedCategory);
          return (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className="tab-hover-style"
              style={{
                ...tabStyle,
                ...(isSelected ? activeTabStyle : {})
              }}
            >
              {cat}
            </button>
          );
        })}
      </section>

      {/* Products Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.05em' }} className="animate-pulse-glow">
            RETRIEVING INVENTORY...
          </span>
        </div>
      ) : products.length === 0 ? (
        <div style={emptyStateStyle} className="glass-panel">
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>No Drops Match Your Search</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            Try adjusting your spelling or searching for a different brand.
          </p>
          <button className="btn-neon-pink" onClick={handleResetFilters} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '13px' }}>
            View Full Inventory
          </button>
        </div>
      ) : (
        <main className="grid-products">
          {products.map(product => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </main>
      )}

      <style>{`
        .tab-hover-style {
          transition: var(--transition-fast) !important;
        }
        .tab-hover-style:hover {
          border-color: rgba(0, 0, 0, 0.15) !important;
          color: var(--text-main) !important;
        }
        .shop-search-input:focus {
          border-color: var(--accent-orange) !important;
          background-color: var(--bg-primary) !important;
        }
      `}</style>
    </div>
  );
}

// Styling definitions
const filterPanelStyle = {
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '16px',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  border: '1px solid var(--border-light)',
  boxShadow: 'var(--shadow-subtle)'
};

const searchWrapperStyle = {
  position: 'relative',
  flex: '1 1 360px'
};

const searchIconStyle = {
  position: 'absolute',
  top: '50%',
  left: '14px',
  transform: 'translateY(-50%)',
  pointerEvents: 'none'
};

const searchInputStyle = {
  width: '100%',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-light)',
  borderRadius: '8px',
  padding: '10px 14px 10px 40px',
  color: 'var(--text-main)',
  fontSize: '14px',
  outline: 'none',
  transition: 'var(--transition-fast)'
};

const controlsWrapperStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap'
};

const selectStyle = {
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-light)',
  color: 'var(--text-main)',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
  cursor: 'pointer',
  minWidth: '110px'
};

const resetBtnStyle = {
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-light)',
  color: 'var(--text-main)',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '13px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  transition: 'var(--transition-fast)'
};

const tabsWrapperStyle = {
  display: 'flex',
  gap: '10px',
  overflowX: 'auto',
  paddingBottom: '8px',
  marginBottom: '28px'
};

const tabStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-light)',
  color: 'var(--text-muted)',
  padding: '8px 18px',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600',
  letterSpacing: '-0.01em',
  whiteSpace: 'nowrap'
};

const activeTabStyle = {
  border: '1px solid var(--bg-dark)',
  color: 'var(--text-light)',
  background: 'var(--bg-dark)'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '48px 32px',
  border: '1px solid var(--border-light)',
  borderRadius: '12px',
  backgroundColor: 'var(--bg-primary)'
};
