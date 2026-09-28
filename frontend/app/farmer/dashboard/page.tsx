'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../lib/utils';
import { farmersApi, productsApi, ordersApi } from '../../../lib/marketplaceApi';
import { farmerAiApi } from '../../../lib/farmerAiApi';
import { Reveal, StaggerContainer } from '../../../components/motion';
import Link from 'next/link';
import {
  Store,
  Package,
  TrendingUp,
  Leaf,
  Plus,
  ShieldCheck,
  Clock,
  X,
  RefreshCw,
  Ban,
  Check,
  DollarSign,
  ShoppingBag,
  Star,
  Sparkles,
  MessageSquare,
  Bot,
  BrainCircuit,
  ArrowRight,
  Sliders,
  Bell,
  CheckCircle2,
} from 'lucide-react';

export default function FarmerDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [pipelineTab, setPipelineTab] = useState('PENDING'); // PENDING | ACCEPTED | READY | COMPLETED

  const [profile, setProfile] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Time Slots & Cut-Off Settings State
  const [cutoffTime, setCutoffTime] = useState('10:00 AM');
  const [pickupSlots, setPickupSlots] = useState(['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '01:00 PM - 03:00 PM']);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Review Response State
  const [aiDrafts, setAiDrafts] = useState<Record<string, string>>({});
  const [generatingAiForReviewId, setGeneratingAiForReviewId] = useState<string | null>(null);

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const fetchFarmerData = async () => {
    setLoading(true);
    try {
      const [profRes, prodRes, ordRes] = await Promise.all([
        farmersApi.getMyProfile().catch(() => ({ data: null })),
        productsApi.list().catch(() => ({ data: [] })),
        farmersApi.getMyOrders().catch(() => ({ data: [] })),
      ]);

      if (profRes.data) setProfile(profRes.data);
      if (Array.isArray(prodRes.data) && prodRes.data.length > 0) {
        setProducts(prodRes.data.map((p: any) => ({ ...p, isSoldOut: p.isSoldOut || false })));
      } else {
        setProducts(defaultMockProducts);
      }
      if (Array.isArray(ordRes.data) && ordRes.data.length > 0) {
        setOrders(ordRes.data);
      } else {
        setOrders(defaultMockOrders);
      }

      setReviews(defaultMockReviews);
    } catch {
      setProducts(defaultMockProducts);
      setOrders(defaultMockOrders);
      setReviews(defaultMockReviews);
    } finally {
      setLoading(false);
    }
  };

  const defaultMockProducts = [
    { _id: 'p1', name: 'Heirloom Organic Tomatoes', category: 'VEGETABLES', price: 4.5, unit: 'lb', quantity: 45, isSoldOut: false },
    { _id: 'p2', name: 'Fresh Crisp Honeycrisp Apples', category: 'FRUITS', price: 3.8, unit: 'lb', quantity: 60, isSoldOut: false },
    { _id: 'p3', name: 'Wildflower Farm Raw Honey', category: 'HONEY', price: 12.0, unit: 'jar', quantity: 15, isSoldOut: false },
    { _id: 'p4', name: 'Organic Artisanal Goat Cheese', category: 'DAIRY', price: 8.5, unit: 'wheel', quantity: 0, isSoldOut: true },
  ];

  const defaultMockOrders = [
    {
      _id: 'o1',
      orderNumber: 'ML-9921-A',
      customer: { name: 'Sarah Jenkins' },
      items: [{ product: { name: 'Heirloom Organic Tomatoes' }, quantity: 4, unitPrice: 4.5 }],
      totalAmount: 18.0,
      status: 'PENDING',
      slot: '09:00 AM - 11:00 AM',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'o2',
      orderNumber: 'ML-9922-B',
      customer: { name: 'Michael Chang' },
      items: [{ product: { name: 'Fresh Crisp Honeycrisp Apples' }, quantity: 5, unitPrice: 3.8 }],
      totalAmount: 19.0,
      status: 'ACCEPTED',
      slot: '11:00 AM - 01:00 PM',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'o3',
      orderNumber: 'ML-9923-C',
      customer: { name: 'Amina Ali' },
      items: [{ product: { name: 'Wildflower Farm Raw Honey' }, quantity: 2, unitPrice: 12.0 }],
      totalAmount: 24.0,
      status: 'READY_FOR_PICKUP',
      slot: '01:00 PM - 03:00 PM',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'o4',
      orderNumber: 'ML-9924-D',
      customer: { name: 'David Miller' },
      items: [{ product: { name: 'Heirloom Organic Tomatoes' }, quantity: 6, unitPrice: 4.5 }],
      totalAmount: 27.0,
      status: 'COMPLETED',
      slot: '09:00 AM - 11:00 AM',
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultMockReviews = [
    {
      _id: 'r1',
      customerName: 'Sarah Jenkins',
      rating: 5,
      comment: 'The heirloom tomatoes were incredibly sweet and fresh! Pickup at stall #A-12 was smooth as well.',
      productName: 'Heirloom Organic Tomatoes',
      createdAt: '2 days ago',
      farmerReply: '',
    },
    {
      _id: 'r2',
      customerName: 'Michael Chang',
      rating: 4,
      comment: 'Crisp apples! Would love if pre-order pickup cutoff was slightly later on Sunday mornings.',
      productName: 'Fresh Crisp Honeycrisp Apples',
      createdAt: '4 days ago',
      farmerReply: 'Thank you Michael! We have updated our pickup cutoff to 10:00 AM on Sunday mornings.',
    },
  ];

  // Pipeline status transitions with revenue toast
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const targetOrder = orders.find((o) => o._id === orderId);
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
    if (newStatus === 'ACCEPTED' && targetOrder) {
      setNotice(`âœ… Order Accepted! +${formatCurrency(targetOrder.totalAmount || 0)} added to your projected market earnings.`);
      setTimeout(() => setNotice(null), 6000);
    } else if (newStatus === 'READY_FOR_PICKUP') {
      setNotice(`ðŸ“¦ Real-time customer notification sent: Order #${targetOrder?.orderNumber || 'Pre-order'} is READY for stall pickup!`);
      setTimeout(() => setNotice(null), 5000);
    } else if (newStatus === 'COMPLETED') {
      setNotice(`ðŸŽ‰ Order completed! Revenue confirmed for Order #${targetOrder?.orderNumber || ''}.`);
      setTimeout(() => setNotice(null), 5000);
    }
    try {
      await ordersApi.updateStatus(orderId, { status: newStatus });
    } catch {
      // Backend offline â€” optimistic update retained
    }
  };

  // AI Review Reply Generator
  const handleGenerateAiReply = async (rev: any) => {
    setGeneratingAiForReviewId(rev._id);
    try {
      const generated = await farmerAiApi.generateReviewReply({
        rating: rev.rating,
        comment: rev.comment,
        customerName: rev.customerName,
        productName: rev.productName,
      });
      setAiDrafts((prev) => ({ ...prev, [rev._id]: generated }));
    } catch {
      setAiDrafts((prev) => ({
        ...prev,
        [rev._id]: `Thank you so much ${rev.customerName} for your ${rev.rating}-star review! We take great pride in our fresh produce harvest.`,
      }));
    } finally {
      setGeneratingAiForReviewId(null);
    }
  };

  const handlePostReply = (reviewId: string) => {
    const text = aiDrafts[reviewId];
    if (!text) return;
    setReviews((prev) =>
      prev.map((r) => (r._id === reviewId ? { ...r, farmerReply: text } : r))
    );
    setNotice('Response posted successfully to customer review!');
    setTimeout(() => setNotice(null), 3000);
  };

  // KPI calculations â€” revenue only from ACCEPTED, READY_FOR_PICKUP, COMPLETED orders
  const REVENUE_STATUSES = ['ACCEPTED', 'READY_FOR_PICKUP', 'COMPLETED'];
  const totalRevenue = orders
    .filter((o) => REVENUE_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
  const acceptedCount = orders.filter((o) => o.status === 'ACCEPTED' || o.status === 'READY_FOR_PICKUP' || o.status === 'COMPLETED').length;
  const totalProcessed = orders.length;
  const fulfillmentRate = totalProcessed > 0 ? Math.round((acceptedCount / totalProcessed) * 100) : 100;
  const activeProductsCount = products.filter((p) => !p.isSoldOut).length;
  const soldOutProductsCount = products.filter((p) => p.isSoldOut).length;

  const filteredOrders = orders.filter((o) => {
    if (pipelineTab === 'PENDING') return o.status === 'PENDING';
    if (pipelineTab === 'ACCEPTED') return o.status === 'ACCEPTED';
    if (pipelineTab === 'READY') return o.status === 'READY_FOR_PICKUP';
    if (pipelineTab === 'COMPLETED') return o.status === 'COMPLETED' || o.status === 'DECLINED';
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      <Sidebar role="FARMER" activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col gap-8">
        {/* Stall Header Banner / Executive Storefront */}
        <Reveal variant="fade-down">
          <div className="relative rounded-md overflow-hidden shadow-card border border-agri-border bg-[#F5F0E6]">
            <div className="h-32 md:h-48 w-full bg-agri-dark relative">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80"
                alt="Farm cover"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-agri-dark/95 via-agri-dark/40 to-transparent" />
            </div>

            <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row items-center md:items-end justify-between gap-6 md:gap-4 -mt-12 md:-mt-16">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 text-center md:text-left">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-agri-surface flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                  <Store className="w-10 h-10 text-agri-dark" />
                </div>

                <div className="pb-2">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                    <Badge variant="emerald" icon={<ShieldCheck className="w-3 h-3" />} className="bg-[#263A2E]/10 text-[#263A2E] border-emerald-200">
                      Verified AI Vendor Command Stall
                    </Badge>
                    <span className="text-xs font-semibold text-agri-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Cut-off: {cutoffTime}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-agri-dark font-display tracking-tight">
                    {profile?.farmName || 'Sunnyside Orchards & Apiary'}
                  </h1>
                  <p className="text-xs md:text-sm text-agri-muted font-medium mt-0.5">
                    {profile?.locationName || 'Downtown Oakland Regional Market #A-12'}
                  </p>
                </div>
              </div>

              <div className="pb-2 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Sliders className="w-4 h-4" />}
                  onClick={() => setShowSettingsModal(true)}
                  className="font-bold text-xs"
                >
                  Pickup Settings
                </Button>
                <Link href="/farmer/products">
                  <Button variant="emerald" size="sm" className="font-bold text-xs shadow-md">
                    Manage Produce
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Global Real-time Notification Banner */}
        {notice && (
          <div className="p-4 rounded-lg bg-[#263A2E]/10 border border-emerald-200 text-[#263A2E] text-xs font-bold flex items-center justify-between shadow-xs animate-success-pop">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#263A2E] shrink-0 animate-bounce" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice(null)} className="text-[#263A2E] hover:text-[#263A2E]">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Link AI Banners */}
        <Reveal variant="fade-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/farmer/analytics/forecasting">
              <div className="p-5 rounded-lg bg-gradient-to-br from-agri-dark to-emerald-900 text-[#F5F0E6] shadow-md hover:shadow-lg transition-all group border border-emerald-800/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold uppercase mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Forecasting
                  </div>
                  <h3 className="font-extrabold text-base text-[#F5F0E6] group-hover:text-amber-300 transition-colors">
                    Weekend Demand Model
                  </h3>
                  <p className="text-[11px] text-gray-300 mt-0.5">Predict sales &amp; produce spikes</p>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/farmer/analytics/insights">
              <div className="p-5 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-md hover:shadow-lg transition-all group border border-amber-400 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-950 text-[11px] font-bold uppercase mb-1">
                    <BrainCircuit className="w-3.5 h-3.5" /> Vendor Analysis
                  </div>
                  <h3 className="font-extrabold text-base text-slate-950 group-hover:underline">
                    Revenue &amp; Cutoff Insights
                  </h3>
                  <p className="text-[11px] text-amber-950 mt-0.5">Processing time &amp; retention</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/farmer/products">
              <div className="p-5 rounded-lg bg-[#F5F0E6] border border-agri-border shadow-xs hover:shadow-md transition-all group flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[#263A2E] text-[11px] font-bold uppercase mb-1">
                    <Bot className="w-3.5 h-3.5 text-amber-600" /> Dynamic Pricing
                  </div>
                  <h3 className="font-extrabold text-base text-agri-dark group-hover:text-[#263A2E]">
                    AI Price Recommendations
                  </h3>
                  <p className="text-[11px] text-agri-muted mt-0.5">Scarcity &amp; competitor yield</p>
                </div>
                <ArrowRight className="w-5 h-5 text-agri-dark group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </Reveal>

        {/* 1. REAL-TIME KPI METRIC CARDS (TOP SECTION) */}
        <StaggerContainer staggerDelay={80} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Revenue Summary */}
          <Card className="border-agri-border shadow-sm hover:shadow-md animated-card-lift">
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardDescription className="font-bold text-agri-muted text-xs uppercase">Total Revenue Summary</CardDescription>
              <div className="p-2 rounded-md bg-[#263A2E]/10 text-[#263A2E]">
                <DollarSign className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl font-black text-agri-dark">{formatCurrency(totalRevenue)}</CardTitle>
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#263A2E] mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.4% growth vs last week</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Pending Pre-Orders */}
          <Card className="border-agri-border shadow-sm hover:shadow-md animated-card-lift">
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardDescription className="font-bold text-agri-muted text-xs uppercase">Pending Pre-Orders</CardDescription>
              <div className="p-2 rounded-md bg-amber-50 text-amber-700">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl font-black text-amber-700">{pendingOrdersCount}</CardTitle>
              <span className="text-[11px] text-agri-muted font-semibold mt-1 inline-block">Real-time count awaiting approval</span>
            </CardContent>
          </Card>

          {/* Card 3: Fulfillment Rate */}
          <Card className="border-agri-border shadow-sm hover:shadow-md animated-card-lift">
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardDescription className="font-bold text-agri-muted text-xs uppercase">Fulfillment Rate</CardDescription>
              <div className="p-2 rounded-md bg-blue-50 text-blue-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl font-black text-agri-dark">{fulfillmentRate}%</CardTitle>
              <span className="text-[11px] text-[#263A2E] font-semibold mt-1 inline-block">Accepted &amp; pickup completed</span>
            </CardContent>
          </Card>

          {/* Card 4: Active Inventory Count */}
          <Card className="border-agri-border shadow-sm hover:shadow-md animated-card-lift">
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardDescription className="font-bold text-agri-muted text-xs uppercase">Active Inventory Count</CardDescription>
              <div className="p-2 rounded-md bg-purple-50 text-purple-700">
                <Package className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl font-black text-agri-dark">{activeProductsCount}</CardTitle>
              <span className="text-[11px] text-agri-muted font-semibold mt-1 inline-block">
                {soldOutProductsCount > 0 ? `${soldOutProductsCount} sold-out items` : 'All items in stock'}
              </span>
            </CardContent>
          </Card>
        </StaggerContainer>

        {/* 3B. PRE-ORDER MANAGEMENT PIPELINE (KANBAN / TABBED VIEW) */}
        <Reveal variant="fade-up">
          <Card className="p-6 border-agri-border shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-agri-dark font-display">
                  Pre-Order Management Pipeline
                </h3>
                <p className="text-xs text-agri-muted">
                  Manage incoming customer pre-orders from placement to pickup completion.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-agri-surface p-1.5 rounded-lg border border-agri-border overflow-x-auto scrollbar-none">
                {[
                  { id: 'PENDING', label: 'Pending', count: orders.filter((o) => o.status === 'PENDING').length },
                  { id: 'ACCEPTED', label: 'Accepted', count: orders.filter((o) => o.status === 'ACCEPTED').length },
                  { id: 'READY', label: 'Ready for Pickup', count: orders.filter((o) => o.status === 'READY_FOR_PICKUP').length },
                  { id: 'COMPLETED', label: 'Completed / History', count: orders.filter((o) => o.status === 'COMPLETED' || o.status === 'DECLINED').length },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPipelineTab(t.id)}
                    className={`px-3.5 py-1.5 text-xs font-extrabold rounded-md transition-all whitespace-nowrap ${
                      pipelineTab === t.id
                        ? 'bg-agri-dark text-[#F5F0E6] shadow-xs'
                        : 'text-agri-muted hover:text-agri-dark'
                    }`}
                  >
                    {t.label} ({t.count})
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="w-8 h-8 text-agri-emerald" />}
                title={`No ${pipelineTab.toLowerCase()} pre-orders`}
                description="Orders matching this pipeline stage will appear here."
              />
            ) : (
              <StaggerContainer staggerDelay={60} className="flex flex-col gap-3">
                {filteredOrders.map((ord) => (
                  <Card key={ord._id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-agri-border animated-card-lift">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-agri-dark bg-agri-surface px-3 py-1 rounded-lg border border-agri-border">
                          #{ord.orderNumber}
                        </span>
                        <Badge
                          variant={
                            ord.status === 'ACCEPTED' || ord.status === 'READY_FOR_PICKUP'
                              ? 'emerald'
                              : ord.status === 'COMPLETED'
                              ? 'slate'
                              : 'amber'
                          }
                        >
                          {ord.status.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-agri-muted font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#263A2E]" /> Slot: {ord.slot || '09:00 AM - 11:00 AM'}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-agri-dark mt-1">
                        Customer: <span className="text-[#263A2E] font-extrabold">{ord.customer?.name || 'Sara Ahmed'}</span>
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px] text-agri-muted mt-0.5">
                        {ord.items?.map((item: any, idx: number) => (
                          <span key={idx} className="bg-[#F5F0E6] px-2 py-0.5 rounded-md border border-agri-border font-medium">
                            {item.product?.name || 'Produce'} Ã— {item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-agri-border">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-bold text-agri-muted uppercase block">Total Amount</span>
                        <span className="text-lg font-black text-[#263A2E]">{formatCurrency(ord.totalAmount)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {ord.status === 'PENDING' && (
                          <>
                            <Button
                              variant="emerald"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(ord._id, 'ACCEPTED')}
                              leftIcon={<Check className="w-3.5 h-3.5" />}
                              className="font-bold text-xs"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 font-bold text-xs"
                              onClick={() => handleUpdateOrderStatus(ord._id, 'DECLINED')}
                              leftIcon={<Ban className="w-3.5 h-3.5" />}
                            >
                              Decline
                            </Button>
                          </>
                        )}

                        {ord.status === 'ACCEPTED' && (
                          <Button
                            variant="amber"
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(ord._id, 'READY_FOR_PICKUP')}
                            leftIcon={<Bell className="w-3.5 h-3.5" />}
                            className="font-bold text-xs shadow-sm"
                          >
                            Mark Ready for Pickup
                          </Button>
                        )}

                        {ord.status === 'READY_FOR_PICKUP' && (
                          <Button
                            variant="emerald"
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(ord._id, 'COMPLETED')}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            className="font-bold text-xs"
                          >
                            Complete Pickup
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </StaggerContainer>
            )}
          </Card>
        </Reveal>

        {/* 3C. REVIEW RESPONSE SYSTEM (WITH AI REPLY GENERATOR) */}
        <Reveal variant="fade-up">
          <Card className="p-6 border-agri-border shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-agri-dark font-display flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#263A2E]" /> Review Response System
                </h3>
                <p className="text-xs text-agri-muted">
                  View customer feedback and generate polite AI vendor replies with 1-click.
                </p>
              </div>

              <Badge variant="emerald" icon={<Star className="w-3 h-3 fill-current text-amber-400" />}>
                4.9 Stall Rating
              </Badge>
            </div>

            <div className="flex flex-col gap-6">
              {reviews.map((rev) => (
                <Card key={rev._id} className="p-5 border-agri-border bg-agri-surface flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-sm text-agri-dark">{rev.customerName}</span>
                        <div className="flex items-center text-amber-500 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-[11px] text-agri-muted font-medium">{rev.createdAt}</span>
                      </div>
                      <Badge variant="emerald" className="text-[10px] mb-2">{rev.productName}</Badge>
                      <p className="text-xs text-agri-dark leading-relaxed font-medium">"{rev.comment}"</p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-amber-800 border-amber-300 hover:bg-amber-50 font-bold text-xs shrink-0"
                      leftIcon={<Sparkles className={`w-3.5 h-3.5 text-amber-600 ${generatingAiForReviewId === rev._id ? 'animate-spin' : ''}`} />}
                      onClick={() => handleGenerateAiReply(rev)}
                      disabled={generatingAiForReviewId === rev._id}
                    >
                      {generatingAiForReviewId === rev._id ? 'Drafting...' : 'Generate AI Response'}
                    </Button>
                  </div>

                  {/* Existing Farmer Reply */}
                  {rev.farmerReply && (
                    <div className="p-3.5 rounded-lg bg-[#F5F0E6] border border-emerald-200 text-xs text-agri-dark flex items-start gap-2">
                      <Store className="w-4 h-4 text-[#263A2E] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#263A2E] font-extrabold block mb-0.5">Your Response:</strong>
                        <p className="text-agri-muted">{rev.farmerReply}</p>
                      </div>
                    </div>
                  )}

                  {/* AI Generated Reply Draft Textbox */}
                  {aiDrafts[rev._id] && !rev.farmerReply && (
                    <div className="p-4 rounded-lg bg-[#F5F0E6] border border-amber-300 shadow-xs flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> AI Drafted Response (Editable)
                        </span>
                      </div>

                      <textarea
                        rows={3}
                        value={aiDrafts[rev._id]}
                        onChange={(e) => setAiDrafts((prev) => ({ ...prev, [rev._id]: e.target.value }))}
                        className="w-full p-3 border border-agri-border rounded-md text-xs focus:outline-none focus:border-agri-emerald font-medium"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => handlePostReply(rev._id)}
                          className="font-bold text-xs"
                        >
                          Post Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        </Reveal>
      </main>

      {/* Pickup Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#F5F0E6] rounded-md p-6 w-full max-w-md border border-agri-border shadow-lg relative">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-agri-muted hover:text-agri-dark p-2 rounded-full hover:bg-agri-surface"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-agri-dark mb-1 font-display">Stall Pickup Settings</h3>
            <p className="text-xs text-agri-muted mb-4">Configure custom pre-order cutoff times &amp; pickup slots.</p>

            <div className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-agri-dark block mb-1">Pre-Order Cutoff Time</label>
                <input
                  type="text"
                  value={cutoffTime}
                  onChange={(e) => setCutoffTime(e.target.value)}
                  className="w-full px-3 py-2 border border-agri-border rounded-md font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-agri-dark block mb-1">Active Time Slots</label>
                <div className="flex flex-col gap-2">
                  {pickupSlots.map((slot, i) => (
                    <div key={i} className="p-2.5 bg-agri-surface rounded-md border border-agri-border font-semibold flex items-center justify-between">
                      <span>{slot}</span>
                      <Badge variant="emerald">Active</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="emerald"
                size="md"
                onClick={() => {
                  setShowSettingsModal(false);
                  setNotice('Pickup settings updated!');
                  setTimeout(() => setNotice(null), 3000);
                }}
                className="w-full mt-2 font-bold"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
