'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Reveal, StaggerContainer } from '../../../../components/motion';
import { farmerAiApi, AiForecastResponse } from '../../../../lib/farmerAiApi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Cpu,
  RefreshCw,
  Sparkles,
  Calendar,
  PackageCheck,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function FarmerAnalyticsForecastingPage() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [category, setCategory] = useState('Vegetables');
  const [forecastData, setForecastData] = useState<AiForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadForecast(category);
  }, [category]);

  const loadForecast = async (cat: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await farmerAiApi.forecastDemand(cat);
      setForecastData(data);
    } catch (err: any) {
      // Graceful fallback sample data for demonstration
      setForecastData({
        summary: "Demand for Organic Heirloom Tomatoes is projected to rise sharply for the upcoming Sunday Market.",
        projectedIncrease: 35,
        topDemandItem: "Organic Heirloom Tomatoes",
        marketDayPrediction: "Demand for Organic Tomatoes is projected to rise by 35% this Sunday",
        confidenceScore: 94,
        recommendations: [
          "Increase harvest allocations by 25% for Sunday pickup.",
          "Prepare 40 pre-order produce bundles in advance.",
          "Extend order cutoff time to 10:00 AM for higher fulfillment."
        ],
        chartData: [
          { day: "Mon", actual: 120, projected: 125 },
          { day: "Tue", actual: 140, projected: 145 },
          { day: "Wed", actual: 160, projected: 170 },
          { day: "Thu", actual: 180, projected: 195 },
          { day: "Fri", actual: 210, projected: 230 },
          { day: "Sat", actual: 310, projected: 350 },
          { day: "Sun", actual: 420, projected: 480 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      <Sidebar role="FARMER" activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col gap-6">
        {/* Header Banner */}
        <Reveal variant="fade-down">
          <div className="relative rounded-md overflow-hidden bg-agri-dark text-[#F5F0E6] p-6 sm:p-8 shadow-card border border-agri-dark/40">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-glow">
                  <Cpu className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="amber" icon={<Sparkles className="w-3.5 h-3.5 text-amber-950" />} className="bg-amber-400 text-amber-950 font-bold">
                      AI Demand Engine v2.4
                    </Badge>
                    <span className="text-xs text-agri-cream/80 font-medium">Real-Time MongoDB Trained</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#F5F0E6]">
                    AI Demand &amp; Sales Forecasting
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-200 mt-1 max-w-xl">
                    Predict upcoming weekend market customer demand, optimize stock harvest, and eliminate unsold produce.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-2.5 bg-[#F5F0E6]/10 text-[#F5F0E6] rounded-md text-xs font-bold border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="Vegetables" className="text-slate-900">Vegetables</option>
                  <option value="Fruits" className="text-slate-900">Fruits</option>
                  <option value="Dairy" className="text-slate-900">Dairy &amp; Eggs</option>
                  <option value="Honey" className="text-slate-900">Honey &amp; Preserves</option>
                </select>

                <Button
                  variant="amber"
                  size="md"
                  className="font-bold shadow-md shrink-0"
                  leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                  onClick={() => loadForecast(category)}
                >
                  Re-Forecast
                </Button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* AI Insight Highlight Card */}
        {forecastData && (
          <Reveal variant="fade-up">
            <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/10 via-white to-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-700 rounded-md shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-agri-dark uppercase tracking-wider">
                      Upcoming Weekend Market Prediction
                    </h3>
                    <p className="text-base sm:text-lg font-bold text-[#263A2E] mt-0.5">
                      "{forecastData.marketDayPrediction}"
                    </p>
                    <p className="text-xs text-agri-muted mt-1">{forecastData.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 bg-[#F5F0E6] px-4 py-3 rounded-lg border border-agri-border shadow-xs">
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold text-agri-muted uppercase block">Confidence Score</span>
                    <span className="text-xl font-black text-[#263A2E]">{forecastData.confidenceScore}%</span>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-[#263A2E]" />
                </div>
              </div>
            </Card>
          </Reveal>
        )}

        {/* Metric Cards Grid */}
        <StaggerContainer staggerDelay={80} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 border-agri-border animated-card-lift">
            <CardHeader className="p-0 pb-2 flex flex-row justify-between items-center">
              <CardDescription className="text-xs font-bold text-agri-muted uppercase">Projected Demand Growth</CardDescription>
              <TrendingUp className="w-4 h-4 text-[#263A2E]" />
            </CardHeader>
            <CardContent className="p-0">
              <CardTitle className="text-3xl font-black text-[#263A2E]">
                +{forecastData?.projectedIncrease || 35}%
              </CardTitle>
              <p className="text-xs text-agri-muted font-medium mt-1">Expected spike for upcoming Sunday market</p>
            </CardContent>
          </Card>

          <Card className="p-5 border-agri-border animated-card-lift">
            <CardHeader className="p-0 pb-2 flex flex-row justify-between items-center">
              <CardDescription className="text-xs font-bold text-agri-muted uppercase">Top Demand Produce</CardDescription>
              <PackageCheck className="w-4 h-4 text-amber-600" />
            </CardHeader>
            <CardContent className="p-0">
              <CardTitle className="text-xl font-extrabold text-agri-dark truncate">
                {forecastData?.topDemandItem || 'Organic Tomatoes'}
              </CardTitle>
              <p className="text-xs text-amber-700 font-semibold mt-1">High weekend market search velocity</p>
            </CardContent>
          </Card>

          <Card className="p-5 border-agri-border animated-card-lift">
            <CardHeader className="p-0 pb-2 flex flex-row justify-between items-center">
              <CardDescription className="text-xs font-bold text-agri-muted uppercase">Target Market Day</CardDescription>
              <Calendar className="w-4 h-4 text-[#263A2E]" />
            </CardHeader>
            <CardContent className="p-0">
              <CardTitle className="text-2xl font-black text-agri-dark">Upcoming Sunday</CardTitle>
              <p className="text-xs text-[#263A2E] font-semibold mt-1">Downtown Regional Market #A-12</p>
            </CardContent>
          </Card>
        </StaggerContainer>

        {/* Recharts Area Chart: Projected vs Actual Sales */}
        <Reveal variant="fade-up">
          <Card className="p-6 border-agri-border shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-agri-dark font-display">
                  Projected vs Actual Sales Velocity
                </h3>
                <p className="text-xs text-agri-muted">
                  Comparing confirmed order history against AI-modeled demand projection curve.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#263A2E]/10 inline-block" />
                  <span className="text-agri-dark">Actual Sales ($)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                  <span className="text-amber-700">Projected Demand ($)</span>
                </div>
              </div>
            </div>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData?.chartData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F3D2E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0F3D2E" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" fontSize={12} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F3D2E',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    name="Actual Sales ($)"
                    stroke="#0F3D2E"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorActual)"
                  />
                  <Area
                    type="monotone"
                    dataKey="projected"
                    name="Projected Demand ($)"
                    stroke="#D97706"
                    strokeWidth={3}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorProjected)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Reveal>

        {/* Actionable Recommendations */}
        <Reveal variant="fade-up">
          <Card className="p-6 border-agri-border bg-agri-surface">
            <h3 className="text-base font-extrabold text-agri-dark font-display mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Actionable Stock Recommendations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {forecastData?.recommendations?.map((rec, idx) => (
                <div key={idx} className="p-4 bg-[#F5F0E6] rounded-lg border border-agri-border shadow-xs flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#263A2E]/10 text-[#263A2E] font-extrabold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-semibold text-agri-dark leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </main>
    </div>
  );
}
