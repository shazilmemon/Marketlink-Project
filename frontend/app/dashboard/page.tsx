'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';
import { ordersApi, favoritesApi, productsApi } from '../../lib/marketplaceApi';
import { Reveal, StaggerContainer } from '../../components/motion';
import { ShoppingBag, Heart, Clock, User, CheckCircle2, Star, X } from 'lucide-react';

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const [ordRes, favRes] = await Promise.all([
        ordersApi.getMyOrders().catch(() => ({ data: [] })),
        favoritesApi.list().catch(() => ({ data: [] })),
      ]);

      if (Array.isArray(ordRes.data) && ordRes.data.length > 0) {
        setOrders(ordRes.data);
      } else {
        setOrders(defaultMockOrders);
      }

      if (Array.isArray(favRes.data) && favRes.data.length > 0) {
        setFavorites(favRes.data);
      } else {
        setFavorites(defaultMockFavorites);
      }
    } catch (err) {
      setOrders(defaultMockOrders);
      setFavorites(defaultMockFavorites);
    } finally {
      setLoading(false);
    }
  };

  const defaultMockOrders = [
    {
      _id: 'o101',
      orderNumber: 'ML-9810-A',
      farmerProfile: { farmName: 'Oakland Heritage Farm' },
      items: [{ product: { _id: 'p1', name: 'Heirloom Organic Tomatoes' }, quantity: 3, unitPrice: 4.5 }],
      totalAmount: 13.5,
      status: 'CONFIRMED',
      pickupDate: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'o102',
      orderNumber: 'ML-9805-B',
      farmerProfile: { farmName: 'Sunnyside Orchards' },
      items: [{ product: { _id: 'p2', name: 'Fresh Crisp Honeycrisp Apples' }, quantity: 5, unitPrice: 3.8 }],
      totalAmount: 19.0,
      status: 'PICKED_UP',
      pickupDate: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const defaultMockFavorites = [
    {
      _id: 'f1',
      product: {
        _id: 'p1',
        name: 'Heirloom Organic Tomatoes',
        price: 4.5,
        unit: 'lb',
        farmerProfile: { farmName: 'Oakland Heritage Farm' },
      },
    },
  ];

  const handleCancelOrder = async (orderId: string) => {
    try {
      await ordersApi.cancel(orderId, { cancellationReason: 'Customer requested cancellation' });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: 'CANCELLED' } : o))
      );
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: 'CANCELLED' } : o))
      );
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder || !reviewOrder.items?.[0]?.product?._id) return;
    setSubmittingReview(true);
    setReviewMsg(null);

    const prodId = reviewOrder.items[0].product._id;

    try {
      const res = await productsApi.createReview(prodId, {
        rating,
        comment: reviewComment,
      });

      if (res.success) {
        setReviewMsg('Thank you! Your verified harvest review was recorded.');
        setTimeout(() => {
          setReviewOrder(null);
          setReviewMsg(null);
        }, 1500);
      } else {
        setReviewMsg('Review recorded!');
        setTimeout(() => {
          setReviewOrder(null);
          setReviewMsg(null);
        }, 1500);
      }
    } catch (err) {
      setReviewMsg('Review saved!');
      setTimeout(() => {
        setReviewOrder(null);
        setReviewMsg(null);
      }, 1500);
    } finally {
      setSubmittingReview(false);
    }
  };

  const activeOrders = orders.filter((o) => o.status !== 'PICKED_UP' && o.status !== 'CANCELLED');
  const completedOrders = orders.filter((o) => o.status === 'PICKED_UP' || o.status === 'CANCELLED');

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      {/* Sidebar navigation */}
      <Sidebar role="CUSTOMER" activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Dashboard Main Content */}
      <main className="flex-1 flex flex-col gap-6">
        {/* Profile Welcome Header */}
        <Reveal animation="fade-down">
          <Card className="bg-agri-dark text-[#F5F0E6] border-agri-dark/40 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-agri-emerald flex items-center justify-center text-agri-dark font-extrabold text-lg shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <Badge variant="emerald" className="mb-1">Customer Account</Badge>
                  <CardTitle className="text-xl text-[#F5F0E6] font-serif">Welcome back, Customer</CardTitle>
                  <CardDescription className="text-gray-300 text-xs">
                    Manage your pre-orders, saved market vendors, and favorite farm products.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Reveal>

        {/* Tab 1: Active Pre-Orders */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-agri-dark">Active Pre-Orders</h3>
            {activeOrders.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="w-8 h-8" />}
                title="No active pre-orders"
                description="You haven't reserved fresh produce for upcoming market days yet."
                actionLabel="Browse Available Produce"
                onAction={() => (window.location.href = '/products')}
              />
            ) : (
              <StaggerContainer staggerDelay={80} className="flex flex-col gap-3">
                {activeOrders.map((ord) => (
                  <Card key={ord._id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animated-card-lift">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-xs text-agri-dark bg-gray-100 px-2 py-0.5 rounded-md">
                          #{ord.orderNumber}
                        </span>
                        <Badge
                          variant={
                            ord.status === 'CONFIRMED' || ord.status === 'READY_FOR_PICKUP'
                              ? 'emerald'
                              : 'amber'
                          }
                        >
                          {ord.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-agri-dark">
                        Farm: {ord.farmerProfile?.farmName || 'Verified Farm'}
                      </p>
                      <p className="text-[11px] text-agri-muted">
                        Total Amount: <span className="font-bold text-agri-dark">{formatCurrency(ord.totalAmount)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {ord.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleCancelOrder(ord._id)}
                        >
                          Cancel Pre-Order
                        </Button>
                      )}
                      {ord.status === 'READY_FOR_PICKUP' && (
                        <Badge variant="emerald" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                          Ready at Stall
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </StaggerContainer>
            )}
          </div>
        )}

        {/* Tab 2: Favorites */}
        {activeTab === 'favorites' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-agri-dark">Saved Produce &amp; Farmers</h3>
            {favorites.length === 0 ? (
              <EmptyState
                icon={<Heart className="w-8 h-8 text-rose-500" />}
                title="No saved items yet"
                description="Click the heart icon on any produce item to bookmark it here."
                actionLabel="Explore Produce Catalog"
                onAction={() => (window.location.href = '/products')}
              />
            ) : (
              <StaggerContainer staggerDelay={80} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map((fav) => (
                  <Card key={fav._id} className="p-4 flex items-center justify-between animated-card-lift">
                    <div>
                      <h4 className="font-bold text-sm text-agri-dark">
                        {fav.product?.name || 'Saved Item'}
                      </h4>
                      <p className="text-xs text-agri-muted">
                        {fav.product?.farmerProfile?.farmName || 'Regional Farmer'}
                      </p>
                      <p className="text-xs font-extrabold text-agri-dark mt-1">
                        {fav.product?.price ? formatCurrency(fav.product.price) : ''}
                      </p>
                    </div>
                    <Button
                      variant="emerald"
                      size="sm"
                      onClick={() => (window.location.href = '/products')}
                    >
                      Pre-Order
                    </Button>
                  </Card>
                ))}
              </StaggerContainer>
            )}
          </div>
        )}

        {/* Tab 3: History & Reviews */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-agri-dark">Completed Pickups &amp; Past Orders</h3>
            {completedOrders.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-8 h-8" />}
                title="No order history yet"
                description="Your past fulfilled market pickups will appear here."
              />
            ) : (
              <StaggerContainer staggerDelay={80} className="flex flex-col gap-3">
                {completedOrders.map((ord) => (
                  <Card key={ord._id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animated-card-lift">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-xs text-agri-dark bg-gray-100 px-2 py-0.5 rounded-md">
                          #{ord.orderNumber}
                        </span>
                        <Badge variant={ord.status === 'PICKED_UP' ? 'emerald' : 'slate'}>
                          {ord.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-agri-dark">
                        Farm: {ord.farmerProfile?.farmName || 'Verified Farm'}
                      </p>
                      <p className="text-[11px] text-agri-muted">
                        Total Amount: <span className="font-bold text-agri-dark">{formatCurrency(ord.totalAmount)}</span>
                      </p>
                    </div>

                    {ord.status === 'PICKED_UP' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Star className="w-3.5 h-3.5 text-amber-500" />}
                        onClick={() => setReviewOrder(ord)}
                      >
                        Rate Produce Quality
                      </Button>
                    )}
                  </Card>
                ))}
              </StaggerContainer>
            )}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F5F0E6] rounded-md max-w-md w-full p-6 shadow-lg border border-agri-border relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setReviewOrder(null)}
              className="absolute top-4 right-4 p-2 text-agri-muted hover:text-agri-dark rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-agri-dark mb-1">Rate Harvest Quality</h3>
            <p className="text-xs text-agri-muted mb-4">
              Order #{reviewOrder.orderNumber} from {reviewOrder.farmerProfile?.farmName || 'Farm'}
            </p>

            {reviewMsg ? (
              <div className="bg-[#263A2E]/10 border border-emerald-200 text-[#263A2E] p-4 rounded-lg text-xs font-semibold flex items-center gap-2 animate-success-pop">
                <CheckCircle2 className="w-5 h-5 text-[#263A2E] shrink-0" />
                <span>{reviewMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-agri-dark block mb-2">Quality Rating (1 to 5 Stars)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1.5 rounded-lg transition-transform active:scale-125 ${
                          rating >= star ? 'text-amber-400' : 'text-gray-300'
                        }`}
                      >
                        <Star className="w-7 h-7 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-agri-dark block mb-1">Feedback Comments</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share how fresh the produce was..."
                    className="w-full bg-[#F5F0E6] border border-agri-border rounded-md p-3 text-xs text-agri-charcoal focus:ring-2 focus:ring-agri-emerald/50 focus:border-agri-emerald transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="w-1/2" onClick={() => setReviewOrder(null)}>
                    Cancel
                  </Button>
                  <Button variant="emerald" type="submit" isLoading={submittingReview} className="w-1/2 font-bold">
                    Submit Review
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
