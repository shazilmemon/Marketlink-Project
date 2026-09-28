'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency } from '../../lib/utils';
import { productsApi, ordersApi, favoritesApi } from '../../lib/marketplaceApi';
import { ProductImage } from '../../components/shared/ProductImage';
import { Reveal, StaggerContainer } from '../../components/motion';
import { ShoppingBag, Search, ShieldCheck, Tag, Heart, Calendar, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('FEATURED');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Pre-Order Modal State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [pickupDate, setPickupDate] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: 'All Produce' },
    { id: 'VEGETABLES', label: 'Organic Vegetables' },
    { id: 'FRUITS', label: 'Fresh Fruits' },
    { id: 'DAIRY', label: 'Dairy & Eggs' },
    { id: 'HONEY', label: 'Honey & Preserves' },
    { id: 'GRAINS', label: 'Grains & Nuts' },
  ];

  const defaultMockProducts = [
    {
      _id: 'p1',
      name: 'Heirloom Organic Tomatoes',
      farmerProfile: { farmName: 'Oakland Heritage Farm' },
      category: 'VEGETABLES',
      price: 4.5,
      unit: 'lb',
      quantity: 45,
      isSurplus: true,
      badge: 'Verified Organic',
    },
    {
      _id: 'p2',
      name: 'Fresh Crisp Honeycrisp Apples',
      farmerProfile: { farmName: 'Sunnyside Orchards' },
      category: 'FRUITS',
      price: 3.8,
      unit: 'lb',
      quantity: 60,
      isSurplus: false,
      badge: 'Grade A',
    },
    {
      _id: 'p3',
      name: 'Wildflower Farm Raw Honey',
      farmerProfile: { farmName: 'Cascade Apiaries' },
      category: 'HONEY',
      price: 12.0,
      unit: 'jar (16oz)',
      quantity: 20,
      isSurplus: false,
      badge: 'Raw Unfiltered',
    },
    {
      _id: 'p4',
      name: 'Pasture-Raised Organic Eggs',
      farmerProfile: { farmName: 'Valley Crest Poultry' },
      category: 'DAIRY',
      price: 7.5,
      unit: 'dozen',
      quantity: 30,
      isSurplus: true,
      badge: 'Pasture Raised',
    },
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (search) params.search = search;
      const res = await productsApi.list(params);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setProducts(res.data);
      } else {
        setProducts(defaultMockProducts);
      }
    } catch (err) {
      setProducts(defaultMockProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        favoritesApi.remove(id).catch(() => {});
      } else {
        next.add(id);
        favoritesApi.add(id).catch(() => {});
      }
      return next;
    });
  };

  const handleOpenPreOrder = (prod: any) => {
    setSelectedProduct(prod);
    setOrderQuantity(1);
    setCustomerNotes('');
    setOrderSuccess(null);
    setOrderError(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPickupDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    setOrderError(null);

    try {
      const res = await ordersApi.create({
        farmerProfileId: selectedProduct.farmerProfileId || selectedProduct.farmerProfile?._id || '6601a5b8e4b0123456789aaa',
        items: [{ productId: selectedProduct._id, quantity: orderQuantity }],
        pickupDate: new Date(pickupDate).toISOString(),
        paymentMethod: 'CASH_ON_PICKUP',
        customerNotes,
      });

      if (res.success) {
        const orderNum = (res.data as any)?.orderNumber || 'CONFIRMED';
        setOrderSuccess(`Pre-order submitted successfully! Order #${orderNum}`);
        setTimeout(() => {
          setSelectedProduct(null);
        }, 2000);
      } else {
        setOrderError(res.message || 'Failed to submit pre-order');
      }
    } catch (err: any) {
      setOrderSuccess(`Pre-order placed in demo mode! Quantity: ${orderQuantity} ${selectedProduct.unit}`);
      setTimeout(() => {
        setSelectedProduct(null);
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const farmerName = p.farmerProfile?.farmName || p.farmer || '';
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      farmerName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Page Header */}
      <Reveal animation="fade-down">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Badge variant="emerald" className="mb-2" icon={<ShoppingBag className="w-3.5 h-3.5" />}>
              Direct Pre-Order Catalog
            </Badge>
            <h1 className="text-3xl font-extrabold text-agri-dark tracking-tight font-serif">Fresh Farm Produce</h1>
            <p className="text-xs md:text-sm text-agri-muted mt-1">
              Reserve fresh harvests directly from verified regional farmers before market day.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Visual Category Showcase Grid */}
      <StaggerContainer staggerDelay={60} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {[
          { id: 'VEGETABLES', name: 'Vegetables', image: '/images/cat-vegetables.jpg', count: 'Fresh Harvest' },
          { id: 'FRUITS', name: 'Fruits', image: '/images/cat-fruits.jpg', count: 'Orchard Fresh' },
          { id: 'DAIRY', name: 'Dairy & Eggs', image: '/images/cat-dairy.jpg', count: 'Farm Fresh' },
          { id: 'HONEY', name: 'Honey & Jams', image: '/images/cat-honey.svg', count: 'Pure & Organic' },
          { id: 'GRAINS', name: 'Grains & Nuts', image: '/images/cat-grains.jpg', count: 'Whole Grains' },
          { id: 'MEAT', name: 'Farm Meat', image: '/images/cat-meat.svg', count: 'Ethical Cuts' },
        ].map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.id)}
              className={`group relative rounded-lg overflow-hidden aspect-[4/3] border transition-all duration-300 text-left ${
                isSelected
                  ? 'ring-2 ring-agri-emerald border-transparent shadow-lg scale-[1.02]'
                  : 'border-agri-border hover:border-agri-emerald/50 hover:shadow-md'
              }`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover animated-img-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-agri-dark/85 via-agri-dark/30 to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <span className="text-[10px] font-semibold text-agri-sage block">{cat.count}</span>
                <span className="text-xs font-extrabold text-[#F5F0E6] group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </span>
              </div>
            </button>
          );
        })}
      </StaggerContainer>

      {/* Category Pills & Search */}
      <Reveal animation="fade-up" delay={100}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  selectedCategory === cat.id
                    ? 'bg-agri-dark text-[#F5F0E6] shadow-sm'
                    : 'bg-[#F5F0E6] text-agri-charcoal border border-agri-border hover:bg-agri-surface'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="bg-[#F5F0E6] p-4 rounded-lg border border-agri-border shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:w-3/4">
              <Input
                placeholder="Search produce name or farmer vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full md:w-1/4">
              <Select
                options={[
                  { value: 'FEATURED', label: 'Featured First' },
                  { value: 'PRICE_LOW', label: 'Price: Low to High' },
                  { value: 'PRICE_HIGH', label: 'Price: High to Low' },
                ]}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              />
            </div>
          </form>
        </div>
      </Reveal>

      {/* Product Grid */}
      {loading ? (
        <div className="py-12 text-center text-agri-muted text-sm font-medium">Loading catalog...</div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No Produce Found"
          description="No produce items matching your current filters were found."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('ALL');
          }}
        />
      ) : (
        <StaggerContainer staggerDelay={80} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map((prod) => {
            const isFav = favorites.has(prod._id);
            const farmerName = prod.farmerProfile?.farmName || prod.farmer || 'Verified Regional Farm';

            return (
              <div key={prod._id} className="group flex flex-col bg-[#F5F0E6] rounded-md border border-agri-border overflow-hidden animated-card-lift">
                
                {/* Image Area */}
                <div className="relative aspect-[4/3] w-full bg-agri-surface overflow-hidden">
                  <ProductImage
                    src={prod.image}
                    alt={prod.name}
                    category={prod.category}
                    className="w-full h-full object-cover animated-img-zoom"
                  />
                  
                  {/* Badges overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
                    {prod.badge && (
                      <Badge variant="emerald" className="bg-[#F5F0E6]/95 text-[#263A2E] border-none shadow-sm backdrop-blur-md" icon={<ShieldCheck className="w-3 h-3" />}>
                        {prod.badge}
                      </Badge>
                    )}
                    {prod.isSurplus && (
                      <Badge variant="amber" className="bg-[#F5F0E6]/95 text-amber-800 border-none shadow-sm backdrop-blur-md" icon={<Tag className="w-3 h-3" />}>
                        Surplus Match
                      </Badge>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(prod._id)}
                    aria-label="Toggle Favorite"
                    className={`absolute top-3 right-3 z-10 p-2.5 rounded-full transition-all duration-200 active:scale-125 ${
                      isFav
                        ? 'bg-rose-500 text-[#F5F0E6] shadow-md'
                        : 'bg-[#F5F0E6]/80 backdrop-blur-md text-gray-400 hover:text-rose-500 hover:bg-[#F5F0E6]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Info Area */}
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-agri-muted tracking-wide uppercase">
                      {farmerName}
                    </span>
                    <h3 className="font-bold text-agri-dark text-base mt-0.5 line-clamp-1 group-hover:text-[#263A2E] transition-colors">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="flex items-end justify-between border-t border-agri-border pt-4">
                    <div>
                      <span className="text-xs text-agri-muted block">Price / {prod.unit}</span>
                      <span className="text-lg font-extrabold text-agri-dark">
                        {formatCurrency(prod.price)}
                      </span>
                    </div>

                    <Button
                      variant="emerald"
                      size="sm"
                      onClick={() => handleOpenPreOrder(prod)}
                      className="rounded-md shadow-sm font-semibold"
                    >
                      Pre-Order
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </StaggerContainer>
      )}

      {/* Pre-Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F5F0E6] rounded-md max-w-md w-full p-6 shadow-lg border border-agri-border relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 text-agri-muted hover:text-agri-dark rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-agri-dark mb-1">Pre-Order Farm Produce</h3>
            <p className="text-xs text-agri-muted mb-4">
              Reserving <span className="font-semibold text-agri-dark">{selectedProduct.name}</span> directly from{' '}
              <span className="text-[#263A2E] font-semibold">{selectedProduct.farmerProfile?.farmName || 'Verified Farm'}</span>.
            </p>

            {orderSuccess ? (
              <div className="bg-[#263A2E]/10 border border-emerald-200 text-[#263A2E] p-4 rounded-lg text-xs font-semibold flex items-center gap-2 animate-success-pop">
                <CheckCircle2 className="w-5 h-5 text-[#263A2E] shrink-0" />
                <span>{orderSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleCreateOrder} className="space-y-4">
                {orderError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-md text-xs font-medium flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{orderError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-agri-dark block mb-1">Quantity ({selectedProduct.unit})</label>
                  <Input
                    type="number"
                    min={1}
                    max={selectedProduct.quantity || 100}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-agri-dark block mb-1">Pickup Date</label>
                  <Input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    leftIcon={<Calendar className="w-4 h-4" />}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-agri-dark block mb-1">Special Notes / Requests</label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="e.g. Preferred ripe tomatoes, morning pickup..."
                    className="w-full bg-[#F5F0E6] border border-agri-border rounded-md p-3 text-xs text-agri-charcoal focus:ring-2 focus:ring-agri-emerald/50 focus:border-agri-emerald transition-all"
                  />
                </div>

                <div className="bg-agri-surface p-3 rounded-md border border-agri-border flex items-center justify-between text-xs font-bold">
                  <span>Estimated Total (Cash on Pickup):</span>
                  <span className="text-[#263A2E] text-sm">{formatCurrency(selectedProduct.price * orderQuantity)}</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="w-1/2" onClick={() => setSelectedProduct(null)}>
                    Cancel
                  </Button>
                  <Button variant="emerald" type="submit" isLoading={isSubmitting} className="w-1/2 font-bold">
                    Confirm Pre-Order
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
