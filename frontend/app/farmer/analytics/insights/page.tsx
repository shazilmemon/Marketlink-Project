'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Reveal, StaggerContainer } from '../../../../components/motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BrainCircuit,
  Clock,
  Users,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  ThumbsUp,
  MessageSquareQuote,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function FarmerAnalyticsInsightsPage() {
  const [activeTab, setActiveTab] = useState('analytics');

  const vendorMetrics = {
    avgProcessingTime: '18 mins',
    processingTimeDelta: '12% faster than regional avg',
    customerRetention: '78%',
    retentionSubtext: '42 repeat buyers this month',
    ratingTrend: '4.9 / 5.0',
    ratingReviewsCount: '128 verified reviews',
  };

  const aiInsights = [
    {
      id: 'ins-1',
      title: 'Order Cutoff Optimization',
      impact: 'High Impact (+15% completions)',
      badgeVariant: 'amber' as const,
      description:
        'Your pre-order cutoff time of 8 AM reduces pickup completion by 15%. Consider extending to 10 AM on Sunday mornings.',
      actionText: 'Update Cutoff to 10 AM',
    },
    {
      id: 'ins-2',
      title: 'Surplus Harvest Bundling',
      impact: 'Medium Impact (+12% revenue)',
      badgeVariant: 'emerald' as const,
      description:
        'Customers frequently buy Heirloom Tomatoes together with Fresh Honeycrisp Apples. Creating a weekend bundle can increase average basket size by $8.50.',
      actionText: 'Create Weekly Produce Bundle',
    },
    {
      id: 'ins-3',
      title: 'Stall Pickup Window Alignment',
      impact: 'High Retention',
      badgeVariant: 'emerald' as const,
      description:
        '72% of customer pickups occur between 11 AM and 1 PM. Ensuring stall restocking before 11 AM will eliminate customer wait times.',
      actionText: 'Adjust Slot Allocation',
    },
  ];

  const sentimentData = [
    { sentiment: 'Freshness & Quality', score: 94, count: 86 },
    { sentiment: 'Pickup Speed', score: 88, count: 72 },
    { sentiment: 'Packaging & Eco-Friendly', score: 92, count: 68 },
    { sentiment: 'Pricing Value', score: 85, count: 54 },
  ];

  const weeklyOrderVolume = [
    { week: 'Week 1', orders: 42, revenue: 840 },
    { week: 'Week 2', orders: 58, revenue: 1160 },
    { week: 'Week 3', orders: 64, revenue: 1380 },
    { week: 'Week 4', orders: 79, revenue: 1680 },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      <Sidebar role="FARMER" activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col gap-6">
        {/* Header Banner */}
        <Reveal variant="fade-down">
          <div className="rounded-md bg-agri-dark text-[#F5F0E6] p-6 sm:p-8 shadow-card border border-agri-dark/40 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-[#263A2E]/10 text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-glow">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="emerald" icon={<Sparkles className="w-3.5 h-3.5" />} className="bg-[#263A2E]/10 text-[#263A2E] font-bold">
                      Smart Vendor AI Analytics
                    </Badge>
                    <span className="text-xs text-agri-cream/80 font-medium">Executive Intelligence Report</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#F5F0E6]">
                    Vendor Performance &amp; Revenue Insights
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-200 mt-1">
                    Real-time operational efficiency metrics, customer sentiment summary, and automated growth recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Executive KPI Metrics */}
        <StaggerContainer staggerDelay={80} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 border-agri-border animated-card-lift">
            <CardHeader className="p-0 pb-2 flex flex-row justify-between items-center">
              <CardDescription className="text-xs font-bold text-agri-muted uppercase">
                Avg Order Processing Time
              </CardDescription>
              <Clock className="w-4 h-4 text-[#263A2E]" />
            </CardHeader>
            <CardContent className="p-0">
              <CardTitle className="text-3xl font-black text-agri-dark">
                {vendorMetrics.avgProcessingTime}
              </CardTitle>
              <span className="text-xs text-[#263A2E] font-semibold mt-1 inline-block">
                â†‘ {vendorMetrics.processingTimeDelta}
              </span>
            </CardContent>
          </Card>

          <Card className="p-5 border-agri-border animated-card-lift">
            <CardHeader className="p-0 pb-2 flex flex-row justify-between items-center">
              <CardDescription className="text-xs font-bold text-agri-muted uppercase">
                Customer Retention Rate
              </CardDescription>
              <Users className="w-4 h-4 text-[#263A2E]" />
            </CardHeader>
            <CardContent className="p-0">
              <CardTitle className="text-3xl font-black text-agri-dark">
                {vendorMetrics.customerRetention}
              </CardTitle>
              <span className="text-xs text-agri-muted font-medium mt-1 inline-block">
                {vendorMetrics.retentionSubtext}
              </span>
            </CardContent>
          </Card>

          <Card className="p-5 border-agri-border animated-card-lift">
            <CardHeader className="p-0 pb-2 flex flex-row justify-between items-center">
              <CardDescription className="text-xs font-bold text-agri-muted uppercase">
                Rating &amp; Reputation Trend
              </CardDescription>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </CardHeader>
            <CardContent className="p-0">
              <CardTitle className="text-3xl font-black text-agri-dark">
                {vendorMetrics.ratingTrend}
              </CardTitle>
              <span className="text-xs text-amber-700 font-semibold mt-1 inline-block">
                Based on {vendorMetrics.ratingReviewsCount}
              </span>
            </CardContent>
          </Card>
        </StaggerContainer>

        {/* Actionable AI Insights */}
        <Reveal variant="fade-up">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-agri-dark font-display flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" /> Actionable AI Operational Insights
              </h3>
              <Badge variant="emerald">3 New Insights</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {aiInsights.map((insight) => (
                <Card key={insight.id} className="p-6 border-agri-border shadow-xs flex flex-col justify-between animated-card-lift">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={insight.badgeVariant}>{insight.impact}</Badge>
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <h4 className="font-extrabold text-base text-agri-dark mb-2">{insight.title}</h4>
                    <p className="text-xs text-agri-muted leading-relaxed mb-4">{insight.description}</p>
                  </div>
                  <Button variant="emerald" size="sm" className="w-full font-bold text-xs">
                    {insight.actionText}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Customer Sentiment Breakdown & Weekly Volume Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sentiment Breakdown */}
          <Reveal variant="fade-up">
            <Card className="p-6 border-agri-border h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-extrabold text-agri-dark font-display flex items-center gap-2">
                    <MessageSquareQuote className="w-5 h-5 text-[#263A2E]" /> Customer Sentiment Breakdown
                  </h3>
                  <Badge variant="emerald">88% Positive</Badge>
                </div>
                <p className="text-xs text-agri-muted mb-6">
                  Extracted from customer pre-order reviews and stall pickup feedback.
                </p>

                <div className="flex flex-col gap-4">
                  {sentimentData.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-agri-dark">{item.sentiment}</span>
                        <span className="text-[#263A2E]">{item.score}% Satisfied ({item.count} mentions)</span>
                      </div>
                      <div className="w-full h-2.5 bg-agri-surface rounded-full overflow-hidden border border-agri-border">
                        <div
                          className="h-full bg-agri-dark rounded-full transition-all duration-500"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-3 bg-[#263A2E]/10 rounded-lg border border-emerald-200 text-xs font-bold text-[#263A2E] flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-[#263A2E] shrink-0" />
                <span>Customers praise produce freshness and organic certification standard!</span>
              </div>
            </Card>
          </Reveal>

          {/* Weekly Order Volume Bar Chart */}
          <Reveal variant="fade-up">
            <Card className="p-6 border-agri-border shadow-card h-full flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-agri-dark font-display mb-1">
                  Weekly Pre-Order Volume Growth
                </h3>
                <p className="text-xs text-agri-muted mb-4">
                  Rolling 4-week completed pickup order counts.
                </p>

                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyOrderVolume}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="week" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F3D2E',
                          borderRadius: '12px',
                          color: '#fff',
                          border: 'none',
                        }}
                      />
                      <Bar dataKey="orders" name="Orders" fill="#0F3D2E" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="text-xs text-center text-[#263A2E] font-bold bg-agri-surface py-2 rounded-md border border-agri-border mt-2">
                Revenue grew by +38% over the past 4 weeks
              </div>
            </Card>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
