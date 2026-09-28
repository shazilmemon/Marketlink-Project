'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../../components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Reveal, StaggerContainer } from '../../../components/motion';
import {
  ShieldCheck,
  Users,
  Activity,
  FileText,
  CheckCircle2,
  XCircle,
  Ban,
  Plus,
  Store,
  DollarSign,
  ShoppingBag,
  UserX,
  UserCheck,
  X,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [notice, setNotice] = useState<string | null>(null);

  // Farmers queue state
  const [pendingFarmers, setPendingFarmers] = useState([
    {
      id: 'f1',
      name: 'Organic Heritage Farms',
      owner: 'Sarah Jenkins',
      email: 'sarah@jenkinsfarms.com',
      market: 'Downtown Farmers Market',
      appliedAt: '2026-09-23',
    },
    {
      id: 'f2',
      name: 'Cascadia Berry Co-op',
      owner: 'David Miller',
      email: 'david@cascadiaberry.org',
      market: 'Sunnyside Community Market',
      appliedAt: '2026-09-22',
    },
  ]);

  // Users state
  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'Ali Khan', email: 'farmer1@marketlink.dev', role: 'FARMER', status: 'ACTIVE' },
    { id: 'u2', name: 'Fatima Malik', email: 'farmer2@marketlink.dev', role: 'FARMER', status: 'ACTIVE' },
    { id: 'u3', name: 'Sara Ahmed', email: 'customer1@marketlink.dev', role: 'CUSTOMER', status: 'ACTIVE' },
    { id: 'u4', name: 'John Doe', email: 'johndoe@gmail.com', role: 'CUSTOMER', status: 'ACTIVE' },
  ]);

  // Markets state
  const [marketsList, setMarketsList] = useState([
    { id: 'm1', name: 'Downtown Farmers Market', city: 'Oakland, CA', vendors: 32, status: 'OPEN' },
    { id: 'm2', name: 'Sunnyside Community Market', city: 'Seattle, WA', vendors: 24, status: 'OPEN' },
  ]);

  // New Market Modal State
  const [isAddMarketOpen, setIsAddMarketOpen] = useState(false);
  const [marketName, setMarketName] = useState('');
  const [marketCity, setMarketCity] = useState('');
  const [marketAddress, setMarketAddress] = useState('');

  const handleApproveFarmer = (id: string, name: string) => {
    setPendingFarmers((prev) => prev.filter((f) => f.id !== id));
    setNotice(`Verified farmer application for ${name}!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleRejectFarmer = (id: string, name: string) => {
    setPendingFarmers((prev) => prev.filter((f) => f.id !== id));
    setNotice(`Rejected application for ${name}.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleToggleSuspendUser = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u
      )
    );
  };

  const handleCreateMarket = (e: React.FormEvent) => {
    e.preventDefault();
    const newM = {
      id: `m-${Date.now()}`,
      name: marketName,
      city: marketCity || 'San Jose, CA',
      vendors: 12,
      status: 'OPEN',
    };
    setMarketsList((prev) => [...prev, newM]);
    setIsAddMarketOpen(false);
    setNotice(`New Market "${marketName}" created successfully!`);
    setMarketName('');
    setMarketCity('');
    setMarketAddress('');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      {/* Sidebar navigation */}
      <Sidebar role="ADMIN" activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6">
        {/* Admin Header */}
        <Reveal animation="fade-down">
          <Card className="bg-agri-dark text-[#F5F0E6] border-agri-dark/40 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-agri-emerald flex items-center justify-center text-agri-dark font-extrabold text-lg shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <Badge variant="emerald" className="mb-1">Platform Control Center</Badge>
                  <CardTitle className="text-xl text-[#F5F0E6] font-serif">Administrator Portal</CardTitle>
                  <CardDescription className="text-gray-300 text-xs">
                    Review farmer vendor verification queues, moderate user access, and inspect platform reports.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Reveal>

        {notice && (
          <div className="p-4 rounded-lg bg-[#263A2E]/10 border border-emerald-200 text-[#263A2E] text-xs font-bold flex items-center gap-2 animate-success-pop">
            <CheckCircle2 className="w-4 h-4 text-[#263A2E] shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Tab 1: Platform Metrics & Activity Reports */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <StaggerContainer staggerDelay={80} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="animated-card-lift">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold">Total Platform Users</CardDescription>
                  <CardTitle className="text-3xl font-black text-agri-dark">{usersList.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="animated-card-lift">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold">Active Regional Markets</CardDescription>
                  <CardTitle className="text-3xl font-black text-[#263A2E]">{marketsList.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="animated-card-lift">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold">Pending Farmer Approvals</CardDescription>
                  <CardTitle className="text-3xl font-black text-amber-600">{pendingFarmers.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="animated-card-lift">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold">System Health</CardDescription>
                  <CardTitle className="text-3xl font-black text-[#263A2E]">100% Operational</CardTitle>
                </CardHeader>
              </Card>
            </StaggerContainer>

            {/* Platform Activity Reports */}
            <Reveal animation="fade-up" delay={150}>
              <Card className="p-6 border-agri-border">
                <h3 className="font-extrabold text-agri-dark text-base font-serif mb-2">Platform Activity Summary</h3>
                <p className="text-xs text-agri-muted mb-4">Real-time aggregate pre-order volume and farm registration metrics.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-agri-border pt-4 text-xs font-semibold">
                  <div className="p-3 rounded-md bg-agri-surface">
                    <span className="text-agri-muted block">Weekly Pre-Order GMV</span>
                    <span className="text-lg font-black text-[#263A2E]">$4,850.00</span>
                  </div>
                  <div className="p-3 rounded-md bg-agri-surface">
                    <span className="text-agri-muted block">Surplus Crops Saved</span>
                    <span className="text-lg font-black text-amber-700">1,240 lbs</span>
                  </div>
                  <div className="p-3 rounded-md bg-agri-surface">
                    <span className="text-agri-muted block">Traceability QR Scans</span>
                    <span className="text-lg font-black text-agri-dark">890 verified</span>
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>
        )}

        {/* Tab 2: Farmer Approvals Queue */}
        {activeTab === 'verifications' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-agri-dark">Pending Farmer Verification Queue</h3>
            {pendingFarmers.length === 0 ? (
              <Card className="p-8 text-center text-xs text-agri-muted font-semibold">
                No pending farmer applications in queue.
              </Card>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farm Name</TableHead>
                    <TableHead>Owner / Email</TableHead>
                    <TableHead>Target Market</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingFarmers.map((f) => (
                    <TableRow key={f.id} className="transition-colors duration-150">
                      <TableCell className="font-bold">{f.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs">{f.owner}</span>
                          <span className="text-[11px] text-agri-muted">{f.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{f.market}</TableCell>
                      <TableCell className="text-xs">{f.appliedAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="emerald"
                            size="sm"
                            onClick={() => handleApproveFarmer(f.id, f.name)}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectFarmer(f.id, f.name)}
                            leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}

        {/* Tab 3: Users Directory & Suspension */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-agri-dark">User Directory &amp; Account Controls</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Account Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersList.map((u) => (
                  <TableRow key={u.id} className="transition-colors duration-150">
                    <TableCell className="font-bold text-xs">{u.name}</TableCell>
                    <TableCell className="text-xs text-agri-muted">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'FARMER' ? 'emerald' : 'slate'}>{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {u.status === 'ACTIVE' ? (
                        <span className="text-[11px] font-bold text-[#263A2E] bg-[#263A2E]/10 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                          Suspended
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={u.status === 'ACTIVE' ? 'outline' : 'emerald'}
                        size="sm"
                        onClick={() => handleToggleSuspendUser(u.id)}
                        className={u.status === 'ACTIVE' ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : ''}
                        leftIcon={u.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Tab 4: Markets Management */}
        {activeTab === 'markets' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-agri-dark">Registered Markets Directory</h3>
              <Button
                variant="emerald"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAddMarketOpen(true)}
              >
                Add Market
              </Button>
            </div>

            <StaggerContainer staggerDelay={80} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketsList.map((m) => (
                <Card key={m.id} className="p-5 flex items-center justify-between animated-card-lift">
                  <div>
                    <h4 className="font-extrabold text-agri-dark text-base">{m.name}</h4>
                    <p className="text-xs text-agri-muted">{m.city}</p>
                    <span className="text-xs font-semibold text-[#263A2E] mt-2 inline-block">
                      {m.vendors} Active Stalls
                    </span>
                  </div>
                  <Badge variant="emerald" icon={<Store className="w-3.5 h-3.5" />}>
                    {m.status}
                  </Badge>
                </Card>
              ))}
            </StaggerContainer>
          </div>
        )}
      </main>

      {/* Add Market Modal */}
      {isAddMarketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#F5F0E6] rounded-md p-6 w-full max-w-md border border-agri-border shadow-lg relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddMarketOpen(false)}
              className="absolute top-4 right-4 text-agri-muted hover:text-agri-dark p-2 rounded-full hover:bg-agri-surface"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-agri-dark mb-1 font-serif">Add New Market</h3>
            <p className="text-xs text-agri-muted mb-4">Register a new regional weekend farmers market location.</p>

            <form onSubmit={handleCreateMarket} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-agri-dark block mb-1">Market Name</label>
                <Input
                  placeholder="e.g. San Jose Organic Farmers Exchange"
                  value={marketName}
                  onChange={(e) => setMarketName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-agri-dark block mb-1">City / Region</label>
                <Input
                  placeholder="e.g. San Jose, CA"
                  value={marketCity}
                  onChange={(e) => setMarketCity(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-agri-dark block mb-1">Street Address</label>
                <Input
                  placeholder="e.g. 925 Blossom Hill Rd"
                  value={marketAddress}
                  onChange={(e) => setMarketAddress(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="w-1/2" onClick={() => setIsAddMarketOpen(false)}>
                  Cancel
                </Button>
                <Button variant="emerald" type="submit" className="w-1/2 font-bold">
                  Save Market
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
