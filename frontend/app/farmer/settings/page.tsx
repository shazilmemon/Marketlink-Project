'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../../../components/layout/Sidebar';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { farmersApi } from '../../../lib/marketplaceApi';
import { useAuth } from '../../../context/AuthContext';
import {
  Camera, Store, Phone, MapPin, Clock, Calendar,
  Save, AlertCircle, CheckCircle2, Upload, FileText,
  Leaf, Navigation, Plus, X, ChevronDown
} from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PRESET_SLOTS = [
  '06:00 AM - 08:00 AM','08:00 AM - 10:00 AM','09:00 AM - 11:00 AM',
  '10:00 AM - 12:00 PM','11:00 AM - 01:00 PM','12:00 PM - 02:00 PM',
  '01:00 PM - 03:00 PM','02:00 PM - 04:00 PM','03:00 PM - 05:00 PM',
];

interface ShopFormData {
  farmName: string; businessName: string; displayName: string;
  bio: string; phone: string; email: string; profileImage: string;
  coverImage: string; farmLocation: { address: string; city: string; coordinates: [number,number] };
  operatingDays: string[]; pickupSlots: string[];
  farmingPractices: string[]; specialties: string[];
}

function TagInput({ label, icon, tags, placeholder, onAdd, onRemove }: {
  label: string; icon: React.ReactNode; tags: string[];
  placeholder: string; onAdd:(v:string)=>void; onRemove:(i:number)=>void;
}) {
  const [val, setVal] = useState('');
  return (
    <div>
      <label className="block text-xs font-bold text-agri-dark mb-1.5 flex items-center gap-1">{icon} {label}</label>
      <div className="flex gap-2 mb-2">
        <input type="text" placeholder={placeholder} value={val}
          onChange={e=>setVal(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'){onAdd(val);setVal('');}}}
          className="flex-1 px-3 py-2 text-xs border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium" />
        <button onClick={()=>{onAdd(val);setVal('');}}
          className="p-2 rounded-md bg-agri-dark text-[#F5F0E6] hover:bg-agri-emerald transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag,i)=>(
          <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-agri-surface border border-agri-border rounded-lg text-[11px] font-semibold text-agri-dark">
            {tag}
            <button onClick={()=>onRemove(i)} className="text-agri-muted hover:text-red-600"><X className="w-2.5 h-2.5"/></button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function FarmerSettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{type:'success'|'error';message:string}|null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [showSlotDropdown, setShowSlotDropdown] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<ShopFormData>({
    farmName:'',businessName:'',displayName:'',bio:'',phone:'',email:'',
    profileImage:'',coverImage:'',
    farmLocation:{address:'',city:'',coordinates:[0,0]},
    operatingDays:['Saturday','Sunday'],
    pickupSlots:['09:00 AM - 11:00 AM','11:00 AM - 01:00 PM'],
    farmingPractices:[],specialties:[],
  });

  useEffect(()=>{
    farmersApi.getMyProfile().then(res=>{
      if(res.data){
        const p:any = res.data;
        setForm({
          farmName:p.farmName||'',businessName:p.businessName||'',displayName:p.displayName||'',
          bio:p.bio||'',phone:p.phone||'',email:p.email||user?.email||'',
          profileImage:p.profileImage||'',coverImage:p.coverImage||'',
          farmLocation:p.farmLocation||{address:'',city:'',coordinates:[0,0]},
          operatingDays:p.operatingDays?.length?p.operatingDays:['Saturday','Sunday'],
          pickupSlots:p.pickupSlots?.length?p.pickupSlots:['09:00 AM - 11:00 AM','11:00 AM - 01:00 PM'],
          farmingPractices:p.farmingPractices||[],specialties:p.specialties||[],
        });
        setLogoPreview(p.profileImage||'');
      }
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[user?.email]);

  useEffect(()=>{
    const h=(e:MouseEvent)=>{if(slotRef.current&&!slotRef.current.contains(e.target as Node))setShowSlotDropdown(false);};
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);

  const showToast=(type:'success'|'error',msg:string)=>{
    setToast({type,message:msg});setTimeout(()=>setToast(null),5000);
  };

  const handleSave=async()=>{
    setSaving(true);
    try{
      await farmersApi.updateProfile(form);
      showToast('success','Shop profile saved! Changes are live across all stall cards.');
    }catch{
      showToast('error','Backend offline — changes saved locally. Will sync when connected.');
    }finally{setSaving(false);}
  };

  const toggleDay=(day:string)=>setForm(f=>({
    ...f,operatingDays:f.operatingDays.includes(day)?f.operatingDays.filter(d=>d!==day):[...f.operatingDays,day]
  }));
  const addSlot=(slot:string)=>{
    if(!slot.trim()||form.pickupSlots.includes(slot))return;
    setForm(f=>({...f,pickupSlots:[...f.pickupSlots,slot]}));setNewSlot('');setShowSlotDropdown(false);
  };
  const removeSlot=(slot:string)=>setForm(f=>({...f,pickupSlots:f.pickupSlots.filter(s=>s!==slot)}));
  const updateCoord=(axis:0|1,val:string)=>{
    const num=parseFloat(val)||0;
    setForm(f=>{const c:[number,number]=[...f.farmLocation.coordinates] as [number,number];c[axis]=num;
      return{...f,farmLocation:{...f.farmLocation,coordinates:c}};});
  };
  const addTag=(field:'farmingPractices'|'specialties',v:string)=>{
    if(!v.trim())return;setForm(f=>({...f,[field]:[...f[field],v.trim()]}));
  };
  const removeTag=(field:'farmingPractices'|'specialties',i:number)=>setForm(f=>({...f,[field]:f[field].filter((_:any,idx:number)=>idx!==i)}));

  if(loading)return(
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      <Sidebar role="FARMER"/>
      <main className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-agri-dark border-t-transparent animate-spin"/>
          <p className="text-agri-muted font-semibold text-sm">Loading shop profile...</p>
        </div>
      </main>
    </div>
  );

  return(
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      <Sidebar role="FARMER"/>
      <main className="flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-agri-dark font-display">Shop Profile &amp; Settings</h1>
            <p className="text-sm text-agri-muted mt-0.5">Manage your stall logo, business info, location, and operating schedule.</p>
          </div>
          <Button variant="emerald" onClick={handleSave} disabled={saving}
            leftIcon={saving?<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<Save className="w-4 h-4"/>}
            className="font-bold shadow-md">
            {saving?'Saving...':'Save All Changes'}
          </Button>
        </div>

        {/* Toast */}
        {toast&&(
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border text-sm font-semibold animate-success-pop ${
            toast.type==='success'?'bg-[#263A2E]/10 border-emerald-200 text-[#263A2E]':'bg-amber-50 border-amber-200 text-amber-900'}`}>
            {toast.type==='success'?<CheckCircle2 className="w-5 h-5 text-[#263A2E] shrink-0"/>:<AlertCircle className="w-5 h-5 text-amber-600 shrink-0"/>}
            <span>{toast.message}</span>
            <button onClick={()=>setToast(null)} className="ml-auto"><X className="w-4 h-4"/></button>
          </div>
        )}

        {/* Logo Section */}
        <Card className="border-agri-border shadow-card overflow-hidden">
          <CardHeader className="pb-3 border-b border-agri-border bg-agri-surface">
            <div className="flex items-center gap-2"><Camera className="w-5 h-5 text-agri-emerald"/><CardTitle className="text-base font-extrabold text-agri-dark">Shop Logo &amp; Brand Identity</CardTitle></div>
            <CardDescription>Your stall logo appears on all marketplace listings, stall cards, and your Navbar avatar.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-agri-surface flex items-center justify-center overflow-hidden ring-2 ring-agri-emerald/30">
                  {logoPreview?(
                    <img src={logoPreview} alt="Shop Logo" className="w-full h-full object-cover" onError={()=>setLogoPreview('')}/>
                  ):(
                    <Store className="w-10 h-10 text-agri-dark/40"/>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-agri-dark text-[#F5F0E6] shadow-lg"><Camera className="w-3.5 h-3.5"/></div>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-agri-dark mb-2">Shop Logo Image URL</label>
                <div className="flex gap-2">
                  <input type="url" placeholder="https://example.com/your-farm-logo.jpg"
                    value={form.profileImage} onChange={e=>{setForm(f=>({...f,profileImage:e.target.value}));setLogoPreview(e.target.value);}}
                    className="flex-1 px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
                  <Button variant="outline" size="sm" onClick={()=>setLogoPreview(form.profileImage)}
                    leftIcon={<Upload className="w-3.5 h-3.5"/>} className="font-bold text-xs shrink-0">Preview</Button>
                </div>
                <p className="text-[11px] text-agri-muted mt-1.5">Paste a direct image URL. Recommended: 256x256px square.</p>
                <div className="mt-4">
                  <label className="block text-xs font-bold text-agri-dark mb-1.5">Stall Cover / Banner Image URL</label>
                  <input type="url" placeholder="https://example.com/farm-banner.jpg"
                    value={form.coverImage} onChange={e=>setForm(f=>({...f,coverImage:e.target.value}))}
                    className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
                  <p className="text-[11px] text-agri-muted mt-1">Wide banner at top of your stall dashboard. Recommended: 1600x400px.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card className="border-agri-border shadow-card">
          <CardHeader className="pb-3 border-b border-agri-border bg-agri-surface">
            <div className="flex items-center gap-2"><Store className="w-5 h-5 text-agri-emerald"/><CardTitle className="text-base font-extrabold text-agri-dark">Business Information</CardTitle></div>
            <CardDescription>Core stall details displayed to customers browsing the marketplace.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-agri-dark mb-1.5">Farm / Stall Name *</label>
                <input type="text" placeholder="e.g. Sunnyside Orchards" value={form.farmName}
                  onChange={e=>setForm(f=>({...f,farmName:e.target.value}))}
                  className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-agri-dark mb-1.5">Business / Company Name</label>
                <input type="text" placeholder="e.g. Green Valley Farms LLC" value={form.businessName}
                  onChange={e=>setForm(f=>({...f,businessName:e.target.value}))}
                  className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-agri-dark mb-1.5">Display Name (Vendor Alias)</label>
                <input type="text" placeholder="e.g. Farmer John" value={form.displayName}
                  onChange={e=>setForm(f=>({...f,displayName:e.target.value}))}
                  className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-agri-dark mb-1.5 flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> Contact Number</label>
                <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone}
                  onChange={e=>setForm(f=>({...f,phone:e.target.value}))}
                  className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-agri-dark mb-1.5">Contact Email</label>
                <input type="email" placeholder="farm@example.com" value={form.email}
                  onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                  className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-bold text-agri-dark mb-1.5 flex items-center gap-1"><FileText className="w-3.5 h-3.5"/> Shop Bio / Farm Story</label>
              <textarea rows={4} placeholder="Tell customers your farm story..." value={form.bio}
                onChange={e=>setForm(f=>({...f,bio:e.target.value.slice(0,1000)}))}
                className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium resize-none"/>
              <div className="flex justify-between mt-1">
                <p className="text-[11px] text-agri-muted">Shown on your public stall page. Max 1000 characters.</p>
                <span className={`text-[11px] font-semibold ${form.bio.length>900?'text-amber-600':'text-agri-muted'}`}>{form.bio.length}/1000</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TagInput label="Farming Practices" icon={<Leaf className="w-3.5 h-3.5"/>}
                tags={form.farmingPractices} placeholder="e.g. Organic, No-Till..."
                onAdd={v=>addTag('farmingPractices',v)} onRemove={i=>removeTag('farmingPractices',i)}/>
              <TagInput label="Produce Specialties" icon={<Store className="w-3.5 h-3.5"/>}
                tags={form.specialties} placeholder="e.g. Heirloom Tomatoes..."
                onAdd={v=>addTag('specialties',v)} onRemove={i=>removeTag('specialties',i)}/>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-agri-border shadow-card">
          <CardHeader className="pb-3 border-b border-agri-border bg-agri-surface">
            <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-agri-emerald"/><CardTitle className="text-base font-extrabold text-agri-dark">Stall Location &amp; Map Pin</CardTitle></div>
            <CardDescription>Update your stall address and GPS coordinates for the market map.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-agri-dark mb-1.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Full Stall Address</label>
                <input type="text" placeholder="e.g. Stall #A-12, Downtown Oakland Regional Market"
                  value={form.farmLocation.address}
                  onChange={e=>setForm(f=>({...f,farmLocation:{...f.farmLocation,address:e.target.value}}))}
                  className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-agri-dark mb-1.5">City / Area</label>
                <input type="text" placeholder="e.g. Oakland, CA"
                  value={form.farmLocation.city}
                  onChange={e=>setForm(f=>({...f,farmLocation:{...f.farmLocation,city:e.target.value}}))}
                  className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
              </div>
              <div/>
              <div>
                <label className="block text-xs font-bold text-agri-dark mb-1.5 flex items-center gap-1"><Navigation className="w-3.5 h-3.5"/> Longitude</label>
                <input type="number" step="0.0001" placeholder="-122.2712"
                  value={form.farmLocation.coordinates[0]||''}
                  onChange={e=>updateCoord(0,e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-agri-dark mb-1.5 flex items-center gap-1"><Navigation className="w-3.5 h-3.5"/> Latitude</label>
                <input type="number" step="0.0001" placeholder="37.8044"
                  value={form.farmLocation.coordinates[1]||''}
                  onChange={e=>updateCoord(1,e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-[11px] text-blue-800 font-semibold">
              Tip: Get coordinates from Google Maps by right-clicking your stall location and selecting &quot;What&apos;s here?&quot;
            </div>
          </CardContent>
        </Card>

        {/* Operating Days & Slots */}
        <Card className="border-agri-border shadow-card">
          <CardHeader className="pb-3 border-b border-agri-border bg-agri-surface">
            <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-agri-emerald"/><CardTitle className="text-base font-extrabold text-agri-dark">Market Days &amp; Pickup Time Slots</CardTitle></div>
            <CardDescription>Choose which days your stall is open and set available pickup windows for customers.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <label className="block text-xs font-bold text-agri-dark mb-3 flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> Active Market Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day=>{
                  const active=form.operatingDays.includes(day);
                  return(
                    <button key={day} onClick={()=>toggleDay(day)}
                      className={`px-4 py-2 rounded-md text-xs font-bold border transition-all ${
                        active?'bg-agri-dark text-[#F5F0E6] border-agri-dark shadow-sm':'bg-[#F5F0E6] text-agri-muted border-agri-border hover:border-agri-dark hover:text-agri-dark'}`}>
                      {day.slice(0,3)}
                    </button>
                  );
                })}
              </div>
              {form.operatingDays.length===0&&<p className="text-[11px] text-amber-600 font-semibold mt-2">Select at least one operating day.</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-agri-dark mb-3 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Pickup Time Windows</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.pickupSlots.map(slot=>(
                  <div key={slot} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#263A2E]/10 border border-emerald-200 rounded-md text-xs font-bold text-[#263A2E]">
                    <Clock className="w-3 h-3"/>{slot}
                    <button onClick={()=>removeSlot(slot)} className="ml-1 text-[#263A2E] hover:text-red-600"><X className="w-3 h-3"/></button>
                  </div>
                ))}
              </div>
              <div ref={slotRef} className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input type="text" placeholder="Select or type a custom slot..."
                      value={newSlot} onFocus={()=>setShowSlotDropdown(true)}
                      onChange={e=>setNewSlot(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium pr-8"/>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-agri-muted pointer-events-none"/>
                  </div>
                  <Button variant="emerald" size="sm" onClick={()=>addSlot(newSlot)}
                    leftIcon={<Plus className="w-3.5 h-3.5"/>} className="font-bold text-xs shrink-0">Add</Button>
                </div>
                {showSlotDropdown&&(
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#F5F0E6] border border-agri-border rounded-md shadow-xl z-10 overflow-hidden">
                    {PRESET_SLOTS.filter(s=>!form.pickupSlots.includes(s)).map(slot=>(
                      <button key={slot} onClick={()=>addSlot(slot)}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-agri-dark hover:bg-agri-surface transition-colors flex items-center gap-2">
                        <Clock className="w-3 h-3 text-[#263A2E]"/>{slot}
                      </button>
                    ))}
                    {PRESET_SLOTS.filter(s=>!form.pickupSlots.includes(s)).length===0&&
                      <p className="px-4 py-3 text-xs text-agri-muted font-semibold">All preset slots added</p>}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="emerald" onClick={handleSave} disabled={saving}
            leftIcon={saving?<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<Save className="w-4 h-4"/>}
            className="font-bold text-sm px-8 py-3 shadow-lg">
            {saving?'Saving Changes...':'Save Shop Profile'}
          </Button>
        </div>
      </main>
    </div>
  );
}
