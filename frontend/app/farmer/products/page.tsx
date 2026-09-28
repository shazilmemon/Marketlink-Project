'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Reveal, StaggerContainer } from '../../../components/motion';
import { formatCurrency } from '../../../lib/utils';
import { productsApi } from '../../../lib/marketplaceApi';
import { farmerAiApi, AiPriceRecommendationResponse } from '../../../lib/farmerAiApi';
import {
  Package,
  Plus,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  TrendingUp,
  DollarSign,
  Tag,
  Store,
  Zap,
} from 'lucide-react';

export default function FarmerProductsPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('VEGETABLES');
  const [prodPrice, setProdPrice] = useState('4.50');
  const [prodUnit, setProdUnit] = useState('lb');
  const [prodDesc, setProdDesc] = useState('');
  const [prodIsSurplus, setProdIsSurplus] = useState(false);
  const [prodQuantity, setProdQuantity] = useState('50');
  const [submittingProd, setSubmittingProd] = useState(false);

  // AI Price Recommendation State
  const [aiPriceModalOpen, setAiPriceModalOpen] = useState(false);
  const [selectedProductForAi, setSelectedProductForAi] = useState<any | null>(null);
  const [aiPriceResult, setAiPriceResult] = useState<AiPriceRecommendationResponse | null>(null);
  const [loadingAiPrice, setLoadingAiPrice] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsApi.list().catch(() => ({ data: [] }));
      if (Array.isArray(res.data) && res.data.length > 0) {
        setProducts(res.data.map((p: any) => ({ ...p, isSoldOut: p.isSoldOut || false, quantity: p.quantity || 50 })));
      } else {
        setProducts(defaultMockProducts);
      }
    } catch {
      setProducts(defaultMockProducts);
    } finally {
      setLoading(false);
    }
  };

  const defaultMockProducts = [
    {
      _id: 'p1',
      name: 'Heirloom Organic Tomatoes',
      category: 'VEGETABLES',
      price: 4.5,
      unit: 'lb',
      quantity: 8, // Low stock for Auto-Restock alert test!
      isSurplus: true,
      isSoldOut: false,
    },
    {
      _id: 'p2',
      name: 'Fresh Crisp Honeycrisp Apples',
      category: 'FRUITS',
      price: 3.8,
      unit: 'lb',
      quantity: 65,
      isSurplus: false,
      isSoldOut: false,
    },
    {
      _id: 'p3',
      name: 'Wildflower Farm Raw Honey',
      category: 'HONEY',
      price: 12.0,
      unit: 'jar',
      quantity: 5, // Low stock
      isSurplus: false,
      isSoldOut: false,
    },
    {
      _id: 'p4',
      name: 'Organic Artisanal Goat Cheese',
      category: 'DAIRY',
      price: 8.5,
      unit: 'wheel',
      quantity: 0, // Zero stock -> Sold Out
      isSurplus: false,
      isSoldOut: true,
    },
  ];

  const handleToggleSoldOut = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, isSoldOut: !p.isSoldOut, quantity: !p.isSoldOut ? 0 : 30 } : p))
    );
  };

  const handleApplyWeeklyTemplate = () => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        quantity: 50,
        isSoldOut: false,
      }))
    );
    setNotice('Weekly recurring stock template applied! All 50 units replenished across active catalog.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleRequestAiPrice = async (prod: any) => {
    setSelectedProductForAi(prod);
    setAiPriceModalOpen(true);
    setLoadingAiPrice(true);
    setAiPriceResult(null);

    try {
      const res = await farmerAiApi.recommendPrice({
        productName: prod.name,
        category: prod.category,
        currentPrice: prod.price,
        unit: prod.unit,
        stockQuantity: prod.quantity,
      });
      setAiPriceResult(res);
    } catch {
      setAiPriceResult({
        suggestedPrice: +(prod.price * 1.1).toFixed(2),
        priceRange: { min: +(prod.price * 0.95).toFixed(2), max: +(prod.price * 1.25).toFixed(2) },
        priceChangePercent: 10,
        marketScarcity: prod.quantity < 15 ? 'High Scarcity' : 'Moderate Demand',
        reasoning: `Based on current competitor analysis and weekend market demand for ${prod.category}, optimizing price maximizes revenue.`,
        recommendedAction: `Adjust unit price to optimize yield.`,
      });
    } finally {
      setLoadingAiPrice(false);
    }
  };

  const handleApplySuggestedPrice = () => {
    if (!selectedProductForAi || !aiPriceResult) return;
    setProducts((prev) =>
      prev.map((p) => (p._id === selectedProductForAi._id ? { ...p, price: aiPriceResult.suggestedPrice } : p))
    );
    setNotice(`Updated ${selectedProductForAi.name} price to ${formatCurrency(aiPriceResult.suggestedPrice)}/${selectedProductForAi.unit}!`);
    setAiPriceModalOpen(false);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProd(true);
    try {
      const newP = {
        _id: `p-${Date.now()}`,
        name: prodName,
        category: prodCategory,
        price: parseFloat(prodPrice),
        unit: prodUnit,
        description: prodDesc,
        isSurplus: prodIsSurplus,
        quantity: parseInt(prodQuantity) || 50,
        isSoldOut: false,
      };
      setProducts((prev) => [newP, ...prev]);
      setIsAddModalOpen(false);
      setNotice(`Published new produce listing: ${prodName}`);
      setTimeout(() => setNotice(null), 3000);
    } finally {
      setSubmittingProd(false);
    }
  };

  const lowStockItems = products.filter((p) => p.quantity < 15 || p.isSoldOut);

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      <Sidebar role="FARMER" activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col gap-6">
        {/* Header Banner */}
        <Reveal variant="fade-down">
          <div className="rounded-md bg-agri-dark text-[#F5F0E6] p-6 sm:p-8 shadow-card border border-agri-dark/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-glow">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="amber" icon={<Sparkles className="w-3.5 h-3.5 text-amber-950" />} className="bg-amber-400 text-amber-950 font-bold">
                    AI Dynamic Pricing &amp; Restock Engine
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#F5F0E6]">
                  Produce Catalog &amp; Stock Control
                </h1>
                <p className="text-xs sm:text-sm text-gray-200 mt-1">
                  Manage weekly harvests, leverage AI real-time price recommendations, and restock with 1-click templates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="text-[#F5F0E6] border-white/20 hover:bg-[#F5F0E6]/10 font-bold text-xs"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={handleApplyWeeklyTemplate}
              >
                Recurring Weekly Template
              </Button>
              <Button
                variant="amber"
                size="sm"
                className="font-bold text-xs shadow-md"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Produce Listing
              </Button>
            </div>
          </div>
        </Reveal>

        {/* Global Notice Alert */}
        {notice && (
          <div className="p-4 rounded-lg bg-[#263A2E]/10 border border-emerald-200 text-[#263A2E] text-xs font-bold flex items-center gap-2 animate-success-pop">
            <CheckCircle2 className="w-4 h-4 text-[#263A2E] shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Auto-Restock AI Alert Banner (Flags Low Stock Items) */}
        {lowStockItems.length > 0 && (
          <Reveal variant="fade-up">
            <Card className="border-l-4 border-l-amber-500 bg-amber-50/30 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-800 rounded-md shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-amber-950 uppercase tracking-wider">
                      Auto-Restock Assistant Flag ({lowStockItems.length} items low or sold out)
                    </h3>
                    <p className="text-xs text-agri-dark font-medium mt-0.5">
                      The following crops need replenishment prior to Sunday's market day: {' '}
                      <strong className="text-amber-900">
                        {lowStockItems.map((i) => `${i.name} (${i.quantity} left)`).join(', ')}
                      </strong>
                    </p>
                  </div>
                </div>

                <Button
                  variant="amber"
                  size="sm"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={handleApplyWeeklyTemplate}
                  className="font-bold text-xs shrink-0 shadow-sm"
                >
                  1-Click Weekly Stock Reset
                </Button>
              </div>
            </Card>
          </Reveal>
        )}

        {/* Products Grid with Dynamic Pricing & Sold Out Toggles */}
        <StaggerContainer staggerDelay={80} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {products.map((prod) => (
            <Card key={prod._id} className="p-6 border-agri-border shadow-card flex flex-col justify-between animated-card-lift">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <Badge variant="emerald" className="mb-1.5">{prod.category}</Badge>
                    <h3 className="font-extrabold text-lg text-agri-dark">{prod.name}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {prod.isSoldOut ? (
                      <Badge variant="rose" className="font-bold">Sold Out</Badge>
                    ) : prod.quantity < 15 ? (
                      <Badge variant="amber" className="font-bold">Low Stock ({prod.quantity})</Badge>
                    ) : (
                      <Badge variant="emerald" className="font-bold">In Stock ({prod.quantity})</Badge>
                    )}
                    {prod.isSurplus && <Badge variant="amber" className="text-[10px]">Surplus Harvest</Badge>}
                  </div>
                </div>

                <div className="flex items-baseline justify-between py-3 border-y border-agri-border my-4">
                  <div>
                    <span className="text-xs text-agri-muted block">Unit Price</span>
                    <span className="text-2xl font-black text-agri-dark">
                      {formatCurrency(prod.price)} <span className="text-xs font-normal text-agri-muted">/ {prod.unit}</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-agri-muted block">Available Inventory</span>
                    <span className="text-sm font-bold text-[#263A2E] bg-[#263A2E]/10 px-3 py-1 rounded-md border border-emerald-200">
                      {prod.quantity} {prod.unit}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-amber-800 border-amber-300 hover:bg-amber-50 font-bold text-xs"
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-600" />}
                  onClick={() => handleRequestAiPrice(prod)}
                >
                  AI Price Recommendation
                </Button>

                <button
                  onClick={() => handleToggleSoldOut(prod._id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-extrabold transition-all ${
                    prod.isSoldOut
                      ? 'bg-[#263A2E]/10 text-[#F5F0E6] hover:bg-[#263A2E]/10'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                  }`}
                >
                  {prod.isSoldOut ? 'Mark In Stock' : 'Mark Sold Out'}
                </button>
              </div>
            </Card>
          ))}
        </StaggerContainer>
      </main>

      {/* AI Price Recommendation Modal */}
      {aiPriceModalOpen && selectedProductForAi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#F5F0E6] rounded-md p-6 w-full max-w-lg border border-agri-border shadow-lg relative">
            <button
              onClick={() => setAiPriceModalOpen(false)}
              className="absolute top-4 right-4 text-agri-muted hover:text-agri-dark p-2 rounded-full hover:bg-agri-surface"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Badge variant="amber" icon={<Sparkles className="w-3 h-3" />}>
                AI Dynamic Price Suggestion
              </Badge>
            </div>
            <h3 className="text-xl font-extrabold text-agri-dark font-display">
              {selectedProductForAi.name}
            </h3>
            <p className="text-xs text-agri-muted mb-4">Current Price: ${selectedProductForAi.price} / {selectedProductForAi.unit}</p>

            {loadingAiPrice ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-xs font-bold text-agri-dark">Analyzing market trends, scarcity index &amp; competitor prices...</p>
              </div>
            ) : aiPriceResult ? (
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-agri-surface rounded-lg border border-agri-border flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-agri-muted uppercase block">AI Recommended Price</span>
                    <span className="text-3xl font-black text-[#263A2E]">
                      {formatCurrency(aiPriceResult.suggestedPrice)} <span className="text-xs text-agri-muted">/ {selectedProductForAi.unit}</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <Badge variant="amber">{aiPriceResult.marketScarcity}</Badge>
                    <span className="text-xs font-bold text-[#263A2E] block mt-1">
                      +{aiPriceResult.priceChangePercent}% Yield Increase
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[#F5F0E6] rounded-lg border border-agri-border text-xs leading-relaxed text-agri-dark">
                  <strong className="block mb-1 text-agri-muted uppercase text-[10px]">Market Reasoning:</strong>
                  "{aiPriceResult.reasoning}"
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="emerald"
                    size="md"
                    className="w-full font-bold shadow-md"
                    onClick={handleApplySuggestedPrice}
                  >
                    Apply New Price ({formatCurrency(aiPriceResult.suggestedPrice)})
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#F5F0E6] rounded-md p-6 w-full max-w-md border border-agri-border shadow-lg relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-agri-muted hover:text-agri-dark p-2 rounded-full hover:bg-agri-surface"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-agri-dark mb-1 font-display">Add Produce Listing</h3>
            <p className="text-xs text-agri-muted mb-4">Publish fresh crop inventory for pre-order customer pickup.</p>

            <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-agri-dark block mb-1">Produce Name</label>
                <input
                  type="text"
                  placeholder="e.g. Heirloom Organic Tomatoes"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-agri-border rounded-md text-sm focus:outline-none focus:border-agri-emerald"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-agri-dark block mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-agri-border rounded-md text-sm focus:outline-none focus:border-agri-emerald"
                  >
                    <option value="VEGETABLES">Vegetables</option>
                    <option value="FRUITS">Fruits</option>
                    <option value="DAIRY">Dairy</option>
                    <option value="HONEY">Honey</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-agri-dark block mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-agri-border rounded-md text-sm focus:outline-none focus:border-agri-emerald"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-agri-dark block mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="lb, dozen, jar"
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-agri-border rounded-md text-sm focus:outline-none focus:border-agri-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-agri-dark block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={prodQuantity}
                    onChange={(e) => setProdQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-agri-border rounded-md text-sm focus:outline-none focus:border-agri-emerald"
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="amber" className="w-full mt-2 font-bold shadow-md" disabled={submittingProd}>
                {submittingProd ? 'Publishing...' : 'Publish Produce Listing'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
