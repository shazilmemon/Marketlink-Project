'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/layout/Sidebar';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Badge } from '../../../components/ui/Badge';
import { Heart, Star, MapPin, Package } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '../../../lib/utils';

const MOCK_FAVORITES = [
  { _id:'f1', name:'Premium Organic Seeds Co.', category:'SEEDS & SUPPLIES', rating:4.9, reviews:42, location:'Oakland, CA', priceRange:'$3 - $25/pack', image:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80', tags:['Organic','Non-GMO'] },
  { _id:'f2', name:'Sunrise Dairy Collective', category:'DAIRY & CHEESE', rating:4.7, reviews:28, location:'Berkeley, CA', priceRange:'$5 - $18/wheel', image:'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80', tags:['Artisanal','Pastured'] },
  { _id:'f3', name:'Valley Ridge Microgreens', category:'GREENS & HERBS', rating:4.8, reviews:61, location:'Fremont, CA', priceRange:'$4 - $12/tray', image:'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=400&q=80', tags:['Hydroponic','Fresh'] },
];

export default function FarmerFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    // Farmers save other vendor stalls & suppliers as favorites
    setTimeout(()=>{ setFavorites(MOCK_FAVORITES); setLoading(false); }, 500);
  },[]);

  const removeFavorite=(id:string)=>setFavorites(prev=>prev.filter(f=>f._id!==id));

  return(
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      <Sidebar role="FARMER"/>
      <main className="flex-1 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-agri-dark font-display">Saved Favorites</h1>
          <p className="text-sm text-agri-muted mt-0.5">Vendors, suppliers, and market partners you have saved for reference.</p>
        </div>

        {loading?(
          <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-agri-dark border-t-transparent rounded-full animate-spin"/></div>
        ):favorites.length===0?(
          <EmptyState icon={<Heart className="w-8 h-8 text-agri-emerald"/>}
            title="No saved favorites yet" description="Browse the marketplace and save vendors or suppliers you want to revisit."/>
        ):(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites.map(fav=>(
              <Card key={fav._id} className="overflow-hidden border-agri-border shadow-card animated-card-lift group">
                <div className="relative h-40 bg-agri-surface overflow-hidden">
                  <img src={fav.image} alt={fav.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-agri-dark/80 to-transparent"/>
                  <button onClick={()=>removeFavorite(fav._id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-[#F5F0E6]/90 hover:bg-red-50 text-red-500 transition-all shadow">
                    <Heart className="w-4 h-4 fill-current"/>
                  </button>
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                    {fav.tags.map((tag:string)=>(
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F0E6]/20 text-[#F5F0E6] backdrop-blur-sm">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <Badge variant="emerald" className="text-[10px] mb-2">{fav.category}</Badge>
                  <h3 className="font-extrabold text-sm text-agri-dark">{fav.name}</h3>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-agri-muted">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/>{fav.rating} ({fav.reviews})</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{fav.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-agri-border">
                    <span className="text-xs font-bold text-[#263A2E] flex items-center gap-1"><Package className="w-3 h-3"/>{fav.priceRange}</span>
                    <Link href="/markets">
                      <button className="text-[11px] font-bold text-agri-emerald hover:text-agri-dark transition-colors">View Stall ?</button>
                    </Link>
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
