'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/layout/Sidebar';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { favoritesApi } from '../../../lib/marketplaceApi';
import { Heart, Star, MapPin, ShoppingBag, Leaf } from 'lucide-react';
import Link from 'next/link';

const MOCK_FAVORITES = [
  { _id:'cf1', product:{ _id:'p1', name:'Heirloom Organic Tomatoes', category:'VEGETABLES', basePrice:4.5, unit:'lb', images:['https://images.unsplash.com/photo-1546094096-0df4bcaad337?auto=format&fit=crop&w=400&q=80'], isOrganic:true }, farmer:{ farmName:'Sunnyside Orchards', averageRating:4.9, farmLocation:{ city:'Oakland, CA' } } },
  { _id:'cf2', product:{ _id:'p2', name:'Wildflower Raw Honey', category:'HONEY', basePrice:12, unit:'jar', images:['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80'], isOrganic:true }, farmer:{ farmName:'Meadow Creek Apiary', averageRating:4.8, farmLocation:{ city:'Fremont, CA' } } },
  { _id:'cf3', product:{ _id:'p3', name:'Fresh Basil Bundle', category:'HERBS', basePrice:3.5, unit:'bundle', images:['https://images.unsplash.com/photo-1618375570620-ef9ff7c5ffb7?auto=format&fit=crop&w=400&q=80'], isOrganic:false }, farmer:{ farmName:'Valley Ridge Farms', averageRating:4.7, farmLocation:{ city:'Berkeley, CA' } } },
  { _id:'cf4', product:{ _id:'p4', name:'Artisanal Sourdough Loaf', category:'BAKED GOODS', basePrice:7, unit:'loaf', images:['https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&w=400&q=80'], isOrganic:false }, farmer:{ farmName:'Heritage Hearth Bakery', averageRating:4.9, farmLocation:{ city:'San Jose, CA' } } },
];

export default function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string|null>(null);

  useEffect(()=>{
    favoritesApi.list().then(res=>{
      if(Array.isArray(res.data)&&res.data.length>0) setFavorites(res.data);
      else setFavorites(MOCK_FAVORITES);
    }).catch(()=>setFavorites(MOCK_FAVORITES)).finally(()=>setLoading(false));
  },[]);

  const handleRemove=async(productId:string, favId:string)=>{
    setRemoving(favId);
    try{ await favoritesApi.remove(productId); }catch{}
    setFavorites(prev=>prev.filter(f=>f._id!==favId));
    setRemoving(null);
  };

  return(
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      <Sidebar role="CUSTOMER"/>
      <main className="flex-1 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-agri-dark font-display">Saved Favorites</h1>
          <p className="text-sm text-agri-muted mt-0.5">Products you have saved from local farmers and market vendors.</p>
        </div>

        {loading?(
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-agri-dark border-t-transparent rounded-full animate-spin"/>
          </div>
        ):favorites.length===0?(
          <EmptyState icon={<Heart className="w-8 h-8 text-agri-emerald"/>}
            title="No saved favorites" description="Tap the heart icon on any product to save it here for quick pre-ordering."/>
        ):(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {favorites.map(fav=>{
              const p=fav.product||fav;
              const farmer=fav.farmer||{};
              return(
                <Card key={fav._id} className="overflow-hidden border-agri-border shadow-card animated-card-lift group">
                  <div className="relative h-44 bg-agri-surface overflow-hidden">
                    <img src={p.images?.[0]||''} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-agri-dark/70 to-transparent"/>
                    {p.isOrganic&&(
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#263A2E]/10/90 text-[#F5F0E6] text-[10px] font-bold backdrop-blur-sm">
                        <Leaf className="w-2.5 h-2.5"/> Organic
                      </div>
                    )}
                    <button onClick={()=>handleRemove(p._id,fav._id)} disabled={removing===fav._id}
                      className="absolute top-3 right-3 p-2 rounded-full bg-[#F5F0E6]/90 hover:bg-red-50 text-red-500 transition-all shadow">
                      <Heart className={`w-4 h-4 ${removing===fav._id?'opacity-50':''} fill-current`}/>
                    </button>
                  </div>
                  <div className="p-4">
                    <Badge variant="emerald" className="text-[10px] mb-1.5">{p.category}</Badge>
                    <h3 className="font-extrabold text-sm text-agri-dark leading-snug">{p.name}</h3>
                    <p className="text-[11px] text-agri-muted font-medium mt-1">{farmer.farmName||'Local Farmer'}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-agri-muted">
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/>{farmer.averageRating||4.8}</span>
                      <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3"/>{farmer.farmLocation?.city||'Local Market'}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-agri-border">
                      <span className="text-sm font-black text-[#263A2E]">${p.basePrice}<span className="text-[11px] font-semibold text-agri-muted">/{p.unit}</span></span>
                      <Link href="/products">
                        <button className="flex items-center gap-1 text-[11px] font-bold text-agri-emerald hover:text-agri-dark transition-colors">
                          <ShoppingBag className="w-3.5 h-3.5"/> Pre-Order
                        </button>
                      </Link>
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
