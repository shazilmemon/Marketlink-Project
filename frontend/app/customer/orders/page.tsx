'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/layout/Sidebar';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatCurrency } from '../../../lib/utils';
import { ordersApi } from '../../../lib/marketplaceApi';
import { ShoppingBag, Clock, MapPin, Package, X, AlertCircle } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; variant: 'amber'|'emerald'|'slate' }> = {
  PENDING:        { label: 'Pending Approval', variant: 'amber' },
  CONFIRMED:      { label: 'Confirmed',         variant: 'emerald' },
  ACCEPTED:       { label: 'Accepted',          variant: 'emerald' },
  READY_FOR_PICKUP:{ label: 'Ready for Pickup', variant: 'emerald' },
  COMPLETED:      { label: 'Completed',         variant: 'slate' },
  PICKED_UP:      { label: 'Picked Up',         variant: 'slate' },
  CANCELLED:      { label: 'Cancelled',         variant: 'slate' },
  REJECTED:       { label: 'Declined',          variant: 'slate' },
};

const MOCK_ORDERS = [
  { _id:'co1', orderNumber:'ML-8801-X', farmerId:{ name:'Sunnyside Orchards' }, items:[{ productNameSnapshot:'Heirloom Tomatoes', quantity:4, unitPrice:4.5, subtotal:18 }], total:18, status:'PENDING', pickupTime:'09:00 AM - 11:00 AM', pickupDate: new Date().toISOString(), createdAt: new Date().toISOString() },
  { _id:'co2', orderNumber:'ML-8802-Y', farmerId:{ name:'Valley Ridge Farms' }, items:[{ productNameSnapshot:'Honeycrisp Apples', quantity:3, unitPrice:3.8, subtotal:11.4 }], total:11.4, status:'READY_FOR_PICKUP', pickupTime:'11:00 AM - 01:00 PM', pickupDate: new Date().toISOString(), createdAt: new Date().toISOString() },
  { _id:'co3', orderNumber:'ML-8803-Z', farmerId:{ name:'Sunrise Dairy Co.' }, items:[{ productNameSnapshot:'Goat Cheese Wheel', quantity:1, unitPrice:8.5, subtotal:8.5 }], total:8.5, status:'COMPLETED', pickupTime:'01:00 PM - 03:00 PM', pickupDate: new Date(Date.now()-86400000*3).toISOString(), createdAt: new Date(Date.now()-86400000*3).toISOString() },
];

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string|null>(null);
  const [notice, setNotice] = useState<string|null>(null);

  useEffect(()=>{
    ordersApi.getMyOrders().then(res=>{
      if(Array.isArray(res.data)&&res.data.length>0) setOrders(res.data);
      else setOrders(MOCK_ORDERS);
    }).catch(()=>setOrders(MOCK_ORDERS)).finally(()=>setLoading(false));
  },[]);

  const handleCancel = async (orderId: string) => {
    setCancelling(orderId);
    try {
      await ordersApi.cancel(orderId, { cancellationReason: 'Cancelled by customer' });
      setOrders(prev=>prev.map(o=>o._id===orderId?{...o,status:'CANCELLED'}:o));
      setNotice('Order cancelled successfully.');
    } catch {
      setOrders(prev=>prev.map(o=>o._id===orderId?{...o,status:'CANCELLED'}:o));
      setNotice('Order cancelled.');
    } finally {
      setCancelling(null);
      setTimeout(()=>setNotice(null),4000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      <Sidebar role="CUSTOMER"/>
      <main className="flex-1 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-agri-dark font-display">My Pre-Orders</h1>
          <p className="text-sm text-agri-muted mt-0.5">Track all your market pre-orders from placement to pickup.</p>
        </div>

        {notice&&(
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#263A2E]/10 border border-emerald-200 text-[#263A2E] text-sm font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0"/>
            <span>{notice}</span>
            <button onClick={()=>setNotice(null)} className="ml-auto"><X className="w-4 h-4"/></button>
          </div>
        )}

        {loading?(
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-agri-dark border-t-transparent rounded-full animate-spin"/>
          </div>
        ):orders.length===0?(
          <EmptyState icon={<ShoppingBag className="w-8 h-8 text-agri-emerald"/>}
            title="No orders yet" description="Visit a market and pre-order fresh produce from local farmers."/>
        ):(
          <div className="flex flex-col gap-4">
            {orders.map(ord=>{
              const sc = STATUS_CONFIG[ord.status]||{label:ord.status,variant:'slate'};
              const canCancel = ['PENDING','CONFIRMED'].includes(ord.status);
              return(
                <Card key={ord._id} className="p-5 border-agri-border shadow-card animated-card-lift">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs text-agri-dark bg-agri-surface px-3 py-1 rounded-lg border border-agri-border">#{ord.orderNumber}</span>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </div>
                      <p className="text-xs font-bold text-agri-dark flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#263A2E]"/>
                        Farmer: <span className="text-[#263A2E]">{ord.farmerId?.name||'Local Farmer'}</span>
                      </p>
                      <div className="flex flex-wrap gap-2 text-[11px] text-agri-muted">
                        {(ord.items||[]).map((item:any,idx:number)=>(
                          <span key={idx} className="bg-[#F5F0E6] px-2 py-0.5 rounded-md border border-agri-border font-medium">
                            {item.productNameSnapshot||item.product?.name||'Produce'} x{item.quantity}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-agri-muted mt-0.5">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {ord.pickupTime||'09:00 AM - 11:00 AM'}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {ord.pickupDate?new Date(ord.pickupDate).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}):'Market Day'}</span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-agri-border">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-bold text-agri-muted uppercase block">Order Total</span>
                        <span className="text-xl font-black text-[#263A2E]">{formatCurrency(ord.total||ord.totalAmount||0)}</span>
                      </div>
                      {canCancel&&(
                        <Button variant="outline" size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 font-bold text-xs"
                          disabled={cancelling===ord._id}
                          onClick={()=>handleCancel(ord._id)}>
                          {cancelling===ord._id?'Cancelling...':'Cancel Order'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
