'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../../components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { User, Mail, Phone, Lock, Bell, Shield, Save, CheckCircle2, X, Eye, EyeOff } from 'lucide-react';

export default function CustomerSettingsPage() {
  const { user } = useAuth();
  const [toast, setToast] = useState<{type:'success'|'error';message:string}|null>(null);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name||'',
    email: user?.email||'',
    phone: '',
    avatar: user?.avatar||'',
  });

  const [passwordForm, setPasswordForm] = useState({
    current:'', newPass:'', confirm:''
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    pickupReminders: true,
    marketAlerts: false,
    promotions: false,
  });

  const showToast=(type:'success'|'error',msg:string)=>{
    setToast({type,message:msg});
    setTimeout(()=>setToast(null),5000);
  };

  const handleSaveProfile=async()=>{
    setSaving(true);
    await new Promise(r=>setTimeout(r,800));
    showToast('success','Profile updated successfully!');
    setSaving(false);
  };

  const handleChangePassword=async()=>{
    if(!passwordForm.current||!passwordForm.newPass){
      showToast('error','Please fill in all password fields.');
      return;
    }
    if(passwordForm.newPass!==passwordForm.confirm){
      showToast('error','New passwords do not match.');
      return;
    }
    setSaving(true);
    await new Promise(r=>setTimeout(r,800));
    showToast('success','Password changed successfully!');
    setPasswordForm({current:'',newPass:'',confirm:''});
    setSaving(false);
  };

  return(
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      <Sidebar role="CUSTOMER"/>
      <main className="flex-1 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-agri-dark font-display">Account Settings</h1>
          <p className="text-sm text-agri-muted mt-0.5">Manage your profile, security, and notification preferences.</p>
        </div>

        {toast&&(
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border text-sm font-semibold ${toast.type==='success'?'bg-[#263A2E]/10 border-emerald-200 text-[#263A2E]':'bg-red-50 border-red-200 text-red-900'}`}>
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${toast.type==='success'?'text-[#263A2E]':'text-red-600'}`}/>
            <span>{toast.message}</span>
            <button onClick={()=>setToast(null)} className="ml-auto"><X className="w-4 h-4"/></button>
          </div>
        )}

        {/* Profile Info */}
        <Card className="border-agri-border shadow-card">
          <CardHeader className="pb-3 border-b border-agri-border bg-agri-surface">
            <div className="flex items-center gap-2"><User className="w-5 h-5 text-agri-emerald"/><CardTitle className="text-base font-extrabold text-agri-dark">Personal Information</CardTitle></div>
            <CardDescription>Update your display name, email and contact details.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-agri-dark mb-1.5 flex items-center gap-1"><User className="w-3.5 h-3.5"/> Full Name</label>
                <input type="text" value={profileForm.name} onChange={e=>setProfileForm(f=>({...f,name:e.target.value}))}
                  className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-agri-dark mb-1.5 flex items-center gap-1"><Mail className="w-3.5 h-3.5"/> Email Address</label>
                <input type="email" value={profileForm.email} onChange={e=>setProfileForm(f=>({...f,email:e.target.value}))}
                  className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-agri-dark mb-1.5 flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> Phone Number</label>
                <input type="tel" placeholder="+1 (555) 000-0000" value={profileForm.phone} onChange={e=>setProfileForm(f=>({...f,phone:e.target.value}))}
                  className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-agri-dark mb-1.5">Profile Avatar URL</label>
                <input type="url" placeholder="https://example.com/avatar.jpg" value={profileForm.avatar} onChange={e=>setProfileForm(f=>({...f,avatar:e.target.value}))}
                  className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium"/>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <Button variant="emerald" onClick={handleSaveProfile} disabled={saving}
                leftIcon={saving?<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<Save className="w-4 h-4"/>}
                className="font-bold">
                {saving?'Saving...':'Save Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card className="border-agri-border shadow-card">
          <CardHeader className="pb-3 border-b border-agri-border bg-agri-surface">
            <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-agri-emerald"/><CardTitle className="text-base font-extrabold text-agri-dark">Change Password</CardTitle></div>
            <CardDescription>Update your account password. Use at least 8 characters.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id:'current', label:'Current Password', val:passwordForm.current, key:'current' },
                { id:'new', label:'New Password', val:passwordForm.newPass, key:'newPass' },
                { id:'confirm', label:'Confirm New Password', val:passwordForm.confirm, key:'confirm' },
              ].map(f=>(
                <div key={f.id}>
                  <label className="block text-xs font-bold text-agri-dark mb-1.5">{f.label}</label>
                  <div className="relative">
                    <input type={showPass?'text':'password'} value={f.val}
                      onChange={e=>setPasswordForm(prev=>({...prev,[f.key]:e.target.value}))}
                      className="w-full px-3 py-2.5 text-sm border border-agri-border rounded-md focus:outline-none focus:border-agri-emerald font-medium pr-9"/>
                    <button type="button" onClick={()=>setShowPass(s=>!s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-agri-muted">
                      {showPass?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-5">
              <Button variant="outline" onClick={handleChangePassword} disabled={saving}
                leftIcon={<Shield className="w-4 h-4"/>} className="font-bold text-agri-dark border-agri-border">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-agri-border shadow-card">
          <CardHeader className="pb-3 border-b border-agri-border bg-agri-surface">
            <div className="flex items-center gap-2"><Bell className="w-5 h-5 text-agri-emerald"/><CardTitle className="text-base font-extrabold text-agri-dark">Notification Preferences</CardTitle></div>
            <CardDescription>Choose which updates and alerts you would like to receive.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {[
                { id:'orderUpdates', label:'Order Status Updates', desc:'Get notified when your order is accepted, ready, or completed.' },
                { id:'pickupReminders', label:'Pickup Reminders', desc:'Receive reminder alerts before your scheduled pickup window.' },
                { id:'marketAlerts', label:'Market Day Alerts', desc:'Be notified when new market days or pop-up events are added.' },
                { id:'promotions', label:'Promotions & Deals', desc:'Seasonal deals and bulk discount alerts from local vendors.' },
              ].map(item=>(
                <div key={item.id} className="flex items-start justify-between gap-4 p-4 rounded-lg bg-agri-surface border border-agri-border">
                  <div>
                    <p className="text-sm font-bold text-agri-dark">{item.label}</p>
                    <p className="text-[11px] text-agri-muted mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={()=>setNotifications(n=>({...n,[item.id]:!n[item.id as keyof typeof n]}))}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifications[item.id as keyof typeof notifications]?'bg-agri-emerald':'bg-gray-200'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-[#F5F0E6] shadow transition-all ${notifications[item.id as keyof typeof notifications]?'left-6':'left-1'}`}/>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-5">
              <Button variant="emerald" onClick={()=>showToast('success','Notification preferences saved!')}
                leftIcon={<Save className="w-4 h-4"/>} className="font-bold">
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
