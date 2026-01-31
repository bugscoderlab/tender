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
  totalBids: number;
  averageBidsPerTender: number;
  averageBidAmount: number;
  lowestBidReceived: number;
  highestBidReceived: number;
  pendingBids: number;
  approvedBids: number;
  rejectedBids: number;
  tendersByServiceType: Record<string, number>;
  bidsByMonth: Array<{ month: string; count: number }>;
  topBidders: Array<{ company: string; bidCount: number }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<TenderAnalytics>({
    totalTenders: 0,
    openTenders: 0,
    closedTenders: 0,
    totalBids: 0,
    averageBidsPerTender: 0,
    averageBidAmount: 0,
    lowestBidReceived: 0,
    highestBidReceived: 0,
    pendingBids: 0,
    approvedBids: 0,
    rejectedBids: 0,
    tendersByServiceType: {},
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

      // Get user ID
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      const userId = payload.sub;

      // Fetch all tenders
      const tendersResponse = await fetch("http://localhost:8000/tenders/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (tendersResponse.ok) {
        const allTenders = await tendersResponse.json();
        const myTenders = allTenders.filter((t: any) => String(t.user_id) === String(userId));

        // Fetch bids for all tenders
        const bidsPromises = myTenders.map((tender: any) =>
          fetch(`http://localhost:8000/bids/tender/${tender.id}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }).then(res => res.ok ? res.json() : [])
        );

        const bidsArrays = await Promise.all(bidsPromises);
        const allBids = bidsArrays.flat();

        // Calculate analytics
        const openTenders = myTenders.filter((t: any) => t.status === 'open').length;
        const closedTenders = myTenders.filter((t: any) => t.status === 'closed').length;
        
        const bidAmounts = allBids.map((b: any) => b.proposed_amount);
        const avgBidAmount = bidAmounts.length > 0 
          ? bidAmounts.reduce((sum: number, amt: number) => sum + amt, 0) / bidAmounts.length 
          : 0;
        
        const lowestBid = bidAmounts.length > 0 ? Math.min(...bidAmounts) : 0;
        const highestBid = bidAmounts.length > 0 ? Math.max(...bidAmounts) : 0;

        const pendingBids = allBids.filter((b: any) => b.status === 'pending').length;
        const approvedBids = allBids.filter((b: any) => b.status === 'approved').length;
        const rejectedBids = allBids.filter((b: any) => b.status === 'rejected').length;

        // Group by service type
        const serviceTypes: Record<string, number> = {};
        myTenders.forEach((t: any) => {
          serviceTypes[t.service_type] = (serviceTypes[t.service_type] || 0) + 1;
        });

        // Group bids by month
        const bidsByMonth: Record<string, number> = {};
        allBids.forEach((b: any) => {
          const date = new Date(b.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          bidsByMonth[monthKey] = (bidsByMonth[monthKey] || 0) + 1;
        });

        const bidsByMonthArray = Object.entries(bidsByMonth).map(([month, count]) => ({
          month,
          count
        })).sort((a, b) => a.month.localeCompare(b.month));

        // Top bidders
        const bidderCounts: Record<string, number> = {};
        allBids.forEach((b: any) => {
          bidderCounts[b.company_name] = (bidderCounts[b.company_name] || 0) + 1;
        });

        const topBidders = Object.entries(bidderCounts)
          .map(([company, bidCount]) => ({ company, bidCount }))
          .sort((a, b) => b.bidCount - a.bidCount)
          .slice(0, 10);

        setAnalytics({
          totalTenders: myTenders.length,
          openTenders,
          closedTenders,
          totalBids: allBids.length,
          averageBidsPerTender: myTenders.length > 0 ? allBids.length / myTenders.length : 0,
          averageBidAmount: avgBidAmount,
          lowestBidReceived: lowestBid,
          highestBidReceived: highestBid,
          pendingBids,
          approvedBids,
          rejectedBids,
          tendersByServiceType: serviceTypes,
          bidsByMonth: bidsByMonthArray,
          topBidders
        });
      }
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
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/jmb/dashboard"
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Analytics & Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Insights into your tender performance
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <h4 className="text-2xl font-bold text-brand-500">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Pending Review
          </div>
          <h4 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {analytics.pendingBids}
          </h4>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-yellow-600 h-2 rounded-full" 
              style={{ width: `${analytics.totalBids > 0 ? (analytics.pendingBids / analytics.totalBids) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Approved
          </div>
          <h4 className="text-2xl font-bold text-green-600 dark:text-green-400">
            {analytics.approvedBids}
          </h4>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${analytics.totalBids > 0 ? (analytics.approvedBids / analytics.totalBids) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Rejected
          </div>
          <h4 className="text-2xl font-bold text-red-600 dark:text-red-400">
            {analytics.rejectedBids}
          </h4>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-red-600 h-2 rounded-full" 
              style={{ width: `${analytics.totalBids > 0 ? (analytics.rejectedBids / analytics.totalBids) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tenders by Service Type */}
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
                    className="bg-brand-500 h-2 rounded-full" 
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
                      className="bg-blue-500 h-2 rounded-full" 
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
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-bold">
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
    </div>
  );
}
