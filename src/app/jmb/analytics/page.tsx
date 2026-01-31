"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/icons";
import Button from "@/components/ui/button/Button";

interface TenderAnalytics {
  totalTenders: number;
  openTenders: number;
  closedTenders: number;
  completedOnTime: number;
  totalBids: number;
  responseRate: number;
  averageBidsPerTender: number;
  averageBidAmount: number;
  lowestBidReceived: number;
  highestBidReceived: number;
  pendingBids: number;
  approvedBids: number;
  rejectedBids: number;
  tendersByServiceType: Record<string, number>;
  budgetUtilization: number;
  totalBudgetAllocated: number;
  totalActualSpend: number;
  costSavings: number;
  contractorPerformance: Array<{ name: string; rating: number; completed: number; onTime: number }>;
  bidsByMonth: Array<{ month: string; count: number; avgAmount: number }>;
  topBidders: Array<{ company: string; bidCount: number; avgBid: number; winRate: number }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<TenderAnalytics>({
    totalTenders: 0,
    openTenders: 0,
    closedTenders: 0,
    completedOnTime: 0,
    totalBids: 0,
    responseRate: 0,
    averageBidsPerTender: 0,
    averageBidAmount: 0,
    lowestBidReceived: 0,
    highestBidReceived: 0,
    pendingBids: 0,
    approvedBids: 0,
    rejectedBids: 0,
    tendersByServiceType: {},
    budgetUtilization: 0,
    totalBudgetAllocated: 0,
    totalActualSpend: 0,
    costSavings: 0,
    contractorPerformance: [],
    bidsByMonth: [],
    topBidders: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/sign-in");
        return;
      }

      // Generate mock data for better UX demonstration
      const mockAnalytics: TenderAnalytics = {
        totalTenders: 24,
        openTenders: 6,
        closedTenders: 18,
        completedOnTime: 15,
        totalBids: 142,
        responseRate: 87.5,
        averageBidsPerTender: 5.9,
        averageBidAmount: 125000,
        lowestBidReceived: 45000,
        highestBidReceived: 380000,
        pendingBids: 18,
        approvedBids: 12,
        rejectedBids: 112,
        
        // Budget & Cost Analysis
        totalBudgetAllocated: 2850000,
        totalActualSpend: 2430000,
        budgetUtilization: 85.3,
        costSavings: 420000,
        
        // Service Type Distribution
        tendersByServiceType: {
          "Security Services": 8,
          "Cleaning & Maintenance": 6,
          "Landscaping": 4,
          "Lift Maintenance": 3,
          "Pest Control": 2,
          "Fire Safety": 1
        },
        
        // Contractor Performance
        contractorPerformance: [
          { name: "SecureGuard Solutions", rating: 4.8, completed: 5, onTime: 5 },
          { name: "CleanPro Services", rating: 4.6, completed: 4, onTime: 3 },
          { name: "GreenScape Landscaping", rating: 4.9, completed: 3, onTime: 3 },
          { name: "LiftTech Maintenance", rating: 4.5, completed: 3, onTime: 2 },
          { name: "SafeGuard Security", rating: 4.2, completed: 2, onTime: 2 }
        ],
        
        // Bid Activity Over Time
        bidsByMonth: [
          { month: "2026-01", count: 32, avgAmount: 128000 },
          { month: "2025-12", count: 28, avgAmount: 118000 },
          { month: "2025-11", count: 24, avgAmount: 125000 },
          { month: "2025-10", count: 30, avgAmount: 132000 },
          { month: "2025-09", count: 18, avgAmount: 115000 },
          { month: "2025-08", count: 10, avgAmount: 108000 }
        ],
        
        // Top Bidders with Performance
        topBidders: [
          { company: "SecureGuard Solutions", bidCount: 15, avgBid: 145000, winRate: 33.3 },
          { company: "CleanPro Services", bidCount: 12, avgBid: 98000, winRate: 33.3 },
          { company: "GreenScape Landscaping", bidCount: 11, avgBid: 125000, winRate: 27.3 },
          { company: "LiftTech Maintenance", bidCount: 10, avgBid: 168000, winRate: 30.0 },
          { company: "SafeGuard Security", bidCount: 9, avgBid: 152000, winRate: 22.2 }
        ]
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Analytics & Reports
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400">
          Insights into your tender performance
        </p>
      </div>

      {analytics.totalTenders === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No tenders yet. Create your first tender to see analytics.</p>
          <Link href="/jmb/create-tender">
            <Button>Create Tender</Button>
          </Link>
        </div>
      ) : (
        <>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Total Tenders
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
            {analytics.totalTenders}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {analytics.openTenders} open, {analytics.closedTenders} closed
          </p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Total Bids Received
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
            {analytics.totalBids}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Avg: {analytics.averageBidsPerTender.toFixed(1)} per tender
          </p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Average Bid Amount
          </div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            {formatCurrency(analytics.averageBidAmount)}
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Bid Range
          </div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-white">
            {formatCurrency(analytics.lowestBidReceived)} - {formatCurrency(analytics.highestBidReceived)}
          </h4>
        </div>
      </div>

      {/* Bid Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Pending Review
          </div>
          <h4 className="text-3xl font-bold text-gray-800 dark:text-white">
            {analytics.pendingBids}
          </h4>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-amber-500 dark:bg-amber-400 h-2 rounded-full" 
              style={{ width: `${analytics.totalBids > 0 ? (analytics.pendingBids / analytics.totalBids) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Approved
          </div>
          <h4 className="text-3xl font-bold text-gray-800 dark:text-white">
            {analytics.approvedBids}
          </h4>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-emerald-500 dark:bg-emerald-400 h-2 rounded-full" 
              style={{ width: `${analytics.totalBids > 0 ? (analytics.approvedBids / analytics.totalBids) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Rejected
          </div>
          <h4 className="text-3xl font-bold text-gray-800 dark:text-white">
            {analytics.rejectedBids}
          </h4>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-rose-500 dark:bg-rose-400 h-2 rounded-full" 
              style={{ width: `${analytics.totalBids > 0 ? (analytics.rejectedBids / analytics.totalBids) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tenders by Service Type */}
      {Object.keys(analytics.tendersByServiceType).length > 0 && (
      <div className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Tenders by Service Type
        </h3>
        <div className="space-y-3">
          {Object.entries(analytics.tendersByServiceType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
                  {type}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full" 
                    style={{ width: `${(count / analytics.totalTenders) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-white ml-4">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Bids Over Time */}
      {analytics.bidsByMonth.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Bid Activity Over Time
          </h3>
          <div className="space-y-3">
            {analytics.bidsByMonth.map(({ month, count }) => (
              <div key={month} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                    {formatMonth(month)}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div 
                      className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full" 
                      style={{ 
                        width: `${(count / Math.max(...analytics.bidsByMonth.map(b => b.count))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white ml-4">
                  {count} bids
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Bidders */}
      {analytics.topBidders.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Most Active Bidders
          </h3>
          <div className="space-y-3">
            {analytics.topBidders.map(({ company, bidCount }, index) => (
              <div key={company} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {company}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white">
                  {bidCount} {bidCount === 1 ? 'bid' : 'bids'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
