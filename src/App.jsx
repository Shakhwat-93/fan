import React, { useState, useEffect } from 'react';
import './App.css';

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================
const SUPABASE_URL = "https://brgyyxaenljlqbgszksz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZ3l5eGFlbmxqbHFiZ3N6a3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzMxNTAsImV4cCI6MjA5NjUwOTE1MH0.z5zOVc60mk0wbZq_rahCmh3nDgbSFmeovj1VeToIw6s";

// Passcode for Admin Panel
const ADMIN_PASSCODE = "admin123";

// Format numbers in a clean, readable English style
const toBanglaDigits = (num) => {
  if (num === null || num === undefined) return '';
  const str = num.toString().trim();
  if (str !== '' && !isNaN(str)) {
    return Number(str).toLocaleString('en-US');
  }
  return str;
};

function App() {
  // ==========================================
  // DYNAMIC PRODUCT STATES (FROM SUPABASE)
  // ==========================================
  const [productName, setProductName] = useState('Defender 2916 Table Fan (16 Inch)');
  const [unitPrice, setUnitPrice] = useState(4500);
  const [originalPrice, setOriginalPrice] = useState(5500);
  const [productImages, setProductImages] = useState([
    '/img/fan_1.webp',
    '/img/fan_2.webp',
    '/img/fan_3.webp'
  ]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  // Hero Section Display State
  const [heroImg, setHeroImg] = useState('/img/fan_1.webp');

  // Showcase Carousel Slide Index
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Landing Page Order / Cart States
  const [quantity, setQuantity] = useState(1);
  const [shippingCharge, setShippingCharge] = useState(80);
  const [deliveryArea, setDeliveryArea] = useState('inside');

  // Checkout Form Field States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Order Success Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // ==========================================
  // VIEW ROUTING STATE
  // ==========================================
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'admin-login' | 'admin'
  const [adminPasscode, setAdminPasscode] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAdminAuthenticated') === 'true';
  });

  // ==========================================
  // ADMIN PANEL STATES
  // ==========================================
  const [adminTab, setAdminTab] = useState('orders'); // 'orders' | 'product' | 'images'
  const [ordersList, setOrdersList] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Admin Product Form Edit States
  const [editProductName, setEditProductName] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState(4500);
  const [editOriginalPrice, setEditOriginalPrice] = useState(5500);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);

  // Admin Image Edit States
  const [editImage1, setEditImage1] = useState('');
  const [editImage2, setEditImage2] = useState('');
  const [editImage3, setEditImage3] = useState('');
  const [isUpdatingImages, setIsUpdatingImages] = useState(false);

  // ==========================================
  // EFFECTS / LOAD ON MOUNT
  // ==========================================
  useEffect(() => {
    // 1. Fetch product settings
    fetchProductDetails();

    // 2. Check URL for Admin route
    const handleUrlRoute = () => {
      const params = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname.toLowerCase().replace(/\/$/, "");
      if (params.has('admin') || window.location.hash === '#admin' || pathname === '/admin') {
        const authenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
        setCurrentView(authenticated ? 'admin' : 'admin-login');
      } else {
        setCurrentView('landing');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);

    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  // Fetch product data from Supabase
  const fetchProductDetails = async () => {
    setIsLoadingProduct(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.defender-2916`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch product details.');
      const data = await response.json();
      
      if (data && data.length > 0) {
        const prod = data[0];
        setProductName(prod.name);
        setUnitPrice(Number(prod.price));
        setOriginalPrice(Number(prod.original_price));
        if (prod.images && prod.images.length > 0) {
          setProductImages(prod.images);
          setHeroImg(prod.images[0]);
          
          // Set edit fields
          setEditProductName(prod.name);
          setEditUnitPrice(Number(prod.price));
          setEditOriginalPrice(Number(prod.original_price));
          setEditImage1(prod.images[0] || '');
          setEditImage2(prod.images[1] || '');
          setEditImage3(prod.images[2] || '');
        }
      }
    } catch (error) {
      console.error('Error loading product details:', error);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  // Fetch orders list (Admin only)
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders.');
      const data = await response.json();
      setOrdersList(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('অর্ডারসমূহ লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Load orders when admin view or orders tab changes
  useEffect(() => {
    if (currentView === 'admin' && adminTab === 'orders') {
      fetchOrders();
    }
  }, [currentView, adminTab]);

  // ==========================================
  // CAROUSEL & SLIDER LOGIC
  // ==========================================
  const nextSlide = () => {
    setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % productImages.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prevIndex) => (prevIndex - 1 + productImages.length) % productImages.length);
  };

  // ==========================================
  // ACCORDION TOGGLE
  // ==========================================
  const toggleFaq = (index) => {
    setOpenFaqIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  // ==========================================
  // QUANTITY & INVOICE MANAGEMENT
  // ==========================================
  const handleQtyChange = (val) => {
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= 10) {
      setQuantity(newQty);
    }
  };

  const handleAreaChange = (area) => {
    setDeliveryArea(area);
    setShippingCharge(area === 'inside' ? 80 : 150);
  };

  const totalPrice = (unitPrice * quantity) + shippingCharge;

  // ==========================================
  // SUBMIT ORDER (LANDING PAGE)
  // ==========================================
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    const name = customerName.trim();
    const phone = customerPhone.trim();
    const address = customerAddress.trim();
    const areaLabel = deliveryArea === 'inside' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে';

    if (!name || !phone || !address) {
      alert('অনুগ্রহ করে সব তথ্য পূরণ করুন।');
      return;
    }

    if (phone.length !== 11) {
      alert('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const generatedOrderId = 'MZ-' + Math.floor(100000 + Math.random() * 900000);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          name: name,
          phone: phone,
          address: address,
          delivery_area: areaLabel,
          shipping_charge: shippingCharge,
          total_price: totalPrice,
          product_name: productName,
          quantity: quantity,
          status: 'pending',
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'অর্ডার করতে ব্যর্থ হয়েছে।');
      }

      setPlacedOrder({
        id: generatedOrderId,
        name: name,
        phone: phone,
        address: address,
        quantity: quantity,
        total_price: totalPrice,
      });

      setShowSuccessModal(true);

      // Reset Form and States
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setQuantity(1);
      setDeliveryArea('inside');
      setShippingCharge(80);

    } catch (error) {
      console.error('Order error:', error);
      alert('দুঃখিত, কোনো একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন। ত্রুটি: ' + error.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // ==========================================
  // ADMIN PANEL METHODS
  // ==========================================
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPasscode === ADMIN_PASSCODE) {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      setIsAdminAuthenticated(true);
      setCurrentView('admin');
      setAdminPasscode('');
      window.history.pushState({}, '', '/admin');
    } else {
      alert('ভুল পাসকোড! অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    setIsAdminAuthenticated(false);
    setCurrentView('landing');
    window.history.pushState({}, '', '/');
  };

  // Change Order Status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status.');
      
      // Update local orders list state
      setOrdersList((prevList) =>
        prevList.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  // Update Product details in Supabase
  const handleProductUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProduct(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.defender-2916`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editProductName,
          price: editUnitPrice,
          original_price: editOriginalPrice
        })
      });
      if (!response.ok) throw new Error('Failed to update product settings.');
      
      // Update landing page states
      setProductName(editProductName);
      setUnitPrice(Number(editUnitPrice));
      setOriginalPrice(Number(editOriginalPrice));
      alert('প্রোডাক্ট সেটিংস সফলভাবে আপডেট করা হয়েছে!');
    } catch (error) {
      console.error('Product update error:', error);
      alert('সেটিংস আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  // Update images list in Supabase
  const handleImagesUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingImages(true);
    try {
      const updatedImages = [editImage1.trim(), editImage2.trim(), editImage3.trim()].filter(Boolean);
      
      if (updatedImages.length === 0) {
        alert('অনুগ্রহ করে অন্তত 1টি ছবির লিংক দিন।');
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.defender-2916`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ images: updatedImages })
      });
      if (!response.ok) throw new Error('Failed to update product images.');

      setProductImages(updatedImages);
      setHeroImg(updatedImages[0]);
      alert('ছবিগুলো সফলভাবে আপডেট করা হয়েছে!');
    } catch (error) {
      console.error('Images update error:', error);
      alert('ছবি আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setIsUpdatingImages(false);
    }
  };

  // Stats calculations
  const totalOrders = ordersList.length;
  const pendingOrders = ordersList.filter(o => o.status === 'pending').length;
  const totalSales = ordersList
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + Number(o.total_price), 0);

  // Filter and search orders list
  const filteredOrders = ordersList.filter((order) => {
    const matchesSearch = 
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.phone.includes(searchQuery);
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && order.status === statusFilter;
  });

  // ==========================================
  // RENDER VIEW: ADMIN LOGIN
  // ==========================================
  if (currentView === 'admin-login') {
    return (
      <div className="admin-login-overlay">
        <div className="admin-login-box">
          <h2>অ্যাডমিন লগইন</h2>
          <p>অ্যাডমিন প্যানেল এক্সেস করতে পাসকোডটি প্রবেশ করান</p>
          <form onSubmit={handleAdminLogin}>
            <input 
              type="password" 
              placeholder="পাসকোড দিন" 
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              required
              autoFocus
            />
            <button type="submit" className="cta-button primary-cta ripple">লগইন করুন</button>
          </form>
          <button 
            type="button" 
            className="cta-button secondary-cta" 
            style={{ marginTop: '16px', width: '100%' }}
            onClick={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('landing');
            }}
          >
            ওয়েবসাইটে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER VIEW: ADMIN DASHBOARD
  // ==========================================
  if (currentView === 'admin' && isAdminAuthenticated) {
    return (
      <div className="admin-layout">
        <div className="container">
          <div className="admin-header">
            <h1>MorshedZone <span>অ্যাডমিন ড্যাশবোর্ড</span></h1>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="cta-button secondary-cta" 
                onClick={() => {
                  window.history.pushState({}, '', '/');
                  setCurrentView('landing');
                }}
              >
                ওয়েবসাইট দেখুন
              </button>
              <button 
                className="cta-button primary-cta" 
                style={{ backgroundColor: '#dc2626', boxShadow: 'none' }}
                onClick={handleAdminLogout}
              >
                লগআউট
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="admin-stats-grid">
            <div className="admin-card">
              <h4>সর্বমোট অর্ডার</h4>
              <div className="stat-value">{toBanglaDigits(totalOrders)} টি</div>
            </div>
            <div className="admin-card">
              <h4>পেন্ডিং অর্ডার</h4>
              <div className="stat-value accent">{toBanglaDigits(pendingOrders)} টি</div>
            </div>
            <div className="admin-card">
              <h4>সর্বমোট বিক্রি (বাতিল বাদে)</h4>
              <div className="stat-value secondary">৳{toBanglaDigits(totalSales)}</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="admin-tabs">
            <button 
              className={`admin-tab-btn ${adminTab === 'orders' ? 'active' : ''}`}
              onClick={() => setAdminTab('orders')}
            >
              📦 অর্ডার তালিকা
            </button>
            <button 
              className={`admin-tab-btn ${adminTab === 'product' ? 'active' : ''}`}
              onClick={() => setAdminTab('product')}
            >
              🏷️ প্রোডাক্ট সেটিংস
            </button>
            <button 
              className={`admin-tab-btn ${adminTab === 'images' ? 'active' : ''}`}
              onClick={() => setAdminTab('images')}
            >
              🖼️ ইমেজ সেটিংস
            </button>
          </div>

          {/* Tab Content: Orders */}
          {adminTab === 'orders' && (
            <div className="admin-panel-content">
              <div className="admin-filters-row">
                <div className="search-input-wrapper">
                  <input 
                    type="text" 
                    placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">সব অর্ডার</option>
                  <option value="pending">পেন্ডিং</option>
                  <option value="confirmed">কনফার্মড</option>
                  <option value="shipped">ডেলিভারড</option>
                  <option value="cancelled">বাতিল</option>
                </select>
              </div>

              {isLoadingOrders ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>অর্ডার তালিকা লোড হচ্ছে...</div>
              ) : filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>কোনো অর্ডার পাওয়া যায়নি।</div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>তারিখ</th>
                        <th>গ্রাহকের বিবরণ</th>
                        <th>ঠিকানা</th>
                        <th>পরিমাণ ও প্রদেয় মূল্য</th>
                        <th>স্ট্যাটাস</th>
                        <th>অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontSize: '0.85rem' }}>
                            {new Date(order.created_at).toLocaleString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </td>
                          <td>
                            <strong>{order.name}</strong>
                            <br />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📞 {order.phone}</span>
                          </td>
                          <td style={{ fontSize: '0.85rem', maxWidth: '200px', whiteSpace: 'normal' }}>
                            {order.address}
                            <br />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)' }}>({order.delivery_area})</span>
                          </td>
                          <td>
                            {toBanglaDigits(order.quantity)} টি ফ্যান
                            <br />
                            <strong>৳{toBanglaDigits(order.total_price)}</strong>
                          </td>
                          <td>
                            <span className={`status-badge ${order.status}`}>
                              {order.status === 'pending' && 'পেন্ডিং'}
                              {order.status === 'confirmed' && 'কনফার্মড'}
                              {order.status === 'shipped' && 'ডেলিভারড'}
                              {order.status === 'cancelled' && 'বাতিল'}
                            </span>
                          </td>
                          <td>
                            <select 
                              className="action-select"
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            >
                              <option value="pending">পেন্ডিং</option>
                              <option value="confirmed">কনফার্মড</option>
                              <option value="shipped">ডেলিভারড</option>
                              <option value="cancelled">বাতিল</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Product Settings */}
          {adminTab === 'product' && (
            <div className="admin-panel-content">
              <h3 style={{ marginBottom: '24px', fontWeight: 800 }}>প্রোডাক্ট ইনফরমেশন এডিট করুন</h3>
              <form onSubmit={handleProductUpdate}>
                <div className="admin-form-group">
                  <label>প্রোডাক্ট নাম</label>
                  <input 
                    type="text" 
                    value={editProductName} 
                    onChange={(e) => setEditProductName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="admin-form-group">
                  <label>বিক্রয় মূল্য (বর্তমান মূল্য)</label>
                  <input 
                    type="number" 
                    value={editUnitPrice} 
                    onChange={(e) => setEditUnitPrice(e.target.value)} 
                    required 
                  />
                </div>
                <div className="admin-form-group">
                  <label>আগের মূল্য (Regular Price - যা কাটা দেখাবে)</label>
                  <input 
                    type="number" 
                    value={editOriginalPrice} 
                    onChange={(e) => setEditOriginalPrice(e.target.value)} 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  className="cta-button primary-cta ripple"
                  disabled={isUpdatingProduct}
                >
                  {isUpdatingProduct ? 'আপডেট হচ্ছে...' : 'সেটিংস সেভ করুন'}
                </button>
              </form>
            </div>
          )}

          {/* Tab Content: Image Settings */}
          {adminTab === 'images' && (
            <div className="admin-panel-content">
              <h3 style={{ marginBottom: '24px', fontWeight: 800 }}>ল্যান্ডিং পেজের ছবিসমূহ পরিবর্তন করুন</h3>
              <form onSubmit={handleImagesUpdate}>
                <div className="image-edit-grid">
                  <div className="image-edit-card">
                    <div className="image-edit-preview">
                      <img src={editImage1 || '/img/fan_1.webp'} alt="Preview 1" />
                    </div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>ইমেজ ১ (প্রধান ছবি)</label>
                    <input 
                      type="text" 
                      value={editImage1} 
                      onChange={(e) => setEditImage1(e.target.value)}
                      placeholder="ছবির পাথ বা URL দিন" 
                      required 
                    />
                  </div>
                  
                  <div className="image-edit-card">
                    <div className="image-edit-preview">
                      <img src={editImage2 || '/img/fan_2.webp'} alt="Preview 2" />
                    </div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>ইমেজ ২</label>
                    <input 
                      type="text" 
                      value={editImage2} 
                      onChange={(e) => setEditImage2(e.target.value)}
                      placeholder="ছবির পাথ বা URL দিন" 
                    />
                  </div>

                  <div className="image-edit-card">
                    <div className="image-edit-preview">
                      <img src={editImage3 || '/img/fan_3.webp'} alt="Preview 3" />
                    </div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>ইমেজ ৩</label>
                    <input 
                      type="text" 
                      value={editImage3} 
                      onChange={(e) => setEditImage3(e.target.value)}
                      placeholder="ছবির পাথ বা URL দিন" 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="cta-button primary-cta ripple"
                  disabled={isUpdatingImages}
                >
                  {isUpdatingImages ? 'আপডেট হচ্ছে...' : 'ছবিসমূহ সেভ করুন'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER VIEW: MAIN LANDING PAGE
  // ==========================================
  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <p>⚡ আজকের অফারে সীমিত সময়ের জন্য ফ্রি ডেলিভারি ও আকর্ষণীয় ডিসকাউন্ট! ⚡</p>
      </div>

      {/* Header Section */}
      <header className="main-header">
        <div className="container header-container">
          <a href="#" className="logo">
            <span className="logo-accent">Morshed</span>Zone
          </a>
          <nav className="nav-menu">
            <a href="#features" className="nav-link">ফিচারসমূহ</a>
            <a href="#gallery" className="nav-link">গ্যালারি</a>
            <a href="#faq" className="nav-link">প্রশ্নোত্তর</a>
            <a href="#reviews" className="nav-link">রিভিউ</a>
          </nav>
          <a href="#order-section" className="cta-button header-cta">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            অর্ডার করুন
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="badge-promo">1 বছরের সার্ভিস ওয়ারেন্টি</div>
            <h1 className="hero-title">গরমের তীব্রতায় স্বস্তির নিশ্চয়তা! <br /><span>{productName}</span></h1>
            <p className="hero-description">
              বিদ্যুৎ চলে গেলেও বাতাস থামবে না! 16 ইঞ্চির শক্তিশালী 5 ব্লেড ফ্যান ও 4.5 অ্যাম্পিয়ার ব্যাটারির দুর্দান্ত ব্যাকআপ নিয়ে এলো ডিফেন্ডার রিচার্জেবল টেবিল ফ্যান।
            </p>
            
            <div className="price-container">
              <div className="price-tag">
                <span className="discount-price">৳{toBanglaDigits(unitPrice)}</span>
                <span className="original-price">৳{toBanglaDigits(originalPrice)}</span>
              </div>
              <span className="save-tag">৳{toBanglaDigits(originalPrice - unitPrice)} ছাড়!</span>
            </div>

            <div className="hero-trust-points">
              <div className="trust-item">
                <svg className="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                সারাদেশে ক্যাশ অন ডেলিভারি
              </div>
              <div className="trust-item">
                <svg className="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                পণ্য হাতে পেয়ে টাকা পরিশোধ
              </div>
            </div>

            <div className="hero-buttons">
              <a href="#order-section" className="cta-button primary-cta ripple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                সরাসরি অর্ডার করুন
              </a>
              <a href="#features" className="cta-button secondary-cta">
                বিস্তারিত জানুন
              </a>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="main-image-wrapper">
              <img id="main-product-img" src={heroImg} alt={productName} className="hero-img" />
            </div>
            <div className="thumbnail-grid">
              {productImages.map((imgUrl, i) => (
                <img 
                  key={i}
                  src={imgUrl} 
                  alt={`Fan View ${i + 1}`} 
                  className={`thumb-img ${heroImg === imgUrl ? 'active' : ''}`}
                  onClick={() => setHeroImg(imgUrl)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="highlights-section">
        <div className="container highlight-container">
          <div className="highlight-card">
            <div className="highlight-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M12 2v9" />
                <path d="M8 5h8" />
              </svg>
            </div>
            <h3>12 মাসের ওয়ারেন্টি</h3>
            <p>সম্পূর্ণ 1 বছর মেকানিক্যাল ও ইলেকট্রিকাল পার্টস সার্ভিস ওয়ারেন্টি</p>
          </div>
          <div className="highlight-card">
            <div className="highlight-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <h3>অরিজিনাল পণ্য</h3>
            <p>মেড ইন চায়না, ডিফেন্ডার ব্র্যান্ডের 100% অরিজিনাল রিচার্জেবল ফ্যান</p>
          </div>
          <div className="highlight-card">
            <div className="highlight-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h3>দ্রুত ডেলিভারি</h3>
            <p>ঢাকার মধ্যে 48 ঘণ্টা ও ঢাকার বাইরে 3-5 দিনে ক্যাশ অন ডেলিভারি</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="sub-title">⚙️ অনন্য কারিগরি বৈশিষ্ট্য</span>
            <h2 className="section-title">কেন Defender 2916 ফ্যানটি সেরা?</h2>
            <div className="title-divider"></div>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-head">
                <div className="feat-icon">🔌</div>
                <h3>Dual AC/DC Operation</h3>
              </div>
              <p>ফ্যানটি 220 ভোল্ট ওয়াল পাওয়ারে চালনা করার সাথে সাথে এর 12 ভোল্ট ইন্টারনাল ব্যাটারি অটো চার্জ হতে থাকে। বিদ্যুৎ চলে গেলেও ফ্যানটি বন্ধ হবে না, স্বয়ংক্রিয়ভাবে ব্যাটারি মোডে চলতে থাকবে।</p>
            </div>

            <div className="feature-card">
              <div className="feature-head">
                <div className="feat-icon">🔋</div>
                <h3>Overcharge Protection</h3>
              </div>
              <p>এতে রয়েছে অটোমেটিক কারেন্ট কাট অফ সিস্টেম। ব্যাটারি ফুল চার্জ হয়ে গেলে চার্জিং স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যায়। এর ফলে ওভারচার্জিংয়ের ভয় থাকে না এবং ব্যাটারির স্থায়িত্ব বহুগুণ বেড়ে যায়।</p>
            </div>

            <div className="feature-card">
              <div className="feature-head">
                <div className="feat-icon">💡</div>
                <h3>8-SMD ব্রাইট LED লাইট</h3>
              </div>
              <p>লোডশেডিংয়ের অন্ধকারে ঘরের আলোর বিকল্প হিসেবে এতে বিল্ট-ইন 8টি শক্তিশালী এলইডি লাইট রয়েছে। লো স্পিডে এই লাইট সর্বোচ্চ 150 ঘণ্টা পর্যন্ত একটানা আলো দিতে সক্ষম।</p>
            </div>

            <div className="feature-card">
              <div className="feature-head">
                <div className="feat-icon">🌪️</div>
                <h3>1250 RPM শক্তিশালী মোটর</h3>
              </div>
              <p>16 ইঞ্চির 5টি পাখা (5-blade) ও হাই-স্পিড মোটরের সমন্বয়ে এটি সর্বোচ্চ 1250 আরপিএম গতিতে বাতাস ছড়ায়, যা একটি বড় রুমেও পর্যাপ্ত বাতাস প্রবাহের নিশ্চয়তা দেয়।</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Review Section */}
      <section className="video-section">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="sub-title">🎥 লাইভ ভিডিও রিভিউ</span>
            <h2 className="section-title">সরাসরি দেখুন ডিফেন্ডার ফ্যানটি</h2>
            <div className="title-divider"></div>
          </div>
          
          <div className="video-container-wrapper">
            <iframe 
              src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1521353123002765%2F&show_text=false&width=267&t=0" 
              width="100%" 
              height="100%" 
              style={{ border: 'none', overflow: 'hidden' }} 
              scrolling="no" 
              frameBorder="0" 
              allowFullScreen={true} 
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>
          
          <p className="video-caption">
            * ভিডিওতে ফ্যানটির রিয়েল লুক এবং চমৎকার বাতাস প্রবাহ সরাসরি দেখুন।
          </p>
        </div>
      </section>

      {/* Gallery Carousel Section */}
      <section id="gallery" className="gallery-section">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="sub-title">📸 প্রোডাক্ট গ্যালারি</span>
            <h2 className="section-title">ডিফেন্ডার টেবিল ফ্যানের বাস্তব ছবি</h2>
            <div className="title-divider"></div>
          </div>

          <div className="gallery-wrapper">
            <div className="gallery-slider">
              {productImages.map((slide, index) => (
                <div 
                  key={index} 
                  className={`slide-item ${currentSlideIndex === index ? 'active' : ''}`}
                >
                  <img src={slide} alt={`Defender Fan Showcase ${index + 1}`} />
                </div>
              ))}
            </div>
            
            <button className="slider-btn prev-btn" onClick={prevSlide}>❮</button>
            <button className="slider-btn next-btn" onClick={nextSlide}>❯</button>
            
            <div className="dot-indicators">
              {productImages.map((_, index) => (
                <span 
                  key={index}
                  className={`dot ${currentSlideIndex === index ? 'active' : ''}`} 
                  onClick={() => setCurrentSlideIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section className="specs-section">
        <div className="container spec-container">
          <div className="specs-content">
            <div className="section-title-wrapper left-align">
              <span className="sub-title">📊 টেকনিক্যাল স্পেসিফিকেশন</span>
              <h2 className="section-title">সব ফিচার এক নজরে</h2>
            </div>
            <table className="specs-table">
              <tbody>
                <tr>
                  <td className="spec-label">মডেল নাম</td>
                  <td className="spec-value">Defender 2916 Rechargeable Table Fan</td>
                </tr>
                <tr>
                  <td className="spec-label">পাখার সাইজ</td>
                  <td className="spec-value">16 ইঞ্চি (16 Inch)</td>
                </tr>
                <tr>
                  <td className="spec-label">ব্লেড সংখ্যা</td>
                  <td className="spec-value">5 ব্লেড বিশিষ্ট শক্তিশালী সিস্টেম</td>
                </tr>
                <tr>
                  <td className="spec-label">মোটর স্পিড</td>
                  <td className="spec-value">1250 RPM (হাই স্পিড মোটর)</td>
                </tr>
                <tr>
                  <td className="spec-label">ব্যাটারি ক্যাপাসিটি</td>
                  <td className="spec-value">6V 4.5Ah শক্তিশালী রিচার্জেবল ব্যাটারি</td>
                </tr>
                <tr>
                  <td className="spec-label">ইনপুট ভোল্টেজ</td>
                  <td className="spec-value">AC 220V - 50Hz / DC 12V চার্জিং পাওয়ার</td>
                </tr>
                <tr>
                  <td className="spec-label">ওয়ারেন্টি</td>
                  <td className="spec-value">12 মাস (1 বছর) সার্ভিস ওয়ারেন্টি</td>
                </tr>
                <tr>
                  <td className="spec-label">উৎস দেশ</td>
                  <td className="spec-value">চায়না (China)</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="specs-card">
            <h3>ব্যাটারি ব্যাকআপ টাইম</h3>
            <div className="backup-level">
              <div className="backup-info">
                <span>লো স্পিড (Low Speed)</span>
                <strong>12 ঘণ্টা ব্যাকআপ</strong>
              </div>
              <div className="progress-bar"><div className="progress-fill low" style={{ width: '100%' }}></div></div>
            </div>
            <div className="backup-level">
              <div className="backup-info">
                <span>মিডিয়াম স্পিড (Medium Speed)</span>
                <strong>6-8 ঘণ্টা ব্যাকআপ</strong>
              </div>
              <div className="progress-bar"><div className="progress-fill med" style={{ width: '65%' }}></div></div>
            </div>
            <div className="backup-level">
              <div className="backup-info">
                <span>হাই স্পিড (High Speed)</span>
                <strong>3-4 ঘণ্টা ব্যাকআপ</strong>
              </div>
              <div className="progress-bar"><div className="progress-fill high" style={{ width: '33%' }}></div></div>
            </div>
            <div className="backup-note">
              * LED লাইট শুধু ব্যবহার করলে এটি সর্বোচ্চ 150 ঘণ্টা একটানা ব্যাকআপ দিতে পারে।
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="sub-title">❓ সাধারণ প্রশ্নাবলী</span>
            <h2 className="section-title">কাস্টমারদের সচরাচর জিজ্ঞাসা</h2>
            <div className="title-divider"></div>
          </div>

          <div className="faq-container">
            {[
              {
                q: "ফ্যানের ব্যাটারি ফুল চার্জ হতে কত সময় নেয় এবং ব্যাকআপ কেমন দেয়?",
                a: "ফ্যানটির ব্যাটারি সম্পূর্ণ চার্জ হতে সাধারণত 6 থেকে 8 ঘণ্টা সময় নেয়। চার্জ হয়ে গেলে এতে বিল্ট-ইন ওভারচার্জ প্রটেকশন থাকায় কারেন্ট অটোমেটিক বন্ধ হয়ে যায়। স্পিড সেটিং অনুযায়ী এটি 3 থেকে 12 ঘণ্টা পর্যন্ত রানিং ব্যাকআপ দেয়। হাই স্পিডে 3-4 ঘণ্টা এবং লো স্পিডে 12 ঘণ্টা বাতাস উপভোগ করতে পারবেন।"
              },
              {
                q: "ফ্যানটি কি সরাসরি কারেন্টে প্লাগ করে চালানো যাবে?",
                a: "হ্যাঁ, অবশ্যই! এটি সরাসরি এসি কারেন্টে প্লাগ-ইন করে ব্যবহার করতে পারবেন। কারেন্ট থাকা অবস্থায় এটি সরাসরি এসি কারেন্ট মোডে চলবে এবং একই সাথে এর অভ্যন্তরীণ ব্যাটারি চার্জ হতে থাকবে। চার্জিং সম্পন্ন হওয়ার পর ওভারহিটিং প্রটেকশন অন হয়ে ব্যাটারি সুরক্ষিত রাখবে।"
              },
              {
                q: "1 বছরের সার্ভিস ওয়ারেন্টি কীভাবে পাবো?",
                a: "আমরা ক্রয়ের দিন থেকে সম্পূর্ণ 365 দিন (1 বছর) সার্ভিস ওয়ারেন্টি প্রদান করি। যেকোনো ধরনের মেকানিক্যাল বা ইলেকট্রিকাল ইন্টারনাল সমস্যার ক্ষেত্রে আমাদের কাস্টমার সার্ভিসের নম্বরে যোগাযোগ করলে সম্পূর্ণ বিনামূল্যে সার্ভিসিং করে দেওয়া হবে।"
              }
            ].map((faq, idx) => (
              <div key={idx} className={`faq-card ${openFaqIndex === idx ? 'open' : ''}`}>
                <div className="faq-question" onClick={() => toggleFaq(idx)}>
                  <h3>{faq.q}</h3>
                  <span className="faq-icon">+</span>
                </div>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="reviews-section">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="sub-title">🌟 গ্রাহকদের মতামত</span>
            <h2 className="section-title">আমাদের সন্তুষ্ট গ্রাহকরা যা বলছেন</h2>
            <div className="title-divider"></div>
          </div>

          <div className="reviews-grid">
            <div className="review-card">
              <div className="review-rating">★★★★★</div>
              <p className="review-text">"ডিফেন্ডার ফ্যানটি আসলেই অসাধারণ। ঢাকার বাইরে আমাদের এখানে প্রচুর লোডশেডিং হয়। এই ফ্যানটি কেনার পর রাতে শান্তিতে ঘুমাতে পারছি। চার্জিং ব্যাকআপ 4-5 ঘণ্টা অনায়াসে পাই মিডিয়াম স্পিডে। ডেলিভারিও খুব দ্রুত পেয়েছি।"</p>
              <div className="review-author">
                <strong>মোঃ জাহিদুল ইসলাম</strong>
                <span>বগুড়া</span>
              </div>
            </div>
            
            <div className="review-card">
              <div className="review-rating">★★★★★</div>
              <p className="review-text">"ফ্যানের বিল্ড কোয়ালিটি অনেক প্রিমিয়াম। লাইটের আলোও দারুণ, চার্জে দিয়ে সবসময় অন করে রাখা যায়। ঢাকার মধ্যে মাত্র 1 দিনে হাতে পেয়েছি এবং সবচেয়ে বড় কথা প্রোডাক্ট চেক করে টাকা দেওয়ার অপশন ছিল।"</p>
              <div className="review-author">
                <strong>ফারজানা আক্তার</strong>
                <span>মিরপুর, ঢাকা</span>
              </div>
            </div>

            <div className="review-card">
              <div className="review-rating">★★★★★</div>
              <p className="review-text">"ডেলিভারি চার্জ বাইরের জন্য 150 টাকা কিন্তু ওরা প্যাকেজিংটা খুব সুন্দর করে পাঠিয়েছিল। ফ্যানের বাতাস অনেক ঠাণ্ডা এবং ভালো ছড়ায়। রিচার্জেবল ফ্যান হিসেবে খুবই সন্তোষজনক প্রোডাক্ট।"</p>
              <div className="review-author">
                <strong>সজীব রহমান</strong>
                <span>চট্টগ্রাম</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Form Section */}
      <section id="order-section" className="order-section">
        <div className="container order-form-container">
          <div className="order-info-panel">
            <h2>নিশ্চিন্তে অর্ডার করুন</h2>
            <p className="order-subtitle">অর্ডার কনফার্ম করতে নিচের ফর্মটি সঠিকভাবে পূরণ করুন। আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।</p>
            
            <div className="promo-box">
              <div className="promo-icon">🎁</div>
              <div className="promo-details">
                <h4>আজকের বিশেষ অফার</h4>
                <p>ডিফেন্ডার ফ্যানটি কিনলে পাচ্ছেন 1,000 টাকা ফ্ল্যাট ডিসকাউন্ট!</p>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="invoice-box">
              <h3>অর্ডার বিবরণী</h3>
              <div className="invoice-row">
                <span>প্রোডাক্ট: {productName}</span>
                <strong>৳{toBanglaDigits(unitPrice)}</strong>
              </div>
              <div className="invoice-row">
                <span>পরিমাণ:</span>
                <div className="qty-control">
                  <button className="qty-btn" type="button" onClick={() => handleQtyChange(-1)}>-</button>
                  <span>{toBanglaDigits(quantity)}</span>
                  <button className="qty-btn" type="button" onClick={() => handleQtyChange(1)}>+</button>
                </div>
              </div>
              <div className="invoice-row">
                <span>ডেলিভারি চার্জ:</span>
                <strong>৳{toBanglaDigits(shippingCharge)}</strong>
              </div>
              <div className="invoice-divider"></div>
              <div className="invoice-row total-row">
                <span>সর্বমোট মূল্য:</span>
                <strong>৳{toBanglaDigits(totalPrice)}</strong>
              </div>
            </div>

            <div className="order-guarantees">
              <div className="guarantee-item">
                <span>🛡️</span>
                <p><strong>100% নিরাপদ শপিং:</strong> পার্সেল পাওয়ার পর খুলে দেখে মূল্য পরিশোধের সুবিধা।</p>
              </div>
              <div className="guarantee-item">
                <span>📞</span>
                <p><strong>24/7 সাপোর্ট:</strong> যেকোনো প্রয়োজনে সরাসরি কল করুন: <a href="tel:01725201450"><strong>01725-201450</strong></a></p>
              </div>
            </div>
          </div>

          <div className="order-form-panel">
            <h3>অর্ডার ফর্ম</h3>
            <form onSubmit={handleOrderSubmit}>
              
              <div className="form-group">
                <label htmlFor="customer-name">আপনার নাম <span className="required">*</span></label>
                <input 
                  type="text" 
                  id="customer-name" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="যেমন: মোঃ সাকিব হাসান" 
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer-phone">মোবাইল নম্বর <span className="required">*</span></label>
                <input 
                  type="tel" 
                  id="customer-phone" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="যেমন: 017XXXXXXXX" 
                  pattern="[0-9]{11}" 
                  title="সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>ডেলিভারি এরিয়া <span className="required">*</span></label>
                <div className="radio-group">
                  <div 
                    className={`radio-label ${deliveryArea === 'inside' ? 'active' : ''}`}
                    onClick={() => handleAreaChange('inside')}
                  >
                    <span>ঢাকার ভিতরে (৳80)</span>
                  </div>
                  <div 
                    className={`radio-label ${deliveryArea === 'outside' ? 'active' : ''}`}
                    onClick={() => handleAreaChange('outside')}
                  >
                    <span>ঢাকার বাইরে (৳150)</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="customer-address">পূর্ণ ঠিকানা <span className="required">*</span></label>
                <textarea 
                  id="customer-address" 
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="বাসা নং, রোড নং, গ্রাম/মহল্লা, থানা, জেলা উল্লেখ করুন" 
                  rows="3" 
                  required 
                />
              </div>

              <div className="payment-method-box">
                <div className="payment-icon">💵</div>
                <div>
                  <strong>ক্যাশ অন ডেলিভারি (Cash on Delivery)</strong>
                  <p>অর্ডার কনফার্ম করার জন্য কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই। ডেলিভারি ম্যানের কাছ থেকে প্রোডাক্ট বুঝে পেয়ে টাকা পরিশোধ করবেন।</p>
                </div>
              </div>

              <button type="submit" className="submit-order-btn ripple" disabled={isSubmittingOrder}>
                <span style={{ opacity: isSubmittingOrder ? 0.5 : 1 }}>
                  কনফার্ম অর্ডার করুন - ৳{toBanglaDigits(totalPrice)}
                </span>
                {isSubmittingOrder && <span className="spinner"></span>}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="main-footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <a href="#" className="logo"><span className="logo-accent">Morshed</span>Zone</a>
            <p>আমরা গ্রাহকদের সর্বোচ্চ মানের পণ্য ও বিশ্বস্ত সেবা নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ।</p>
          </div>
          <div className="footer-links">
            <h4>গুরুত্বপূর্ণ লিংক</h4>
            <a href="#features">ফিচারসমূহ</a>
            <a href="#gallery">প্রোডাক্ট গ্যালারি</a>
            <a href="#faq">সচরাচর জিজ্ঞাসা</a>
            <a href="#order-section">অর্ডার করুন</a>
          </div>
          <div className="footer-contact">
            <h4>যোগাযোগ</h4>
            <p>📍 Narsingdi, 1600</p>
            <p>📞 <a href="tel:01725201450">01725-201450</a></p>
            <p>✉️ <a href="mailto:morshedzone096@gmail.com">morshedzone096@gmail.com</a></p>
            <p>💬 WhatsApp: <a href="https://wa.me/8801725201450" target="_blank" rel="noopener noreferrer">+880 1725-201450</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 MorshedZone. সর্বস্বত্ব সংরক্ষিত।</p>
          <button 
            type="button" 
            className="admin-footer-btn"
            onClick={() => {
              window.history.pushState({}, '', '/admin');
              setCurrentView('admin-login');
            }}
          >
            MorshedZone Admin Panel
          </button>
        </div>
      </footer>

      {/* Success Modal */}
      {showSuccessModal && placedOrder && (
        <div className="modal-overlay">
          <div className="success-modal-card">
            <div className="success-badge">✔</div>
            <h2>অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!</h2>
            <p>আপনার অর্ডারটির বিস্তারিত নিচে দেওয়া হলো। আমাদের একজন প্রতিনিধি খুব শীঘ্রই আপনার মোবাইলে কল করে অর্ডারটি কনফার্ম করবেন।</p>
            
            <div className="order-summary-card">
              <div className="summary-line"><span>অর্ডার আইডি:</span> <strong>#{placedOrder.id}</strong></div>
              <div className="summary-line"><span>গ্রাহকের নাম:</span> <strong>{placedOrder.name}</strong></div>
              <div className="summary-line"><span>মোবাইল নং:</span> <strong>{placedOrder.phone}</strong></div>
              <div className="summary-line"><span>ডেলিভারি ঠিকানা:</span> <strong>{placedOrder.address}</strong></div>
              <div className="summary-line"><span>প্রোডাক্ট:</span> <strong>{productName}</strong></div>
              <div className="summary-line"><span>পরিমাণ:</span> <strong>{toBanglaDigits(placedOrder.quantity)} টি</strong></div>
              <div className="summary-line"><span>মোট প্রদেয় মূল্য:</span> <strong className="accent-color">৳{toBanglaDigits(placedOrder.total_price)}</strong></div>
            </div>

            <button type="button" className="close-modal-btn" onClick={() => setShowSuccessModal(false)}>ঠিক আছে</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
