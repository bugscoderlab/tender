"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileIcon,
  CheckCircleIcon,
  TimeIcon,
  ListIcon,
  DocsIcon,
} from "@/icons/index";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import StatCard from "@/components/shared/StatCard";
import ActionCard from "@/components/shared/ActionCard";
import { API_BASE_URL } from "@/config";

interface Tender {
  id: number;
  title: string;
  service_type: string;
  property_name: string;
  closing_date: string;
  status: string;
  min_budget?: number;
  max_budget?: number;
}

interface Bid {
  id: number;
  tender_id: number;
  proposed_amount: number;
  status: string;
  created_at: string;
  tender: {
    title: string;
    service_type: string;
  };
}

export default function ContractorDashboard() {
  const router = useRouter();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/sign-in");
        return;
      }

      // Fetch available tenders
      const tendersResponse = await fetch(`${API_BASE_URL}/tenders/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (tendersResponse.ok) {
        const data = await tendersResponse.json();
        const openTenders = data.filter((t: any) => 
          t.status === 'open' && t.approval_status === 'approved'
        );
        setTenders(openTenders.slice(0, 5));
      }

      // Fetch my bids
      const bidsResponse = await fetch(`${API_BASE_URL}/bids/my-bids`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (bidsResponse.ok) {
        const bidsData = await bidsResponse.json();
        setBids(bidsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBidStats = () => {
    const total = bids.length;
    const pending = bids.filter(b => b.status === "pending").length;
    const approved = bids.filter(b => b.status === "approved").length;
    return { total, pending, approved };
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return `RM ${amount.toLocaleString()}`;
  };

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

  const stats = getBidStats();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400">
          Browse available tenders and track your bids
        </p>
      </div>

      {/* Action Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <ActionCard
          title="Browse Tenders"
          description="Find and apply for new opportunities"
          icon={<ListIcon className="w-7 h-7" />}
          href="/contractor/tenders"
          color="purple"
        />
        <ActionCard
          title="My Bids"
          description="Track your submitted bids"
          icon={<DocsIcon className="w-7 h-7" />}
          href="/contractor/my-bids"
          color="green"
        />
        <ActionCard
          title="Available Tenders"
          description={`${tenders.length} open tenders to explore`}
          icon={<FileIcon className="w-7 h-7" />}
          href="/contractor/tenders"
          color="blue"
        />
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Bids"
          value={stats.total}
          icon={<FileIcon className="w-6 h-6" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<TimeIcon className="w-6 h-6" />}
          color="yellow"
          loading={loading}
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Available Tenders"
          value={tenders.length}
          icon={<ListIcon className="w-6 h-6" />}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Recent Bids */}
      <div className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Recent Bids
          </h3>
          <Link href="/contractor/my-bids">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : bids.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-3">
                <FileIcon className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">No bids yet</p>
              <Link href="/contractor/tenders">
                <Button>Browse Tenders</Button>
              </Link>
            </div>
          ) : (
            bids.slice(0, 3).map((bid) => (
              <div key={bid.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                      {bid.tender.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full dark:bg-blue-950/30 dark:text-blue-400">
                        {bid.tender.service_type}
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">{formatCurrency(bid.proposed_amount)}</span>
                    </div>
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(bid.status)}`}>
                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Latest Tenders */}
      <div className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Latest Tenders
          </h3>
          <Link href="/contractor/tenders">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-4 text-gray-500">Loading tenders...</div>
          ) : tenders.length === 0 ? (
             <div className="text-center py-4 text-gray-500">No open tenders available.</div>
          ) : (
            tenders.map((tender) => (
              <Link href={`/contractor/tenders/${tender.id}`} key={tender.id} className="block">
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                        {tender.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {tender.property_name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>Deadline: {new Date(tender.closing_date).toLocaleDateString()}</span>
                        <span>{formatCurrency(tender.min_budget)} - {formatCurrency(tender.max_budget)}</span>
                      </div>
                    </div>
                    <Badge variant="light" color="light">
                      {tender.service_type}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
