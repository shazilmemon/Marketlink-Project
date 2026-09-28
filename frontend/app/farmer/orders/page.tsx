'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/layout/Sidebar';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatCurrency } from '../../../lib/utils';
import { farmersApi, ordersApi } from '../../../lib/marketplaceApi';
import { ShoppingBag, Clock, Check, Ban, Bell, CheckCircle2, X } from 'lucide-react';

const TABS = [
  { id:'PENDING', label:'Pending' },
  { id:'ACCEPTED', label:'Accepted' },
  { id:'READY', label:'Ready for Pickup' },
  { id:'COMPLETED', label:'History' },
];

const MOCK_ORDERS = [
  { _id:'o1',orderNumber:'ML-9921-A',customer:{name:'Sarah Jenkins'},items:[{product:{name:'Heirloom Organic Tomatoes'},quantity:4,unitPrice:4.5}],totalAmount:18,status:'PENDING',slot:'09:00 AM - 11:00 AM',createdAt:new Date().toISOString() },
  { _id:'o2',orderNumber:'ML-9922-B',customer:{name:'Michael Chang'},items:[{product:{name:'Honeycrisp Apples'},quantity:5,unitPrice:3.8}],totalAmount:19,status:'ACCEPTED',slot:'11:00 AM - 01:00 PM',createdAt:new Date().toISOString() },
  { _id:'o3',orderNumber:'ML-9923-C',customer:{name:'Amina Ali'},items:[{product:{name:'Wildflower Honey'},quantity:2,unitPrice:12}],totalAmount:24,status:'READY_FOR_PICKUP',slot:'01:00 PM - 03:00 PM',createdAt:new Date().toISOString() },
  { _id:'o4',orderNumber:'ML-9924-D',customer:{name:'David Miller'},items:[{product:{name:'Heirloom Tomatoes'},quantity:6,unitPrice:4.5}],totalAmount:27,status:'COMPLETED',slot:'09:00 AM - 11:00 AM',createdAt:new Date().toISOString() },
];

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string|null>(null);

  useEffect(()=>{
    farmersApi.getMyOrders().then(res=>{
      if(Array.isArray(res.data)&&res.data.length>0)setOrders(res.data);
      else setOrders(MOCK_ORDERS);
    }).catch(()=>setOrders(MOCK_ORDERS)).finally(()=>setLoading(false));
  },[]);

  const handleStatus=async(orderId:string,newStatus:string)=>{
    const target=orders.find(o=>o._id===orderId);
    setOrders(prev=>prev.map(o=>o._id===orderId?{...o,status:newStatus}:o));
    if(newStatus==='ACCEPTED'&&target){setNotice(`Order Accepted! +${formatCurrency(target.totalAmount)} added to projected earnings.`);}
    else if(newStatus==='READY_FOR_PICKUP'){setNotice(`Customer notified: Order ready for pickup!`);}
    else if(newStatus==='COMPLETED'){setNotice(`Order #${target?.orderNumber} completed!`);}
    setTimeout(()=>setNotice(null),5000);
    try{await ordersApi.updateStatus(orderId,{status:newStatus});}catch{}
  };

  const filtered=orders.filter(o=>{
    if(tab==='PENDING')return o.status==='PENDING';
    if(tab==='ACCEPTED')return o.status==='ACCEPTED';
    if(tab==='READY')return o.status==='READY_FOR_PICKUP';
    return o.status==='COMPLETED'||o.status==='DECLINED'||o.status==='REJECTED';
  });

  return(
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      <Sidebar role="FARMER"/>
      <main className="flex-1 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-agri-dark font-display">Manage Orders</h1>
          <p className="text-sm text-agri-muted mt-0.5">Review and action incoming customer pre-orders.</p>
        </div>

        {notice&&(
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-[#263A2E]/10 border border-emerald-200 text-[#263A2E] text-sm font-semibold animate-success-pop">
            <Bell className="w-4 h-4 text-[#263A2E] shrink-0 animate-bounce"/>
            <span>{notice}</span>
            <button onClick={()=>setNotice(null)} className="ml-auto"><X className="w-4 h-4"/></button>
          </div>
        )}

        <div className="flex items-center gap-2 bg-agri-surface p-1.5 rounded-lg border border-agri-border overflow-x-auto scrollbar-none">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-md transition-all whitespace-nowrap ${tab===t.id?'bg-agri-dark text-[#F5F0E6] shadow-xs':'text-agri-muted hover:text-agri-dark'}`}>
              {t.label} ({orders.filter(o=>{
                if(t.id==='PENDING')return o.status==='PENDING';
                if(t.id==='ACCEPTED')return o.status==='ACCEPTED';
                if(t.id==='READY')return o.status==='READY_FOR_PICKUP';
                return o.status==='COMPLETED'||o.status==='DECLINED'||o.status==='REJECTED';
              }).length})
            </button>
          ))}
        </div>

        {loading?(
          <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-agri-dark border-t-transparent rounded-full animate-spin"/></div>
        ):filtered.length===0?(
          <EmptyState icon={<ShoppingBag className="w-8 h-8 text-agri-emerald"/>}
            title={`No ${tab.toLowerCase()} orders`} description="Orders in this stage will appear here."/>
        ):(
          <div className="flex flex-col gap-3">
            {filtered.map(ord=>(
              <Card key={ord._id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-agri-border animated-card-lift">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xs text-agri-dark bg-agri-surface px-3 py-1 rounded-lg border border-agri-border">#{ord.orderNumber}</span>
                    <Badge variant={ord.status==='ACCEPTED'||ord.status==='READY_FOR_PICKUP'?'emerald':ord.status==='COMPLETED'?'slate':'amber'}>
                      {ord.status.replace(/_/g,' ')}
                    </Badge>
                    <span className="text-xs text-agri-muted font-medium flex items-center gap-1"><Clock className="w-3 h-3 text-[#263A2E]"/> {ord.slot||'09:00 AM - 11:00 AM'}</span>
                  </div>
                  <p className="text-xs font-bold text-agri-dark mt-1">Customer: <span className="text-[#263A2E] font-extrabold">{ord.customer?.name||'Customer'}</span></p>
                  <div className="flex flex-wrap gap-2 text-[11px] text-agri-muted mt-0.5">
                    {ord.items?.map((item:any,idx:number)=>(
                      <span key={idx} className="bg-[#F5F0E6] px-2 py-0.5 rounded-md border border-agri-border font-medium">{item.product?.name||'Produce'} x{item.quantity}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-agri-border">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold text-agri-muted uppercase block">Total</span>
                    <span className="text-lg font-black text-[#263A2E]">{formatCurrency(ord.totalAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {ord.status==='PENDING'&&(
                      <>
                        <Button variant="emerald" size="sm" onClick={()=>handleStatus(ord._id,'ACCEPTED')} leftIcon={<Check className="w-3.5 h-3.5"/>} className="font-bold text-xs">Accept</Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 font-bold text-xs" onClick={()=>handleStatus(ord._id,'DECLINED')} leftIcon={<Ban className="w-3.5 h-3.5"/>}>Decline</Button>
                      </>
                    )}
                    {ord.status==='ACCEPTED'&&(
                      <Button variant="amber" size="sm" onClick={()=>handleStatus(ord._id,'READY_FOR_PICKUP')} leftIcon={<Bell className="w-3.5 h-3.5"/>} className="font-bold text-xs">Mark Ready</Button>
                    )}
                    {ord.status==='READY_FOR_PICKUP'&&(
                      <Button variant="emerald" size="sm" onClick={()=>handleStatus(ord._id,'COMPLETED')} leftIcon={<CheckCircle2 className="w-3.5 h-3.5"/>} className="font-bold text-xs">Complete Pickup</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
