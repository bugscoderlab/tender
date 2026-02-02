"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";

interface Bid {
  id: number;
  tender_id: number;
  proposed_amount: number;
  company_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  tender: {
    title: string;
    service_type: string;
    closing_date: string;
  };
}

export default function ContractorMyBidsPage() {
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All Status");

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/sign-in");
        return;
      }

      const response = await fetch("http://localhost:8000/bids/my-bids", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBids(data);
      } else if (response.status === 401) {
        router.push("/auth/sign-in");
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBids = bids.filter((bid) => {
    if (statusFilter === "All Status") return true;
    return bid.status === statusFilter.toLowerCase();
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
      case "approved":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
      case "rejected":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getBidStats = () => {
    const total = bids.length;
    const pending = bids.filter(b => b.status === "pending").length;
    const approved = bids.filter(b => b.status === "approved").length;
    const rejected = bids.filter(b => b.status === "rejected").length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getBidStats();

  return (
    <div className="p-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          My Bids
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track your bid submissions and their status
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Total Bids
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
            {stats.total}
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Pending
          </div>
          <h4 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.pending}
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Approved
          </div>
          <h4 className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.approved}
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Rejected
          </div>
          <h4 className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.rejected}
          </h4>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex justify-between items-center">
        <div className="w-48">
          <select
            className="w-full px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-0 dark:bg-gray-900 dark:border-gray-800 dark:text-white/90"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
        <Link href="/contractor/tenders">
          <Button>Browse Tenders</Button>
        </Link>
      </div>

      {/* Bids List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading your bids...</div>
        ) : filteredBids.length === 0 ? (
          <div className="text-center py-10 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">No bids found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
              {statusFilter === "All Status" 
                ? "You haven't submitted any bids yet."
                : `You don't have any ${statusFilter.toLowerCase()} bids.`}
            </p>
            <Link href="/contractor/tenders">
              <Button>Browse Available Tenders</Button>
            </Link>
          </div>
        ) : (
          filteredBids.map((bid) => (
            <div
              key={bid.id}
              className="p-5 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    {bid.tender.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full dark:bg-blue-950/30 dark:text-blue-400">
                      {bid.tender.service_type}
                    </span>
                    <span>Company: {bid.company_name}</span>
                    <span>Submitted: {formatDate(bid.created_at)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-500 mb-2">
                    {formatCurrency(bid.proposed_amount)}
                  </div>
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(bid.status)}`}>
                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
