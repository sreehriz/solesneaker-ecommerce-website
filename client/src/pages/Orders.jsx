import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Package, MapPin, ChevronDown, ChevronUp, Zap, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../utils/format';

const STATUS_COLORS = {
  Pending:   { color: 'var(--neon-pink)',   bg: 'rgba(255,0,127,0.08)',   border: 'rgba(255,0,127,0.25)' },
  Shipped:   { color: 'var(--neon-cyan)',   bg: 'rgba(0,243,255,0.08)',   border: 'rgba(0,243,255,0.25)' },
  Delivered: { color: 'var(--neon-lime)',   bg: 'rgba(57,255,20,0.08)',   border: 'rgba(57,255,20,0.25)' },
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.orders.list()
      .then(data => setOrders(data))
      .catch(err => console.error('Orders fetch error:', err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="app-container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Orders Locked</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Please log in to view your order history.</p>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button className="btn-neon-cyan" style={{ marginTop: '20px' }}>Login</button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-container flex-center" style={{ minHeight: '60vh' }}>
        <span className="gradient-text-pink-cyan animate-pulse-glow" style={{ fontSize: '20px', fontWeight: '700' }}>
          Fetching Order Ledger...
        </span>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ paddingBottom: '80px', position: 'relative' }}>
      <div className="neon-glow-bg-left"></div>
      <div className="neon-glow-bg-right"></div>

      <header style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          SHIPMENT LEDGER
        </span>
        <h1 style={{ fontSize: '40px', fontWeight: '800', marginTop: '5px' }}>MY ORDERS</h1>
      </header>

      {orders.length === 0 ? (
        <section className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <ShoppingBag size={48} color="var(--text-muted)" style={{ marginBottom: '15px' }} />
          <h3>No orders yet.</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Complete a checkout to see your orders here.</p>
          <Link to="/shop" style={{ textDecoration: 'none' }}>
            <button className="btn-neon-pink" style={{ marginTop: '20px' }}>Browse the Vault</button>
          </Link>
        </section>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => {
            const status = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
            const isExpanded = expandedId === (order._id || order.id);
            const date = new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric'
            });

            return (
              <div key={order._id || order.id} className="glass-panel" style={{ border: '1px solid var(--border-glass)', borderRadius: '16px', overflow: 'hidden' }}>
                {/* Order Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : (order._id || order.id))}
                  style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', padding: '20px 24px', cursor: 'pointer' }}
                >
                  <div style={{ flex: '0 0 auto' }}>
                    <Package size={22} color="var(--neon-cyan)" />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Order ID</span>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '14px', marginTop: '2px' }}>
                      #{(order._id || order.id).toString().toUpperCase().slice(-8)}
                    </div>
                  </div>
                  <div style={{ flex: '1 1 120px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date</span>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '2px' }}>{date}</div>
                  </div>
                  <div style={{ flex: '1 1 120px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</span>
                    <div className="gradient-text-pink-cyan" style={{ fontSize: '18px', fontWeight: '800', marginTop: '2px' }}>
                      {formatPrice(order.totalAmount)}
                    </div>
                  </div>
                  <div style={{ flex: '0 0 auto' }}>
                    <span style={{
                      background: status.bg,
                      color: status.color,
                      border: `1px solid ${status.border}`,
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      letterSpacing: '0.04em'
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border-glass)', padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '30px' }}>

                    {/* Items List */}
                    <div style={{ flex: '1 1 300px' }}>
                      <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                        Items ({order.items.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)',
                            borderRadius: '10px', padding: '10px 14px'
                          }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '700' }}>{item.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                Size US {item.size} · Qty {item.quantity}
                              </div>
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dijkstra Route Visualization */}
                    <div style={{ flex: '1 1 260px' }}>
                      <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={13} color="var(--neon-cyan)" /> Dijkstra Delivery Route
                      </h4>
                      <div style={{ background: 'rgba(0,243,255,0.03)', border: '1px solid rgba(0,243,255,0.15)', borderRadius: '12px', padding: '16px' }}>
                        {/* Route Node Chain */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                          {order.deliveryRoute.map((node, i) => (
                            <React.Fragment key={i}>
                              <span style={{
                                background: i === 0 ? 'rgba(255,0,127,0.12)' : i === order.deliveryRoute.length - 1 ? 'rgba(0,243,255,0.12)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${i === 0 ? 'rgba(255,0,127,0.3)' : i === order.deliveryRoute.length - 1 ? 'rgba(0,243,255,0.3)' : 'var(--border-glass)'}`,
                                color: i === 0 ? 'var(--neon-pink)' : i === order.deliveryRoute.length - 1 ? 'var(--neon-cyan)' : 'var(--text-main)',
                                fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px'
                              }}>
                                {node}
                              </span>
                              {i < order.deliveryRoute.length - 1 && (
                                <span style={{ color: 'var(--neon-cyan)', fontSize: '14px', fontWeight: '700' }}>→</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-glass)', paddingTop: '10px' }}>
                          <span>Shipping Address</span>
                          <strong style={{ color: 'var(--text-main)' }}>{order.shippingAddress}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          <span>Shipping Cost</span>
                          <strong style={{ color: 'var(--text-main)' }}>{formatPrice(order.shippingCost)}</strong>
                        </div>
                      </div>

                      {/* Huffman Compression Badge */}
                      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(157,0,255,0.05)', border: '1px solid rgba(157,0,255,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
                        <Zap size={14} color="var(--neon-purple)" />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Invoice compressed via <strong style={{ color: 'var(--neon-purple)' }}>Huffman Coding</strong> before storage
                        </span>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
